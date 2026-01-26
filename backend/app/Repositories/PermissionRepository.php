<?php

namespace App\Repositories;

use App\Models\Permission;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\PermissionRepositoryContract;

class PermissionRepository extends BaseRepository implements PermissionRepositoryContract
{
    public function __construct(Permission $model)
    {
        parent::__construct($model);
    }
}
