<?php

namespace App\Services;

use App\Agents\AnswerEvaluationAgent;
use App\Services\Contracts\AnswerEvaluationServiceContract;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class AnswerEvaluationService implements AnswerEvaluationServiceContract
{
    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function evaluate(
        string $questionTitle,
        ?string $explanation,
        array $correctAnswers,
        string $studentAnswer,
    ): array {
        try {
            $agent = AnswerEvaluationAgent::make(
                questionTitle: $questionTitle,
                explanation: $explanation,
                correctAnswers: $correctAnswers,
            );

            $response = $agent->prompt(
                prompt: "Student answer: {$studentAnswer}",
            );

            return [
                'is_correct' => (bool) ($response->structured['is_correct'] ?? false),
                'confidence' => (float) ($response->structured['confidence'] ?? 0.0),
                'reasoning' => (string) ($response->structured['reasoning'] ?? ''),
            ];
        } catch (Throwable $e) {
            Log::error(message: 'AI answer evaluation failed', context: [
                'question' => $questionTitle,
                'student_answer' => $studentAnswer,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException(message: 'Answer evaluation failed: ' . $e->getMessage(), previous: $e);
        }
    }
}
