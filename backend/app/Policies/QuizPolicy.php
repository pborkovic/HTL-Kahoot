<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function view(User $user, Quiz $quiz): bool
    {
        if ($quiz->is_published) {
            return true;
        }

        return $quiz->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function update(User $user, Quiz $quiz): bool
    {
        return $quiz->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        return $quiz->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function restore(User $user, Quiz $quiz): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function publish(User $user, Quiz $quiz): bool
    {
        return $quiz->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }
}
