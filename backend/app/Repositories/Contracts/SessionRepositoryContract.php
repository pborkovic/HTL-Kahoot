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

    /**
     * Update a session's attributes.
     *
     * @param Session              $session The session to update.
     * @param array<string, mixed> $data    The attributes to update.
     */
    public function updateSession(Session $session, array $data): void;

    /**
     * Refresh a session from the database.
     *
     * @param Session $session The session to refresh.
     *
     * @return Session The refreshed session instance.
     */
    public function refreshSession(Session $session): Session;

    /**
     * Eager-load relations on an existing session instance.
     *
     * @param Session              $session   The session.
     * @param string|array<string> $relations The relations to load.
     *
     * @return Session The session with relations loaded.
     */
    public function loadSessionRelations(Session $session, string|array $relations): Session;

    /**
     * Execute a callback within a database transaction.
     *
     * @param callable $callback The callback to execute.
     *
     * @return mixed The callback return value.
     */
    public function wrapInTransaction(callable $callback): mixed;
}
