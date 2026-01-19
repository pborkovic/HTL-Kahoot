<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;

class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }
}
