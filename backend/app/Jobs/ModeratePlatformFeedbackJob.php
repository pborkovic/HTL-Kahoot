<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\PlatformFeedback;
use App\Services\Contracts\FeedbackModerationServiceContract;
use App\Services\Contracts\PlatformFeedbackServiceContract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Run the local AI moderator over a {@see PlatformFeedback} record.
 *
 * Dispatched right after submission so the submitting user gets an instant
 * response while the AI analysis runs in the background on the Ollama worker.
 *
 * @package App\Jobs
 */
class ModeratePlatformFeedbackJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 120;

    public function __construct(
        private readonly string $feedbackId,
    ) {}

    /**
     * Execute the job.
     *
     * Looks up the feedback record via the service layer, runs the moderator,
     * and persists the verdict through the service. If the record has been
     * deleted in the meantime the job is a no-op. Any exception from the
     * moderator is caught and the record is admitted by default.
     *
     * @param FeedbackModerationServiceContract $moderator       The AI moderator.
     * @param PlatformFeedbackServiceContract   $feedbackService Service used to read and update the record.
     *
     * @author Philipp Borkovic
     */
    public function handle(
        FeedbackModerationServiceContract $moderator,
        PlatformFeedbackServiceContract $feedbackService,
    ): void {
        $feedback = $feedbackService->findById(id: $this->feedbackId);

        if ($feedback === null) {
            Log::warning(message: 'ModeratePlatformFeedbackJob: feedback not found', context: [
                'feedback_id' => $this->feedbackId,
            ]);

            return;
        }

        try {
            $verdict = $moderator->moderate(message: $feedback->message);

            $feedbackService->applyModerationVerdict(
                feedback: $feedback,
                isConstructive: $verdict['is_constructive'],
                reason: $verdict['reason'],
            );
        } catch (Throwable $e) {
            Log::error(message: 'ModeratePlatformFeedbackJob: moderation failed, admitting by default', context: [
                'feedback_id' => $this->feedbackId,
                'error'       => $e->getMessage(),
            ]);

            $feedbackService->applyModerationVerdict(
                feedback: $feedback,
                isConstructive: true,
                reason: 'AI moderation unavailable; admitted by default.',
            );
        }
    }
}
