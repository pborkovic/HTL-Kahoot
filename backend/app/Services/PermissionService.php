<?php

namespace App\Services;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\PermissionServiceContract;

class PermissionService extends BaseService implements PermissionServiceContract
{
    protected PermissionRepositoryContract $repository;

    public function __construct(PermissionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return Permission::class;
    }
}
