<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class QuizFilter extends BaseFilter
{
    protected array $allowedSorts = [
        'created_at',
        'title',
        'is_published',
    ];

    public function apply(Builder $query, array $filters): Builder
    {
        $this->applyBooleanFilter(
            query: $query,
            filters: $filters,
            field: 'is_published'
        );

        if (! empty($filters['search'])) {
            $term = '%'.strtolower($filters['search']).'%';
            $query->whereRaw('LOWER(title) LIKE ?', [$term]);
        }
        if (! empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }
        if (! empty($filters['pool_id'])) {
            $query->where('pool_id', $filters['pool_id']);
        }

        return $this->applySorting(
            query: $query,
            filters: $filters
        );
    }
}
