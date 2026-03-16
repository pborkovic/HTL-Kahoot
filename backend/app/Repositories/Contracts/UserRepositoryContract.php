<?php

namespace App\Repositories\Contracts;

use App\DTOs\EntraUserDto;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserRepositoryContract extends BaseRepositoryContract
{
    public function findByExternalId(string $externalId): ?User;

    public function updateFromEntra(User $user, EntraUserDto $entraDto): User;

    public function createFromEntra(EntraUserDto $entraDto): User;

    /**
     * Get a paginated, filtered list of users with roles.
     *
     * @param array $filters  The validated filter parameters.
     * @param int   $perPage  Items per page.
     * @param bool  $withTrashed Whether to include soft-deleted users.
     *
     * @return LengthAwarePaginator The paginated users.
     */
    public function getFilteredUsers(array $filters, int $perPage, bool $withTrashed = false): LengthAwarePaginator;

    /**
     * Get distinct class names with student counts.
     *
     * @return Collection The class list with student_count.
     */
    public function getClassesWithStudentCounts(): Collection;

    /**
     * Get user statistics (total, active, by role, by auth provider, recent signups).
     *
     * @return array The statistics data.
     */
    public function getUserStats(): array;

    /**
     * Create a user and assign a role.
     *
     * @param array  $userData    The user attributes.
     * @param string $roleName   The role name to assign.
     * @param string $assignedBy The ID of the user assigning the role.
     *
     * @return User The created user with roles loaded.
     */
    public function createWithRole(array $userData, string $roleName, string $assignedBy): User;

    /**
     * Bulk import users with role assignment.
     *
     * @param array  $users           The user rows to import.
     * @param string $defaultProvider The default auth provider.
     * @param string $assignedBy      The ID of the user assigning roles.
     *
     * @return array{created: int, skipped: int, errors: array}
     */
    public function bulkCreateWithRoles(array $users, string $defaultProvider, string $assignedBy): array;

    /**
     * Update a user's attributes.
     *
     * @param User  $user The user to update.
     * @param array $data The attributes to update.
     *
     * @return User The refreshed user.
     */
    public function updateUser(User $user, array $data): User;

    /**
     * Sync a user's role (replace all roles with the given one).
     *
     * @param User   $user       The user.
     * @param string $roleName   The role name.
     * @param string $assignedBy The ID of the user assigning the role.
     */
    public function syncRole(User $user, string $roleName, string $assignedBy): void;

    /**
     * Invalidate all active tokens for a user.
     *
     * @param User $user The user.
     */
    public function deleteTokens(User $user): void;

    /**
     * Soft-delete a user.
     *
     * @param User $user The user.
     */
    public function softDelete(User $user): void;

    /**
     * Restore a soft-deleted user.
     *
     * @param User $user The user.
     *
     * @return User The restored user with roles.
     */
    public function restoreUser(User $user): User;

    /**
     * Count superadmin users.
     *
     * @return int
     */
    public function countSuperadmins(): int;

    /**
     * Update password hash for a user.
     *
     * @param User   $user         The user.
     * @param string $passwordHash The new hashed password.
     */
    public function updatePasswordHash(User $user, string $passwordHash): void;

    /**
     * Find a user by ID with roles loaded.
     *
     * @param string $userId The user ID.
     *
     * @return User The user with roles.
     */
    public function findWithRoles(string $userId): User;

    /**
     * Count finished session participations for a user.
     *
     * @param string $userId The user ID.
     *
     * @return int The number of finished participations.
     */
    public function countFinishedParticipations(string $userId): int;

    /**
     * Get all finished session participations for a user with quiz, session questions, and responses.
     *
     * @param string $userId The user ID.
     *
     * @return Collection The session participants with relations loaded.
     */
    public function getFinishedParticipationsWithResponses(string $userId): Collection;
}
