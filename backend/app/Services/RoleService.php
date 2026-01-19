<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\RoleServiceContract;

class RoleService extends BaseService implements RoleServiceContract
{
    protected RoleRepositoryContract $repository;

    public function __construct(RoleRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return Role::class;
    }
}
