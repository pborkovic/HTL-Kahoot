<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Response;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\SessionQuestion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

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
     * Find a participant in a session by user ID.
     *
     * @param Session $session The session.
     * @param string  $userId  The user ID.
     *
     * @return SessionParticipant|null The participant, or null if not found.
     */
    public function findParticipantByUserId(Session $session, string $userId): ?SessionParticipant;

    /**
     * Create a participant for a session.
     *
     * @param Session              $session The session.
     * @param array<string, mixed> $data    The participant attributes.
     *
     * @return SessionParticipant The newly created participant.
     */
    public function createParticipant(Session $session, array $data): SessionParticipant;

    /**
     * Count the participants in a session.
     *
     * @param Session $session The session.
     *
     * @return int The participant count.
     */
    public function countParticipants(Session $session): int;

    /**
     * Get all participants in a session ordered by total score descending.
     *
     * @param Session $session The session.
     *
     * @return Collection<int, SessionParticipant> The ordered participants.
     */
    public function getParticipantsOrderedByScore(Session $session): Collection;

    /**
     * Increment a participant's total score.
     *
     * @param SessionParticipant $participant The participant.
     * @param int                $amount      The amount to add.
     */
    public function incrementParticipantScore(SessionParticipant $participant, int $amount): void;

    /**
     * Update a participant's attributes.
     *
     * @param SessionParticipant   $participant The participant.
     * @param array<string, mixed> $data        The attributes to update.
     */
    public function updateParticipant(SessionParticipant $participant, array $data): void;

    /**
     * Create a session question for a session.
     *
     * @param Session              $session The session.
     * @param array<string, mixed> $data    The session question attributes.
     *
     * @return SessionQuestion The newly created session question.
     */
    public function createSessionQuestion(Session $session, array $data): SessionQuestion;

    /**
     * Count the session questions in a session.
     *
     * @param Session $session The session.
     *
     * @return int The question count.
     */
    public function countSessionQuestions(Session $session): int;

    /**
     * Find a session question by its display order.
     *
     * @param Session $session      The session.
     * @param int     $displayOrder The display order index.
     *
     * @return SessionQuestion|null The session question, or null if not found.
     */
    public function findSessionQuestionByDisplayOrder(Session $session, int $displayOrder): ?SessionQuestion;

    /**
     * Find a session question by its display order, or fail.
     *
     * @param Session $session      The session.
     * @param int     $displayOrder The display order index.
     *
     * @return SessionQuestion The session question.
     *
     * @throws ModelNotFoundException If not found.
     */
    public function findSessionQuestionByDisplayOrderOrFail(Session $session, int $displayOrder): SessionQuestion;

    /**
     * Update a session question's attributes.
     *
     * @param SessionQuestion      $sessionQuestion The session question.
     * @param array<string, mixed> $data            The attributes to update.
     */
    public function updateSessionQuestion(SessionQuestion $sessionQuestion, array $data): void;

    /**
     * Eager-load relations on a session question.
     *
     * @param SessionQuestion      $sessionQuestion The session question.
     * @param string|array<string> $relations       The relations to load.
     *
     * @return SessionQuestion The session question with relations loaded.
     */
    public function loadSessionQuestionRelations(SessionQuestion $sessionQuestion, string|array $relations): SessionQuestion;

    /**
     * Create a response for a session question.
     *
     * @param SessionQuestion      $sessionQuestion The session question.
     * @param array<string, mixed> $data            The response attributes.
     *
     * @return Response The newly created response.
     */
    public function createResponse(SessionQuestion $sessionQuestion, array $data): Response;

    /**
     * Count the responses for a session question.
     *
     * @param SessionQuestion $sessionQuestion The session question.
     *
     * @return int The response count.
     */
    public function countResponses(SessionQuestion $sessionQuestion): int;

    /**
     * Check whether a participant has already responded to a session question.
     *
     * @param SessionQuestion $sessionQuestion The session question.
     * @param string          $participantId   The participant ID.
     *
     * @return bool True if a response exists.
     */
    public function hasParticipantResponded(SessionQuestion $sessionQuestion, string $participantId): bool;

    /**
     * Execute a callback within a database transaction.
     *
     * @param callable $callback The callback to execute.
     *
     * @return mixed The callback return value.
     */
    public function wrapInTransaction(callable $callback): mixed;

    /**
     * Get all session questions ordered by display order with quiz question,
     * question version, answer options, and responses for a specific participant.
     *
     * @param Session $session       The session.
     * @param string  $participantId The participant ID to filter responses by.
     *
     * @return Collection<int, SessionQuestion> The session questions with relations loaded.
     */
    public function getSessionQuestionsWithParticipantResponses(Session $session, string $participantId): Collection;

    /**
     * Get all session questions ordered by display order with quiz question,
     * question version, answer options, and all participant responses.
     *
     * @param Session $session The session.
     *
     * @return Collection<int, SessionQuestion> The session questions with relations loaded.
     */
    public function getSessionQuestionsWithAllResponses(Session $session): Collection;
}
