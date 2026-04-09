<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\PlatformFeedback;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\PlatformFeedbackRepositoryContract;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * @property PlatformFeedback $model
 */

/**
 * Repository for {@see PlatformFeedback}.
 *
 * @package App\Repositories
 */
class PlatformFeedbackRepository extends BaseRepository implements PlatformFeedbackRepositoryContract
{
    public function __construct(PlatformFeedback $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function paginateForAdmin(?string $status, int $page, int $perPage): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(relations: ['author', 'resolver'])
            ->where(column: 'moderation_status', operator: '=', value: 'approved')
            ->orderBy(column: 'created_at', direction: 'desc');

        if ($status === 'open') {
            $query->whereNull(columns: 'resolved_at');
        } elseif ($status === 'solved') {
            $query->whereNotNull(columns: 'resolved_at');
        }

        return $query->paginate(
            perPage: $perPage,
            page: $page
        );
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function listForUser(string $userId): Collection
    {
        return $this->model->newQuery()
            ->where(column: 'user_id', operator: '=', value: $userId)
            ->orderBy(column: 'created_at', direction: 'desc')
            ->get();
    }
}
