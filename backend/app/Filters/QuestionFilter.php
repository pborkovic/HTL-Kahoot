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
        'department',
    ];

    /**
     * Normalize a filter value that may arrive as an array or comma-separated string
     * into a clean list of non-empty strings.
     *
     * @param  mixed  $value
     * @return array<int, string>
     */
    private function normalizeList(mixed $value): array
    {
        if (is_array($value)) {
            $items = $value;
        } elseif (is_string($value) && $value !== '') {
            $items = explode(',', $value);
        } else {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($v): string => is_string($v) ? trim($v) : '',
            $items,
        ), fn (string $v): bool => $v !== ''));
    }

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

        $departments = $this->normalizeList(value: $filters['departments'] ?? null);
        if (! empty($departments)) {
            $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
            $uuids = array_values(array_filter($departments, fn (string $v): bool => (bool) preg_match($uuidPattern, $v)));
            $slugs = array_values(array_filter($departments, fn (string $v): bool => ! preg_match($uuidPattern, $v)));

            $query->whereHas('departments', function (Builder $q) use ($slugs, $uuids): void {
                $q->where(function (Builder $inner) use ($slugs, $uuids): void {
                    if (! empty($slugs)) {
                        $inner->whereIn('departments.slug', $slugs);
                    }
                    if (! empty($uuids)) {
                        $inner->orWhereIn('departments.id', $uuids);
                    }
                });
            });
        }

        $sort = $filters['sort'] ?? null;
        if ($sort === 'department') {
            $direction = strtolower($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

            return $query->orderByRaw(
                '(SELECT MIN(d.name) FROM departments d '
                .'INNER JOIN question_department qd ON qd.department_id = d.id '
                .'WHERE qd.question_id = questions.id) '.$direction.' NULLS LAST'
            );
        }

        return $this->applySorting(
            query: $query,
            filters: $filters
        );
    }
}
