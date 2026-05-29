<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\ModeratePlatformFeedbackJob;
use App\Models\PlatformFeedback;
use App\Models\User;
use App\Repositories\Contracts\PlatformFeedbackRepositoryContract;
use App\Services\Contracts\PlatformFeedbackServiceContract;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Default {@see PlatformFeedbackServiceContract} implementation.
 */
class PlatformFeedbackService implements PlatformFeedbackServiceContract
{
    public function __construct(
        private readonly PlatformFeedbackRepositoryContract $repository,
    ) {
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function submit(User $user, string $message): PlatformFeedback
    {
        try {
            $feedback = $this->repository->create(data: [
                'user_id' => $user->id,
                'message' => $message,
                'is_constructive' => false,
                'moderation_status' => 'pending',
                'moderation_reason' => null,
            ]);

            ModeratePlatformFeedbackJob::dispatch($feedback->id);

            return $feedback->fresh(with: ['author']) ?? $feedback;
        } catch (Exception $e) {
            Log::error(message: "Service error submitting platform feedback: {$e->getMessage()}", context: [
                'service' => self::class,
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function listForUser(User $user): Collection
    {
        try {
            return $this->repository->listForUser(userId: $user->id);
        } catch (Exception $e) {
            Log::error(message: "Service error listing platform feedback for user: {$e->getMessage()}", context: [
                'service' => self::class,
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function paginateForAdmin(?string $status, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->repository->paginateForAdmin(
            status: $status,
            page: $page,
            perPage: $perPage,
        );
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function markResolved(PlatformFeedback $feedback, User $admin): PlatformFeedback
    {
        try {
            $feedback->update(attributes: [
                'resolved_at' => now(),
                'resolved_by' => $admin->id,
            ]);

            return $feedback->fresh(with: ['author', 'resolver']) ?? $feedback;
        } catch (Exception $e) {
            Log::error(message: "Service error resolving platform feedback: {$e->getMessage()}", context: [
                'service' => self::class,
                'feedback_id' => $feedback->id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findById(string $id): ?PlatformFeedback
    {
        try {
            $feedback = $this->repository->find(id: $id);

            return $feedback;
        } catch (Exception $e) {
            Log::error(message: "Service error finding platform feedback: {$e->getMessage()}", context: [
                'service' => self::class,
                'feedback_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function applyModerationVerdict(
        PlatformFeedback $feedback,
        bool $isConstructive,
        ?string $reason,
    ): PlatformFeedback {
        try {
            $updated = $this->repository->update(id: $feedback->id, data: [
                'is_constructive' => $isConstructive,
                'moderation_reason' => $reason,
                'moderation_status' => $isConstructive ? 'approved' : 'rejected',
            ]);

            return $updated;
        } catch (Exception $e) {
            Log::error(message: "Service error applying moderation verdict: {$e->getMessage()}", context: [
                'service' => self::class,
                'feedback_id' => $feedback->id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function reopen(PlatformFeedback $feedback): PlatformFeedback
    {
        try {
            $feedback->update(attributes: [
                'resolved_at' => null,
                'resolved_by' => null,
            ]);

            return $feedback->fresh(with: ['author', 'resolver']) ?? $feedback;
        } catch (Exception $e) {
            Log::error(message: "Service error reopening platform feedback: {$e->getMessage()}", context: [
                'service' => self::class,
                'feedback_id' => $feedback->id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countOpen(): int
    {
        return $this->repository->countOpen();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countResolved(): int
    {
        return $this->repository->countResolved();
    }
}
