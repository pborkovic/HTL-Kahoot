<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Response;
use App\Models\Session;
use App\Models\SessionQuestion;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\ResponseRepositoryContract;

class ResponseRepository extends BaseRepository implements ResponseRepositoryContract
{
    public function __construct(Response $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createForSessionQuestion(SessionQuestion $sessionQuestion, array $data): Response
    {
        return $sessionQuestion->responses()->create(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countForSessionQuestion(SessionQuestion $sessionQuestion): int
    {
        return $sessionQuestion->responses()->count();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function hasParticipantResponded(SessionQuestion $sessionQuestion, string $participantId): bool
    {
        return $sessionQuestion->responses()
            ->where(column: 'participant_id', operator: '=', value: $participantId)
            ->exists();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findById(string $responseId): ?Response
    {
        return $this->model->newQuery()->find(id: $responseId);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateResponse(Response $response, array $data): void
    {
        $response->update(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function hasPendingEvaluations(Session $session): bool
    {
        return $this->model->newQuery()
            ->whereHas(
                relation: 'sessionQuestion',
                callback: fn($q) => $q->where(column: 'session_id', operator: '=', value: $session->id)
            )
            ->whereNull(columns: 'is_correct')
            ->exists();
    }
}
