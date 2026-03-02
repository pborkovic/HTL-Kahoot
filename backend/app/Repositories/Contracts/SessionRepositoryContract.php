<?php

namespace App\Repositories\Contracts;

use App\Models\Session;

interface SessionRepositoryContract extends BaseRepositoryContract
{
    public function findByGamePin(string $gamePin): ?Session;

    public function generateUniqueGamePin(): string;
}
