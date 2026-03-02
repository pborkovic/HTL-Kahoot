<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class QuestionFilter
{
    private array $allowedSorts = ['created_at', 'type', 'is_published'];

    public function apply(Builder $query, array $filters): Builder
    {
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (array_key_exists('is_published', $filters) && $filters['is_published'] !== null) {
            $query->where('is_published', filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $term = '%' . strtolower($filters['search']) . '%';
            $query->whereHas('currentVersion', fn(Builder $q) => $q->whereRaw('LOWER(title) LIKE ?', [$term]));
        }

        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        if (!empty($filters['pool_id'])) {
            $query->whereHas('pools', fn(Builder $q) => $q->where('question_pools.id', $filters['pool_id']));
        }

        $sort      = in_array($filters['sort'] ?? null, $this->allowedSorts) ? $filters['sort'] : 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
