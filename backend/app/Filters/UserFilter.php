<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class UserFilter
{
    private array $allowedSorts = ['email', 'created_at', 'display_name', 'class_name', 'last_login_at'];

    public function apply(Builder $query, array $filters): Builder
    {
        if (!empty($filters['role'])) {
            $query->whereHas('roles', fn($q) => $q->where('name', $filters['role']));
        }

        if (!empty($filters['class'])) {
            $query->where('class_name', $filters['class']);
        }

        if (!empty($filters['class_prefix'])) {
            $query->whereRaw('LOWER(class_name) LIKE ?', [strtolower($filters['class_prefix']) . '%']);
        }

        if (!empty($filters['search'])) {
            $term = '%' . strtolower($filters['search']) . '%';
            $query->where(function (Builder $q) use ($term) {
                $q->whereRaw('LOWER(email) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(username) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(display_name) LIKE ?', [$term]);
            });
        }

        if (array_key_exists('is_active', $filters) && $filters['is_active'] !== null) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['auth_provider'])) {
            $query->where('auth_provider', $filters['auth_provider']);
        }

        if (!empty($filters['created_after'])) {
            $query->where('created_at', '>=', $filters['created_after']);
        }

        if (!empty($filters['created_before'])) {
            $query->where('created_at', '<=', $filters['created_before'] . ' 23:59:59');
        }

        $sort      = in_array($filters['sort'] ?? null, $this->allowedSorts) ? $filters['sort'] : 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction);
    }
}
