<?php

namespace App\Repositories;

use App\DTOs\EntraUserDto;
use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;

/**
 * User Repository Implementation
 *
 * @package App\Repositories
 */
class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     */
    public function findByEntraId(string $entraId): ?User
    {
        return $this->model
            ->where(
                column: 'entra_id',
                operator: '=',
                value: $entraId
            )
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function updateFromEntra(User $user, EntraUserDto $entraDto): User
    {
        $user->update(
            attributes: [
                'email' => $entraDto->email,
                'display_name' => $entraDto->displayName,
                'first_name' => $entraDto->firstName,
                'last_name' => $entraDto->lastName,
                'avatar_url' => $entraDto->avatarUrl,
                'last_login_at' => now(),
            ]
        );

        return $user->fresh();
    }

    /**
     * {@inheritDoc}
     */
    public function createFromEntra(EntraUserDto $entraDto): User
    {
        return $this->model->create(
            attributes: [
                'entra_id' => $entraDto->entraId,
                'email' => $entraDto->email,
                'display_name' => $entraDto->displayName,
                'first_name' => $entraDto->firstName,
                'last_name' => $entraDto->lastName,
                'avatar_url' => $entraDto->avatarUrl,
                'last_login_at' => now(),
            ]
        );
    }
}
