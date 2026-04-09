<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Session;
use App\Models\SessionQuestion;
use App\Repositories\Contracts\SessionQuestionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\SessionQuestionServiceContract;
use Illuminate\Support\Collection;

class SessionQuestionService extends BaseService implements SessionQuestionServiceContract
{
    protected SessionQuestionRepositoryContract $repository;

    public function __construct(SessionQuestionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createForSession(Session $session, array $data): SessionQuestion
    {
        return $this->repository->createForSession(
            session: $session,
            data: $data
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countForSession(Session $session): int
    {
        return $this->repository->countForSession(session: $session);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByDisplayOrder(Session $session, int $displayOrder): ?SessionQuestion
    {
        return $this->repository->findByDisplayOrder(
            session: $session,
            displayOrder: $displayOrder
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByDisplayOrderOrFail(Session $session, int $displayOrder): SessionQuestion
    {
        return $this->repository->findByDisplayOrderOrFail(
            session: $session,
            displayOrder: $displayOrder
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateSessionQuestion(SessionQuestion $sessionQuestion, array $data): void
    {
        $this->repository->updateSessionQuestion(
            sessionQuestion: $sessionQuestion,
            data: $data
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function loadRelations(SessionQuestion $sessionQuestion, string|array $relations): SessionQuestion
    {
        return $this->repository->loadRelations(
            sessionQuestion: $sessionQuestion,
            relations: $relations
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getWithParticipantResponses(Session $session, string $participantId): Collection
    {
        return $this->repository->getWithParticipantResponses(
            session: $session,
            participantId: $participantId
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getWithAllResponses(Session $session): Collection
    {
        return $this->repository->getWithAllResponses(session: $session);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getModelForPolicy(): string
    {
        return SessionQuestion::class;
    }
}
