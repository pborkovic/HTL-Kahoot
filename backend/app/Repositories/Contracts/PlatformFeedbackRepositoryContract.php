<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\PlatformFeedback;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Contract for the PlatformFeedback repository.
 *
 * Provides admin-facing pagination filtered by resolution status, in addition
 * to all standard CRUD operations inherited from BaseRepositoryContract.
 */
interface PlatformFeedbackRepositoryContract extends BaseRepositoryContract
{
    /**
     * Paginate constructive feedback for the admin dashboard.
     *
     * @param  string|null  $status  One of "open", "solved", or null for all constructive entries.
     * @param  int  $page  The 1-indexed page number.
     * @param  int  $perPage  The page size.
     */
    public function paginateForAdmin(?string $status, int $page, int $perPage): LengthAwarePaginator;

    /**
     * Fetch all feedback entries submitted by the given user, newest first.
     *
     * @param  string  $userId  The submitting user's UUID.
     * @return Collection<int, PlatformFeedback>
     */
    public function listForUser(string $userId): Collection;

    /**
     * Count feedback entries that have not been resolved yet.
     */
    public function countOpen(): int;

    /**
     * Count feedback entries that have been resolved.
     */
    public function countResolved(): int;
}
