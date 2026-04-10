<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class QuestionFilter extends BaseFilter
{
    protected array $allowedSorts = [
        'created_at',
        'type',
        'is_published',
    ];

    public function apply(Builder $query, array $filters): Builder
    {
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $this->applyBooleanFilter(
            query: $query,
            filters: $filters,
            field: 'is_published'
        );

        if (! empty($filters['search'])) {
            $term = '%'.strtolower($filters['search']).'%';
            $query->whereHas('currentVersion', fn (Builder $q) => $q->whereRaw('LOWER(title) LIKE ?', [$term]));
        }
        if (! empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }
        if (! empty($filters['pool_id'])) {
            $query->whereHas('pools', fn (Builder $q) => $q->where('question_pools.id', $filters['pool_id']));
        }

        return $this->applySorting(
            query: $query,
            filters: $filters
        );
    }
}
