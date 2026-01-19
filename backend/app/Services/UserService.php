<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\UserServiceContract;

class UserService extends BaseService implements UserServiceContract
{
    protected UserRepositoryContract $repository;

    public function __construct(UserRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return User::class;
    }
}
