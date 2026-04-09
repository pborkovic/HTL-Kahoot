<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Response;
use App\Models\Session;
use App\Models\SessionQuestion;
use App\Repositories\Contracts\ResponseRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\ResponseServiceContract;

class ResponseService extends BaseService implements ResponseServiceContract
{
    protected ResponseRepositoryContract $repository;

    public function __construct(ResponseRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createForSessionQuestion(SessionQuestion $sessionQuestion, array $data): Response
    {
        return $this->repository->createForSessionQuestion(
            sessionQuestion: $sessionQuestion,
            data: $data
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countForSessionQuestion(SessionQuestion $sessionQuestion): int
    {
        return $this->repository->countForSessionQuestion(sessionQuestion: $sessionQuestion);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function hasParticipantResponded(SessionQuestion $sessionQuestion, string $participantId): bool
    {
        return $this->repository->hasParticipantResponded(
            sessionQuestion: $sessionQuestion,
            participantId: $participantId
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findResponseById(string $responseId): ?Response
    {
        return $this->repository->findById(responseId: $responseId);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateResponse(Response $response, array $data): void
    {
        $this->repository->updateResponse(
            response: $response,
            data: $data
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function hasPendingEvaluations(Session $session): bool
    {
        return $this->repository->hasPendingEvaluations(session: $session);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getModelForPolicy(): string
    {
        return Response::class;
    }
}
