<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GambleUse;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Repositories\Contracts\SessionParticipantRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\SessionParticipantServiceContract;
use Illuminate\Support\Collection;

class SessionParticipantService extends BaseService implements SessionParticipantServiceContract
{
    protected SessionParticipantRepositoryContract $repository;

    public function __construct(SessionParticipantRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findByUserId(Session $session, string $userId): ?SessionParticipant
    {
        return $this->repository->findByUserId(session: $session, userId: $userId);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findParticipantById(string $participantId): ?SessionParticipant
    {
        return $this->repository->findById(participantId: $participantId);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createForSession(Session $session, array $data): SessionParticipant
    {
        return $this->repository->createForSession(
            session: $session,
            data: $data
        );
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countForSession(Session $session): int
    {
        return $this->repository->countForSession(session: $session);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getOrderedByScore(Session $session): Collection
    {
        return $this->repository->getOrderedByScore(session: $session);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function incrementScore(SessionParticipant $participant, int $amount): void
    {
        $this->repository->incrementScore(
            participant: $participant,
            amount: $amount
        );
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function updateParticipant(SessionParticipant $participant, array $data): void
    {
        $this->repository->updateParticipant(
            participant: $participant,
            data: $data
        );
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getWithResponses(Session $session): Collection
    {
        return $this->repository->getWithResponses(session: $session);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createGambleUse(array $data): GambleUse
    {
        return $this->repository->createGambleUse(data: $data);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getModelForPolicy(): string
    {
        return SessionParticipant::class;
    }
}
