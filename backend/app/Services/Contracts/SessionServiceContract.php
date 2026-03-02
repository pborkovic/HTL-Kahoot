<?php

namespace App\Services\Contracts;

use App\Models\Session;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;

interface SessionServiceContract extends BaseServiceContract
{
    /**
     * Create a new game session for a quiz.
     *
     * Generates a unique game pin, creates a QR code for the join URL,
     * and persists the session with status 'lobby'. Returns the session
     * with the 'quiz' and 'host' relationships eager-loaded.
     *
     * @param string $quizId The UUID of the quiz to create a session for.
     * @param User $host The authenticated user who will host the session.
     * @return Session The newly created session with loaded relationships.
     */
    public function createGame(string $quizId, User $host): Session;

    /**
     * Generate a base64-encoded SVG QR code as a data URI.
     *
     * The QR code encodes the frontend join URL for the given game pin
     * in the format: {frontend_url}/join/{gamePin}.
     *
     * @param string $gamePin The 8-digit game pin to encode in the QR code.
     * @return string The QR code as a data URI (data:image/svg+xml;base64,...).
     */
    public function generateQrCodeDataUri(string $gamePin): string;
}
