<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\GambleUse;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SessionParticipantRepositoryContract;
use Illuminate\Support\Collection;

class SessionParticipantRepository extends BaseRepository implements SessionParticipantRepositoryContract
{
    public function __construct(SessionParticipant $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findByUserId(Session $session, string $userId): ?SessionParticipant
    {
        return $session->participants()
            ->where(column: 'user_id', operator: '=', value: $userId)
            ->first();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findById(string $participantId): ?SessionParticipant
    {
        return $this->model->newQuery()->find(id: $participantId);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createForSession(Session $session, array $data): SessionParticipant
    {
        return $session->participants()->create(attributes: $data);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countForSession(Session $session): int
    {
        return $session->participants()->count();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getOrderedByScore(Session $session): Collection
    {
        return $session->participants()
            ->orderByDesc(column: 'total_score')
            ->get();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function incrementScore(SessionParticipant $participant, int $amount): void
    {
        $participant->increment(column: 'total_score', amount: $amount);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function updateParticipant(SessionParticipant $participant, array $data): void
    {
        $participant->update(attributes: $data);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getWithResponses(Session $session): Collection
    {
        return $session->participants()
            ->orderByDesc(column: 'total_score')
            ->with(relations: [
                'responses.sessionQuestion.quizQuestion.questionVersion.answerOptions',
            ])
            ->get();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createGambleUse(array $data): GambleUse
    {
        return GambleUse::create(attributes: $data);
    }
}
