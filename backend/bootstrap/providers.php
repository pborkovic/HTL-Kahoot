<?php

use App\Providers\AppServiceProvider;
use App\Providers\PolicyServiceProvider;
use App\Providers\RepositoryServiceProvider;

return [
    RepositoryServiceProvider::class,
    AppServiceProvider::class,
    PolicyServiceProvider::class,
];
