<?php

declare(strict_types=1);

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
     * @throws ModelNotFoundException If no session found.
     */
    public function findByGamePinWithParticipantsOrFail(string $gamePin): Session;

    /**
     * Find a session by game pin or fail.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session The session.
     *
     * @throws ModelNotFoundException If no session found.
     */
    public function findByGamePinOrFail(string $gamePin): Session;

    /**
     * Find a session by game pin with quiz questions and answer options loaded.
     *
     * Eagerly loads quiz.quizQuestions (ordered by sort_order),
     * questionVersion, and answerOptions for starting a game.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session The session with full quiz question hierarchy loaded.
     *
     * @throws ModelNotFoundException If no session found.
     */
    public function findByGamePinWithQuizQuestions(string $gamePin): Session;

    /**
     * Generate a unique 8-digit game pin.
     *
     * @return string The unique game pin.
     */
    public function generateUniqueGamePin(): string;
}
