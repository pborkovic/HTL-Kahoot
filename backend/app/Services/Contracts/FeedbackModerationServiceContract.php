<?php

declare(strict_types=1);

namespace App\Services\Contracts;

/**
 * Contract for the AI-driven platform feedback moderator.
 */
interface FeedbackModerationServiceContract
{
    /**
     * Classify a feedback message as constructive or not.
     *
     * Implementations are expected to never throw — on AI/transport failure
     * they must fall back to a permissive default so feedback is never lost.
     *
     * @param  string  $message  The raw feedback text submitted by the user.
     * @return array{is_constructive: bool, reason: string} The classification result.
     */
    public function moderate(string $message): array;
}
