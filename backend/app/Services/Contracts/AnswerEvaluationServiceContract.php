<?php

namespace App\Services\Contracts;

interface AnswerEvaluationServiceContract
{
    /**
     * Evaluate a free-text student answer against the known correct answer(s) using AI.
     *
     * @param string      $questionTitle  The question text.
     * @param string|null $explanation    Optional explanation/context for the question.
     * @param array       $correctAnswers The list of accepted correct answer texts.
     * @param string      $studentAnswer  The student's submitted free-text answer.
     *
     * @return array{is_correct: bool, confidence: float, reasoning: string}
     */
    public function evaluate(
        string $questionTitle,
        ?string $explanation,
        array $correctAnswers,
        string $studentAnswer,
    ): array;
}
