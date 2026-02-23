<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('superadmin');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasRole('superadmin');
    }

    public function changePassword(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function viewClasses(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function viewStats(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function bulkCreate(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }
}
