<?php

namespace App\Services\Contracts;

use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Collection;
use App\Services\Base\Contracts\BaseServiceContract;

interface UserServiceContract extends BaseServiceContract
{
    /**
     * Get a paginated, filtered list of users.
     *
     * @param array $filters     The validated filter parameters.
     * @param int   $perPage     Items per page.
     * @param bool  $withTrashed Whether to include soft-deleted users.
     *
     * @return ResourceCollection
     */
    public function listUsers(array $filters, int $perPage, bool $withTrashed = false): ResourceCollection;

    /**
     * Get distinct class names with student counts.
     *
     * @return Collection
     */
    public function getClasses(): Collection;

    /**
     * Get aggregated user statistics.
     *
     * @return array
     */
    public function getStats(): array;

    /**
     * Bulk import users.
     *
     * @param array  $users           The user rows.
     * @param string $defaultProvider The default auth provider.
     * @param string $assignedBy      The assigning user's ID.
     *
     * @return array{created: int, skipped: int, errors: array}
     */
    public function bulkImport(array $users, string $defaultProvider, string $assignedBy): array;

    /**
     * Create a user with role.
     *
     * @param array  $data       The validated request data.
     * @param string $assignedBy The assigning user's ID.
     *
     * @return User The created user with roles.
     */
    public function createUser(array $data, string $assignedBy): User;

    /**
     * Get a user with roles loaded.
     *
     * @param string $userId The user ID.
     *
     * @return User
     */
    public function getUser(string $userId): User;

    /**
     * Update a user (admin vs self logic).
     *
     * @param User   $user     The user to update.
     * @param array  $data     The validated request data.
     * @param User   $authUser The authenticated user performing the update.
     *
     * @return User The updated user.
     */
    public function updateUser(User $user, array $data, User $authUser): User;

    /**
     * Soft-delete a user with safety checks.
     *
     * @param User $user    The user to delete.
     * @param User $authUser The authenticated user.
     *
     * @throws \RuntimeException If trying to delete self or last superadmin.
     */
    public function deleteUser(User $user, User $authUser): void;

    /**
     * Restore a soft-deleted user.
     *
     * @param User $user The user to restore.
     *
     * @return User The restored user.
     */
    public function restoreUser(User $user): User;

    /**
     * Change a user's password.
     *
     * @param User   $user        The user.
     * @param array  $data        The validated password data.
     * @param bool   $isSelf      Whether the authenticated user is changing their own password.
     *
     * @throws \RuntimeException If auth provider is not local or current password is incorrect.
     */
    public function changePassword(User $user, array $data, bool $isSelf): void;

    /**
     * Get the number of completed quizzes for a user.
     *
     * @param string $userId The user ID.
     *
     * @return array{completed_quizzes: int}
     */
    public function getCompletedQuizzesCount(string $userId): array;

    /**
     * Get the correct/wrong/unanswered answer distribution for a user across all quizzes.
     *
     * @param string $userId The user ID.
     *
     * @return array{
     *     total_correct: int,
     *     total_wrong: int,
     *     total_unanswered: int,
     *     correct_percentage: float
     * }
     */
    public function getAnswerDistribution(string $userId): array;

    /**
     * Get the list of completed quizzes with per-quiz breakdown.
     *
     * @param string $userId The user ID.
     *
     * @return array
     */
    public function getQuizHistory(string $userId): array;

    /**
     * Get a user's preferences.
     *
     * @param User $user The user.
     *
     * @return array The preferences array.
     */
    public function getPreferences(User $user): array;

    /**
     * Merge and update a user's preferences.
     *
     * @param User  $user The user.
     * @param array $data The preference fields to merge.
     *
     * @return array The updated preferences array.
     */
    public function updatePreferences(User $user, array $data): array;
}
