<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function view(User $user, Question $question): bool
    {
        if ($question->is_published) {
            return true;
        }

        return $question->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin']);
    }

    public function update(User $user, Question $question): bool
    {
        return $question->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function delete(User $user, Question $question): bool
    {
        return $question->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function restore(User $user, Question $question): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function publish(User $user, Question $question): bool
    {
        return $question->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }

    public function viewVersions(User $user, Question $question): bool
    {
        return $question->created_by === $user->id || $user->hasAnyRole(['admin', 'superadmin']);
    }
}
