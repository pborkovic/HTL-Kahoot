<?php

namespace App\Repositories\Contracts;

use App\Models\User;

/**
 * User Repository Contract
 *
 * Defines the contract for user-specific repository operations,
 * extending the base repository functionality with user-related methods.
 *
 * @package App\Repositories\Contracts
 */
interface UserRepositoryContract extends BaseRepositoryContract
{
    /**
     * Find a user by their Microsoft Entra ID.
     *
     * @param string $entraId The unique Microsoft Entra ID identifier
     *
     * @return User|null The user instance if found, null otherwise
     */
    public function findByEntraId(string $entraId): ?User;

    /**
     * Update an existing user with data from Microsoft Entra ID.
     *
     * @param User                $user      The user instance to update
     * @param array<string,mixed> $entraData The data from Microsoft Entra ID containing:
     *                                       - email: string
     *                                       - display_name: string
     *                                       - first_name: string|null
     *                                       - last_name: string|null
     *                                       - avatar_url: string|null
     *
     * @return User The updated user instance with fresh data
     */
    public function updateFromEntra(User $user, array $entraData): User;

    /**
     * Create a new user from Microsoft Entra ID data.
     *
     * @param array<string,mixed> $entraData The data from Microsoft Entra ID containing:
     *                                       - entra_id: string
     *                                       - email: string
     *                                       - display_name: string
     *                                       - first_name: string|null
     *                                       - last_name: string|null
     *                                       - avatar_url: string|null
     *
     * @return User The newly created user instance
     */
    public function createFromEntra(array $entraData): User;
}
