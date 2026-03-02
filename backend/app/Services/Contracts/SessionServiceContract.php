<?php

namespace App\Services\Contracts;

use App\DTOs\CreateSessionDto;
use App\Models\Session;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;

interface SessionServiceContract extends BaseServiceContract
{
    public function createGame(CreateSessionDto $dto, User $host): Session;

    public function generateQrCodeDataUri(string $gamePin): string;
}
