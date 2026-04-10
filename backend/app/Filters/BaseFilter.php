<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

abstract class BaseFilter
{
    protected array $allowedSorts = [];

    protected string $defaultSort = 'created_at';

    abstract public function apply(Builder $query, array $filters): Builder;

    /**
     * Apply sorting to the query based on filter parameters.
     *
     * @param  Builder  $query  The query builder.
     * @param  array<string, mixed>  $filters  The filter parameters.
     * @return Builder The query with sorting applied.
     *
     * @author Philipp Borkovic
     */
    protected function applySorting(Builder $query, array $filters): Builder
    {
        $sort = in_array($filters['sort'] ?? null, $this->allowedSorts) ? $filters['sort'] : $this->defaultSort;
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }

    /**
     * Apply a boolean filter if the key exists and is not null.
     *
     * @param  Builder  $query  The query builder.
     * @param  array<string, mixed>  $filters  The filter parameters.
     * @param  string  $field  The database column name.
     * @return Builder The query with the boolean filter applied.
     *
     * @author Philipp Borkovic
     */
    protected function applyBooleanFilter(Builder $query, array $filters, string $field): Builder
    {
        if (array_key_exists($field, $filters) && $filters[$field] !== null) {
            $query->where($field, filter_var($filters[$field], FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }
}
