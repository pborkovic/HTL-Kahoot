<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;

class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
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
     *
     * @author Philipp Borkovic
     */
    public function updateFromEntra(User $user, array $entraData): User
    {
        $user->update(
            attributes: [
                'email' => $entraData['email'],
                'display_name' => $entraData['display_name'],
                'first_name' => $entraData['first_name'],
                'last_name' => $entraData['last_name'],
                'avatar_url' => $entraData['avatar_url'],
                'last_login_at' => now(),
                ]
        );

        return $user->fresh();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createFromEntra(array $entraData): User
    {
        return $this->model->create(
            attributes: [
                'entra_id' => $entraData['entra_id'],
                'email' => $entraData['email'],
                'display_name' => $entraData['display_name'],
                'first_name' => $entraData['first_name'],
                'last_name' => $entraData['last_name'],
                'avatar_url' => $entraData['avatar_url'],
                'last_login_at' => now(),
                ]
        );
    }

}
