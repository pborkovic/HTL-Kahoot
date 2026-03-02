<?php

namespace App\Repositories\Contracts;

use App\Models\Session;

interface SessionRepositoryContract extends BaseRepositoryContract
{
    /**
     * Find a session by its unique game pin.
     *
     * @param string $gamePin The 8-digit game pin to search for.
     * @return Session|null The matching session, or null if not found or on error.
     */
    public function findByGamePin(string $gamePin): ?Session;

    /**
     * Generate a unique 8-digit game pin that does not exist in the database.
     *
     * Generates random pins in the range 00000000–99999999 and checks
     * for uniqueness against existing sessions until an unused pin is found.
     *
     * @return string The unique 8-digit game pin, zero-padded.
     */
    public function generateUniqueGamePin(): string;
}
