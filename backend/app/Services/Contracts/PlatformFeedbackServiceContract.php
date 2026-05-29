<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\PlatformFeedback;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Contract for the platform feedback service layer.
 */
interface PlatformFeedbackServiceContract
{
    /**
     * Submit a new piece of feedback for the given user.
     *
     * The implementation must run the AI moderator before persisting and
     * store both the verdict and the reason on the resulting record.
     *
     * @param  User  $user  The submitting user.
     * @param  string  $message  The feedback text.
     * @return PlatformFeedback The persisted feedback record.
     */
    public function submit(User $user, string $message): PlatformFeedback;

    /**
     * List all feedback submitted by the given user, newest first.
     *
     * @param  User  $user  The user whose feedback to fetch.
     * @return Collection<int, PlatformFeedback>
     */
    public function listForUser(User $user): Collection;

    /**
     * Paginate constructive feedback for the admin dashboard.
     *
     * @param  string|null  $status  One of "open", "solved", or null for all.
     * @param  int  $page  The 1-indexed page number.
     * @param  int  $perPage  The page size.
     */
    public function paginateForAdmin(?string $status, int $page, int $perPage): LengthAwarePaginator;

    /**
     * Mark a piece of feedback as resolved by the given admin user.
     *
     * @param  PlatformFeedback  $feedback  The feedback to resolve.
     * @param  User  $admin  The admin user resolving it.
     * @return PlatformFeedback The refreshed record.
     */
    public function markResolved(PlatformFeedback $feedback, User $admin): PlatformFeedback;

    /**
     * Find a feedback record by its UUID.
     *
     * @param  string  $id  The feedback UUID.
     */
    public function findById(string $id): ?PlatformFeedback;

    /**
     * Persist the result of the AI moderation run for a feedback record.
     *
     * @param  PlatformFeedback  $feedback  The feedback being moderated.
     * @param  bool  $isConstructive  Whether the moderator classified the message as constructive.
     * @param  string|null  $reason  Optional moderator reason.
     * @return PlatformFeedback The refreshed record.
     */
    public function applyModerationVerdict(
        PlatformFeedback $feedback,
        bool $isConstructive,
        ?string $reason,
    ): PlatformFeedback;

    /**
     * Reopen a previously resolved piece of feedback.
     *
     * @param  PlatformFeedback  $feedback  The feedback to reopen.
     * @return PlatformFeedback The refreshed record.
     */
    public function reopen(PlatformFeedback $feedback): PlatformFeedback;

    /**
     * Count feedback entries that have not been resolved yet.
     */
    public function countOpen(): int;

    /**
     * Count feedback entries that have been resolved.
     */
    public function countResolved(): int;
}
