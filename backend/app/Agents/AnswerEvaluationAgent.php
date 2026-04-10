<?php

declare(strict_types=1);

namespace App\Agents;

use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * AI agent that evaluates free-text quiz answers.
 *
 * Uses a simple YES/NO prompt instead of structured output
 * for reliable results with small language models (Llama 3.2 3B).
 *
 * @author Philipp Borkovic
 */
#[Provider('ollama')]
#[Model('llama3.2:3b')]
#[Timeout(60)]
class AnswerEvaluationAgent implements Agent
{
    use Promptable;

    public function __construct(
        private readonly string $questionTitle,
        private readonly ?string $explanation,
        private readonly array $correctAnswers,
    ) {
    }

    /**
     * Build the system instructions for the evaluation.
     *
     * @return Stringable|string The system prompt.
     *
     * @author Philipp Borkovic
     */
    public function instructions(): Stringable|string
    {
        $correctList = implode(separator: '; ', array: $this->correctAnswers);
        $explanationPart = $this->explanation
            ? "\nContext: {$this->explanation}"
            : '';

        return <<<INSTRUCTIONS
        You are a generous quiz answer evaluator for an educational platform.

        Question: {$this->questionTitle}{$explanationPart}
        Correct answer(s): {$correctList}

        Rules:
        - Accept synonyms, rephrasings, abbreviations, informal language, spelling mistakes, any language.
        - Accept short answers that capture the key concept.
        - Only reject if factually wrong, completely off-topic, or misses the essential point entirely.
        - For numbers or dates, accept within 15% tolerance.

        You MUST reply with exactly one word: YES or NO
        INSTRUCTIONS;
    }
}
