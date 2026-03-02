<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization policy for game session operations.
 */
class SessionPolicy
{
    /**
     * Determine whether the user can create a game session.
     *
     * Only teachers, admins, and superadmins are allowed.
     *
     * @param User $user The authenticated user.
     *
     * @return Response
     *
     * @author Philipp Borkovic
     */
    public function create(User $user): Response
    {
        return $user->hasAnyRole(['teacher', 'admin', 'superadmin'])
            ? Response::allow()
            : Response::deny('You must be a teacher or admin to create a game session.');
    }
}
