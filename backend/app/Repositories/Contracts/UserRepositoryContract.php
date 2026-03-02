<?php

namespace App\Repositories\Contracts;

use App\DTOs\EntraUserDto;
use App\Models\User;

interface UserRepositoryContract extends BaseRepositoryContract
{
    public function findByExternalId(string $externalId): ?User;

    public function updateFromEntra(User $user, EntraUserDto $entraDto): User;

    public function createFromEntra(EntraUserDto $entraDto): User;
}
