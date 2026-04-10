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
 * AI agent that classifies platform feedback as constructive or not.
 *
 * Uses a strict YES/NO + short reason format so small local models
 * (Llama 3.2 3B via Ollama) produce parseable output.
 *
 * @author Philipp Borkovic
 */
#[Provider('ollama')]
#[Model('llama3.2:3b')]
#[Timeout(60)]
class FeedbackModerationAgent implements Agent
{
    use Promptable;

    /**
     * Build the system instructions for the moderator.
     *
     * @return Stringable|string The system prompt.
     *
     * @author Philipp Borkovic
     */
    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
        You are a feedback moderator for an educational quiz platform.

        Classify the user's feedback message as CONSTRUCTIVE or NOT_CONSTRUCTIVE.

        Constructive feedback:
        - Reports a bug, problem, or unexpected behavior
        - Suggests an improvement or new feature
        - Describes a usability issue
        - Asks a reasonable question about the platform
        - Even when negative in tone, points at something specific

        NOT constructive feedback:
        - Pure insults, slurs, or harassment
        - Spam, gibberish, or empty messages
        - Off-topic content unrelated to the platform
        - Threats or hate speech

        Reply with EXACTLY this two-line format and nothing else:
        VERDICT: CONSTRUCTIVE
        REASON: <one short sentence>

        or:
        VERDICT: NOT_CONSTRUCTIVE
        REASON: <one short sentence>
        INSTRUCTIONS;
    }
}
