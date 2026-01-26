<?php

namespace App\Repositories\Contracts;

use App\DTOs\EntraUserDto;
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
     * @param User         $user     The user instance to update
     * @param EntraUserDto $entraDto The DTO containing Microsoft Entra ID user data
     *
     * @return User The updated user instance with fresh data
     */
    public function updateFromEntra(User $user, EntraUserDto $entraDto): User;

    /**
     * Create a new user from Microsoft Entra ID data.
     *
     * @param EntraUserDto $entraDto The DTO containing Microsoft Entra ID user data
     *
     * @return User The newly created user instance
     */
    public function createFromEntra(EntraUserDto $entraDto): User;
}
