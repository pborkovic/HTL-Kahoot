<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Session;
use App\Models\SessionQuestion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

interface SessionQuestionRepositoryContract extends BaseRepositoryContract
{
    /**
     * Create a session question for a session.
     *
     * @param  Session  $session  The session.
     * @param  array<string, mixed>  $data  The session question attributes.
     * @return SessionQuestion The newly created session question.
     */
    public function createForSession(Session $session, array $data): SessionQuestion;

    /**
     * Count the session questions in a session.
     *
     * @param  Session  $session  The session.
     * @return int The question count.
     */
    public function countForSession(Session $session): int;

    /**
     * Find a session question by its display order.
     *
     * @param  Session  $session  The session.
     * @param  int  $displayOrder  The display order index.
     * @return SessionQuestion|null The session question, or null if not found.
     */
    public function findByDisplayOrder(Session $session, int $displayOrder): ?SessionQuestion;

    /**
     * Find a session question by its display order, or fail.
     *
     * @param  Session  $session  The session.
     * @param  int  $displayOrder  The display order index.
     * @return SessionQuestion The session question.
     *
     * @throws ModelNotFoundException If not found.
     */
    public function findByDisplayOrderOrFail(Session $session, int $displayOrder): SessionQuestion;

    /**
     * Update a session question's attributes.
     *
     * @param  SessionQuestion  $sessionQuestion  The session question.
     * @param  array<string, mixed>  $data  The attributes to update.
     */
    public function updateSessionQuestion(SessionQuestion $sessionQuestion, array $data): void;

    /**
     * Eager-load relations on a session question.
     *
     * @param  SessionQuestion  $sessionQuestion  The session question.
     * @param  string|array<string>  $relations  The relations to load.
     * @return SessionQuestion The session question with relations loaded.
     */
    public function loadRelations(SessionQuestion $sessionQuestion, string|array $relations): SessionQuestion;

    /**
     * Get all session questions with quiz question, question version,
     * answer options, and responses for a specific participant.
     *
     * @param  Session  $session  The session.
     * @param  string  $participantId  The participant ID to filter responses by.
     * @return Collection<int, SessionQuestion> The session questions with relations loaded.
     */
    public function getWithParticipantResponses(Session $session, string $participantId): Collection;

    /**
     * Get all session questions with quiz question, question version,
     * answer options, and all participant responses.
     *
     * @param  Session  $session  The session.
     * @return Collection<int, SessionQuestion> The session questions with relations loaded.
     */
    public function getWithAllResponses(Session $session): Collection;
}
