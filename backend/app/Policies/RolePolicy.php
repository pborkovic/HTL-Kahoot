<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(role: 'superadmin');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasRole(role: 'superadmin');
    }

    public function assignRole(User $user): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }

    public function removeRole(User $user): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }

    public function managePermissions(User $user): bool
    {
        return $user->hasRole(role: 'superadmin');
    }
}
