<?php

declare(strict_types=1);

namespace App\Services;

use App\Agents\AnswerEvaluationAgent;
use App\Services\Contracts\AnswerEvaluationServiceContract;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class AnswerEvaluationService implements AnswerEvaluationServiceContract
{
    /**
     * {@inheritDoc}
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

            $raw = trim(string: $response->text);
            $parsed = strtoupper(string: $raw);
            $isCorrect = str_starts_with(haystack: $parsed, needle: 'YES');

            Log::info(message: 'AI evaluation response', context: [
                'question' => $questionTitle,
                'student_answer' => $studentAnswer,
                'raw_response' => $raw,
                'is_correct' => $isCorrect,
            ]);

            return [
                'is_correct' => $isCorrect,
                'confidence' => $isCorrect ? 1.0 : 0.0,
                'reasoning' => $raw,
            ];
        } catch (Throwable $e) {
            Log::error(message: 'AI answer evaluation failed', context: [
                'question' => $questionTitle,
                'student_answer' => $studentAnswer,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException(message: 'Answer evaluation failed: '.$e->getMessage(), previous: $e);
        }
    }
}
