<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(role: 'superadmin');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->hasRole(role: 'superadmin');
    }
}
