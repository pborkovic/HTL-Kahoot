<?php

namespace App\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('ollama')]
#[Model('llama3.2:3b')]
#[Timeout(60)]
class AnswerEvaluationAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        private readonly string $questionTitle,
        private readonly ?string $explanation,
        private readonly array $correctAnswers,
    ) {}

    public function instructions(): Stringable|string
    {
        $correctList = implode(separator: '; ', array: $this->correctAnswers);
        $explanationPart = $this->explanation
            ? "\nExplanation/context: {$this->explanation}"
            : '';

        return <<<INSTRUCTIONS
        You are a strict but fair quiz answer evaluator for an educational quiz platform.

        Your job is to determine whether a student's free-text answer is correct by comparing it to the known correct answer(s).

        Question: {$this->questionTitle}{$explanationPart}
        Correct answer(s): {$correctList}

        Evaluation rules:
        - The student answer does NOT need to match word-for-word.
        - Accept synonyms, rephrasings, and spelling mistakes.
        - Accept answers in any language if the meaning is correct.
        - Reject answers that are clearly wrong.
        - If the correct answer is a number or date, only accept exact it with a 15 percent tolerance range.

        Respond with structured output only.
        INSTRUCTIONS;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'is_correct' => $schema->boolean()->required()->description('Whether the student answer is correct'),
            'confidence' => $schema->number()->required()->description('Confidence score between 0.0 and 1.0'),
            'reasoning' => $schema->string()->required()->description('Brief explanation of why the answer is correct or incorrect'),
        ];
    }
}
