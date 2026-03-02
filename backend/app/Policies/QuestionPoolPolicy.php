<?php

namespace App\Policies;

use App\Models\QuestionPool;
use App\Models\User;

class QuestionPoolPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function view(User $user, QuestionPool $pool): bool
    {
        if ($pool->is_shared) {
            return true;
        }

        return $pool->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function update(User $user, QuestionPool $pool): bool
    {
        return $pool->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function delete(User $user, QuestionPool $pool): bool
    {
        return $pool->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function manageQuestions(User $user, QuestionPool $pool): bool
    {
        return $pool->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }
}
