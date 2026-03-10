<?php

namespace App\Services\Contracts;

use App\DTOs\CreateSessionDto;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Database\Eloquent\ModelNotFoundException;

interface SessionServiceContract extends BaseServiceContract
{
    /**
     * Create a new game session with a unique game pin and QR code.
     *
     * @param CreateSessionDto $dto The session creation data containing the quiz ID.
     * @param User $host The authenticated user who will host the session.
     * @return Session The created session with quiz and host relations loaded.
     */
    /**
     * Find a session by game pin with participants loaded.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session The session with participants relation loaded.
     *
     * @throws ModelNotFoundException If no session found.
     */
    public function findByGamePin(string $gamePin): Session;

    public function createGame(CreateSessionDto $dto, User $host): Session;

    /**
     * Join an existing game session by its game pin.
     *
     * Looks up the session by game pin, verifies it is in the 'lobby' status,
     * and creates a SessionParticipant record. If an authenticated user is
     * provided and already participates, their existing participant record is
     * returned instead of creating a duplicate.
     *
     * @param string $gamePin The 8-digit game pin of the session to join.
     * @param User   $user    The authenticated user joining the session.
     *
     * @return SessionParticipant The created or existing participant record.
     *
     * @throws \InvalidArgumentException If no session with the given game pin exists.
     * @throws \RuntimeException         If the session is not in 'lobby' status.
     */
    public function joinSession(string $gamePin, User $user): SessionParticipant;

    /**
     * Generate a base64-encoded SVG QR code data URI for the given game pin.
     *
     * @param string $gamePin The 8-digit game pin to encode in the QR code.
     * @return string The QR code as a data:image/svg+xml;base64 URI.
     */
    public function generateQrCodeDataUri(string $gamePin): string;
}
