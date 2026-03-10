<?php

namespace App\Repositories\Contracts;

use App\Models\Session;
use Illuminate\Database\Eloquent\ModelNotFoundException;

interface SessionRepositoryContract extends BaseRepositoryContract
{
    /**
     * Find a session by its game pin.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session|null The session, or null if not found.
     */
    public function findByGamePin(string $gamePin): ?Session;

    /**
     * Find a session by game pin with participants loaded, or fail.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session The session with participants relation loaded.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If no session found.
     */
    public function findByGamePinWithParticipantsOrFail(string $gamePin): Session;

    /**
     * Generate a unique 8-digit game pin.
     *
     * @return string The unique game pin.
     */
    public function generateUniqueGamePin(): string;
}
