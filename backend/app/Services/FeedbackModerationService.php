<?php

declare(strict_types=1);

namespace App\Services;

use App\Agents\FeedbackModerationAgent;
use App\Services\Contracts\FeedbackModerationServiceContract;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Default {@see FeedbackModerationServiceContract} implementation backed by
 * the local Ollama AI model via {@see FeedbackModerationAgent}.
 */
class FeedbackModerationService implements FeedbackModerationServiceContract
{
    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function moderate(string $message): array
    {
        try {
            $agent = FeedbackModerationAgent::make();

            $response = $agent->prompt(
                prompt: "Feedback message:\n{$message}",
            );

            $raw = trim(string: $response->text);

            return $this->parseResponse(raw: $raw);
        } catch (Throwable $e) {
            Log::error(message: 'AI feedback moderation failed', context: [
                'service' => self::class,
                'error' => $e->getMessage(),
            ]);

            return [
                'is_constructive' => true,
                'reason' => 'AI moderation unavailable; admitted by default.',
            ];
        }
    }

    /**
     * Parse the raw two-line VERDICT/REASON response from the agent.
     *
     * @param  string  $raw  The raw model output.
     * @return array{is_constructive: bool, reason: string}
     *
     * @author Philipp Borkovic
     */
    private function parseResponse(string $raw): array
    {
        $upper = strtoupper(string: $raw);
        $isConstructive = str_contains(haystack: $upper, needle: 'VERDICT: CONSTRUCTIVE')
            || (
                str_contains(haystack: $upper, needle: 'CONSTRUCTIVE')
                && ! str_contains(haystack: $upper, needle: 'NOT_CONSTRUCTIVE')
                && ! str_contains(haystack: $upper, needle: 'NOT CONSTRUCTIVE')
            );

        $reason = '';

        if (preg_match(pattern: '/REASON:\s*(.+)$/im', subject: $raw, matches: $matches) === 1) {
            $reason = trim(string: $matches[1]);
        }

        if ($reason === '') {
            $reason = $isConstructive
                ? 'Classified as constructive feedback.'
                : 'Classified as non-constructive feedback.';
        }

        return [
            'is_constructive' => $isConstructive,
            'reason' => $reason,
        ];
    }
}
