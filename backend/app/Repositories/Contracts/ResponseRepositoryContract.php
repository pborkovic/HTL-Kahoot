<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Response;
use App\Models\Session;
use App\Models\SessionQuestion;

interface ResponseRepositoryContract extends BaseRepositoryContract
{
    /**
     * Create a response for a session question.
     *
     * @param  SessionQuestion  $sessionQuestion  The session question.
     * @param  array<string, mixed>  $data  The response attributes.
     * @return Response The newly created response.
     */
    public function createForSessionQuestion(SessionQuestion $sessionQuestion, array $data): Response;

    /**
     * Count the responses for a session question.
     *
     * @param  SessionQuestion  $sessionQuestion  The session question.
     * @return int The response count.
     */
    public function countForSessionQuestion(SessionQuestion $sessionQuestion): int;

    /**
     * Check whether a participant has already responded to a session question.
     *
     * @param  SessionQuestion  $sessionQuestion  The session question.
     * @param  string  $participantId  The participant ID.
     * @return bool True if a response exists.
     */
    public function hasParticipantResponded(SessionQuestion $sessionQuestion, string $participantId): bool;

    /**
     * Find a response by its ID.
     *
     * @param  string  $responseId  The response ID.
     * @return Response|null The response, or null if not found.
     */
    public function findById(string $responseId): ?Response;

    /**
     * Update a response's attributes.
     *
     * @param  Response  $response  The response to update.
     * @param  array<string, mixed>  $data  The attributes to update.
     */
    public function updateResponse(Response $response, array $data): void;

    /**
     * Check if any responses in this session are still pending AI evaluation.
     *
     * @param  Session  $session  The session.
     * @return bool True if any responses have is_correct = null.
     */
    public function hasPendingEvaluations(Session $session): bool;
}
