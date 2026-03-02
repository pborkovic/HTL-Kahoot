<?php

namespace App\Services\Contracts;

use App\Models\Session;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;

interface SessionServiceContract extends BaseServiceContract
{
    public function createGame(string $quizId, User $host): Session;

    public function generateQrCodeDataUri(string $gamePin): string;
}
