<?php

namespace App\Repositories;

use App\DTOs\EntraUserDto;
use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;

class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    public function findByExternalId(string $externalId): ?User
    {
        return $this->model
            ->where(
                column: 'external_id',
                operator: '=',
                value: $externalId
            )
            ->first();
    }

    public function updateFromEntra(User $user, EntraUserDto $entraDto): User
    {
        $user->update(
            attributes: [
                'email' => $entraDto->email,
                'username' => $entraDto->displayName,
                'last_login_at' => now(),
            ]
        );

        return $user->fresh();
    }

    public function createFromEntra(EntraUserDto $entraDto): User
    {
        return $this->model->create(
            attributes: [
                'external_id' => $entraDto->externalId,
                'email' => $entraDto->email,
                'username' => $entraDto->displayName,
                'auth_provider' => 'azure',
                'last_login_at' => now(),
            ]
        );
    }
}
