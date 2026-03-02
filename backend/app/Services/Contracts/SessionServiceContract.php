<?php

namespace App\Services\Contracts;

use App\DTOs\CreateSessionDto;
use App\Models\Session;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;

interface SessionServiceContract extends BaseServiceContract
{
    /**
     * Create a new game session with a unique game pin and QR code.
     *
     * @param CreateSessionDto $dto The session creation data containing the quiz ID.
     * @param User $host The authenticated user who will host the session.
     * @return Session The created session with quiz and host relations loaded.
     */
    public function createGame(CreateSessionDto $dto, User $host): Session;

    /**
     * Generate a base64-encoded SVG QR code data URI for the given game pin.
     *
     * @param string $gamePin The 8-digit game pin to encode in the QR code.
     * @return string The QR code as a data:image/svg+xml;base64 URI.
     */
    public function generateQrCodeDataUri(string $gamePin): string;
}
