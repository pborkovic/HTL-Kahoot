<?php

namespace App\Jobs;

use App\Services\Contracts\AnswerEvaluationServiceContract;
use App\Services\Contracts\SessionServiceContract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Evaluate a free-text answer using AI and apply the result.
 *
 * Dispatched as a background job so the quiz flow is not blocked
 * by the AI inference latency. The job calls the AnswerEvaluationService
 * to determine correctness, calculates a speed-based score, and delegates
 * persistence to the SessionService.
 */
class EvaluateFreeTextAnswer implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;

    public int $timeout = 120;

    /**
     * Create a new job instance.
     *
     * @param  string  $responseId  The UUID of the response record to update.
     * @param  string  $participantId  The UUID of the session participant.
     * @param  string  $studentAnswer  The student's free-text answer.
     * @param  string  $questionTitle  The question title (used as AI context).
     * @param  string|null  $explanation  The question explanation (used as AI context).
     * @param  array  $correctAnswers  The expected correct answer texts.
     * @param  int  $basePoints  The base points for this question.
     * @param  int  $timeTakenMs  Time the student took to answer in milliseconds.
     * @param  int  $timeLimitSeconds  The question's time limit in seconds.
     */
    public function __construct(
        private readonly string $responseId,
        private readonly string $participantId,
        private readonly string $studentAnswer,
        private readonly string $questionTitle,
        private readonly ?string $explanation,
        private readonly array $correctAnswers,
        private readonly int $basePoints,
        private readonly int $timeTakenMs,
        private readonly int $timeLimitSeconds,
    ) {
    }

    /**
     * Execute the job.
     *
     * Evaluates the student's answer via AI, calculates the score,
     * and delegates the database updates to the session service.
     * If AI evaluation fails, the answer is marked as incorrect.
     *
     * @param  AnswerEvaluationServiceContract  $evaluationService  The AI evaluation service.
     * @param  SessionServiceContract  $sessionService  The session service for persistence.
     *
     * @author Philipp Borkovic
     */
    public function handle(
        AnswerEvaluationServiceContract $evaluationService,
        SessionServiceContract $sessionService,
    ): void {
        try {
            $evaluation = $evaluationService->evaluate(
                questionTitle: $this->questionTitle,
                explanation: $this->explanation,
                correctAnswers: $this->correctAnswers,
                studentAnswer: $this->studentAnswer,
            );

            $isCorrect = $evaluation['is_correct'];
        } catch (Throwable $e) {
            Log::error(message: 'EvaluateFreeTextAnswer: AI evaluation failed, marking as incorrect', context: [
                'response_id' => $this->responseId,
                'error' => $e->getMessage(),
            ]);

            $isCorrect = false;
        }

        $scoreAwarded = $this->calculateScore(isCorrect: $isCorrect);

        $sessionService->applyFreeTextEvaluation(
            responseId: $this->responseId,
            participantId: $this->participantId,
            isCorrect: $isCorrect,
            scoreAwarded: $scoreAwarded,
        );
    }

    /**
     * Calculate the score for a free-text answer using the Kahoot-style speed algorithm.
     *
     * Returns 0 for incorrect answers. For correct answers the score
     * is based on the base points scaled by a speed factor:
     *  - Answers within 500 ms receive full base points.
     *  - At the time limit the score is half the base points.
     *  - The speed factor is clamped between 0.5 and 1.0.
     *
     * @param  bool  $isCorrect  Whether the AI judged the answer as correct.
     * @return int The calculated score (excluding streak bonus).
     *
     * @author Philipp Borkovic
     */
    private function calculateScore(bool $isCorrect): int
    {
        if (! $isCorrect) {
            return 0;
        }

        $timeLimitMs = $this->timeLimitSeconds * 1000;

        if ($this->timeTakenMs <= 500) {
            return $this->basePoints;
        }

        $speedFactor = 1 - ($this->timeTakenMs / ($timeLimitMs * 2));
        $speedFactor = max(0.5, min(1.0, $speedFactor));

        return (int) round(num: $this->basePoints * $speedFactor);
    }
}
