<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\GambleUse;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Support\Collection;

interface SessionParticipantServiceContract extends BaseServiceContract
{
    /**
     * Find a participant in a session by user ID.
     *
     * @param  Session  $session  The session.
     * @param  string  $userId  The user ID.
     * @return SessionParticipant|null The participant, or null if not found.
     */
    public function findByUserId(Session $session, string $userId): ?SessionParticipant;

    /**
     * Find a session participant by its ID.
     *
     * @param  string  $participantId  The participant ID.
     * @return SessionParticipant|null The participant, or null if not found.
     */
    public function findParticipantById(string $participantId): ?SessionParticipant;

    /**
     * Create a participant for a session.
     *
     * @param  Session  $session  The session.
     * @param  array<string, mixed>  $data  The participant attributes.
     * @return SessionParticipant The newly created participant.
     */
    public function createForSession(Session $session, array $data): SessionParticipant;

    /**
     * Count the participants in a session.
     *
     * @param  Session  $session  The session.
     * @return int The participant count.
     */
    public function countForSession(Session $session): int;

    /**
     * Get all participants in a session ordered by total score descending.
     *
     * @param  Session  $session  The session.
     * @return Collection<int, SessionParticipant> The ordered participants.
     */
    public function getOrderedByScore(Session $session): Collection;

    /**
     * Increment a participant's total score.
     *
     * @param  SessionParticipant  $participant  The participant.
     * @param  int  $amount  The amount to add.
     */
    public function incrementScore(SessionParticipant $participant, int $amount): void;

    /**
     * Update a participant's attributes.
     *
     * @param  SessionParticipant  $participant  The participant.
     * @param  array<string, mixed>  $data  The attributes to update.
     */
    public function updateParticipant(SessionParticipant $participant, array $data): void;

    /**
     * Get all participants for a session with their response data eagerly loaded.
     *
     * @param  Session  $session  The session.
     * @return Collection<int, SessionParticipant> The participants with responses loaded.
     */
    public function getWithResponses(Session $session): Collection;

    /**
     * Record a gamble use for a participant on a session question.
     *
     * @param  array<string, mixed>  $data  The gamble use attributes.
     * @return GambleUse The created gamble use record.
     */
    public function createGambleUse(array $data): GambleUse;
}
