<?php

namespace App\Repositories;

use App\Models\Role;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\RoleRepositoryContract;

class RoleRepository extends BaseRepository implements RoleRepositoryContract
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }
}
