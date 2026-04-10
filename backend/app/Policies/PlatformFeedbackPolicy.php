<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\PlatformFeedback;
use App\Models\User;

/**
 * Authorization rules for {@see PlatformFeedback}.
 *
 * - Any authenticated user (student, teacher, admin, superadmin) may submit
 *   and view their own feedback.
 * - Only admins and superadmins may list every feedback or change its status.
 */
class PlatformFeedbackPolicy
{
    /**
     * Determine whether the user can submit a new feedback entry.
     *
     * @author Philipp Borkovic
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(roles: ['student', 'teacher', 'admin', 'superadmin']);
    }

    /**
     * Determine whether the user may view their own feedback list.
     *
     * @author Philipp Borkovic
     */
    public function viewOwn(User $user): bool
    {
        return $user->hasAnyRole(roles: ['student', 'teacher', 'admin', 'superadmin']);
    }

    /**
     * Determine whether the user may list all platform feedback.
     *
     * @author Philipp Borkovic
     */
    public function viewAll(User $user): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }

    /**
     * Determine whether the user may resolve or reopen a feedback entry.
     *
     * @author Philipp Borkovic
     */
    public function resolve(User $user, PlatformFeedback $feedback): bool
    {
        return $user->hasAnyRole(roles: ['admin', 'superadmin']);
    }
}
