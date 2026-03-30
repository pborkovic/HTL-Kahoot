<?php

namespace App\Repositories\Contracts;

use App\DTOs\EntraUserDto;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface UserRepositoryContract extends BaseRepositoryContract
{
    /**
     * Find a user by email address.
     *
     * @param string $email The email address to search for.
     *
     * @return User|null The user, or null if not found.
     */
    public function findByEmail(string $email): ?User;

    /**
     * Find a user by their external OAuth provider ID.
     *
     * @param string $externalId The external ID from the OAuth provider.
     *
     * @return User|null The user, or null if not found.
     */
    public function findByExternalId(string $externalId): ?User;

    /**
     * Update an existing user from Entra ID (Azure AD) data.
     *
     * @param User         $user     The user to update.
     * @param EntraUserDto $entraDto The Entra user data.
     *
     * @return User The updated user.
     */
    public function updateFromEntra(User $user, EntraUserDto $entraDto): User;

    /**
     * Create a new user from Entra ID (Azure AD) data.
     *
     * @param EntraUserDto $entraDto The Entra user data.
     *
     * @return User The newly created user.
     */
    public function createFromEntra(EntraUserDto $entraDto): User;

    /**
     * Get a paginated, filtered list of users with roles.
     *
     * @param array $filters     The validated filter parameters.
     * @param int   $perPage     Items per page.
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
     * Get user-specific statistics (total, active, by auth provider, recent signups).
     *
     * @return array The user statistics (without role counts).
     */
    public function getUserStats(): array;

    /**
     * Create a user and attach a role by ID.
     *
     * @param array  $userData   The user attributes.
     * @param string $roleId     The role UUID to assign.
     * @param string $assignedBy The ID of the user assigning the role.
     *
     * @return User The created user with roles loaded.
     */
    public function createWithRole(array $userData, string $roleId, string $assignedBy): User;

    /**
     * Create a single user record.
     *
     * @param array $data The user attributes.
     *
     * @return User The created user.
     */
    public function createUser(array $data): User;

    /**
     * Attach a role to a user by role ID.
     *
     * @param User   $user       The user.
     * @param string $roleId     The role UUID.
     * @param string $assignedBy The ID of the user assigning the role.
     */
    public function attachRole(User $user, string $roleId, string $assignedBy): void;

    /**
     * Check if a user exists by email.
     *
     * @param string $email The email to check.
     *
     * @return bool
     */
    public function emailExists(string $email): bool;

    /**
     * Execute a callback within a database transaction.
     *
     * @param callable $callback The callback.
     *
     * @return mixed The callback return value.
     */
    public function wrapInTransaction(callable $callback): mixed;

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
     * Sync a user's role by role ID (replace all roles).
     *
     * @param User   $user       The user.
     * @param string $roleId     The role UUID.
     * @param string $assignedBy The ID of the user assigning the role.
     */
    public function syncRole(User $user, string $roleId, string $assignedBy): void;

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
