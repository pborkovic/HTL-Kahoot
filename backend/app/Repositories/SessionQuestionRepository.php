<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Session;
use App\Models\SessionQuestion;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SessionQuestionRepositoryContract;
use Illuminate\Support\Collection;

class SessionQuestionRepository extends BaseRepository implements SessionQuestionRepositoryContract
{
    public function __construct(SessionQuestion $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createForSession(Session $session, array $data): SessionQuestion
    {
        return $session->sessionQuestions()->create(attributes: $data);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countForSession(Session $session): int
    {
        return $session->sessionQuestions()->count();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findByDisplayOrder(Session $session, int $displayOrder): ?SessionQuestion
    {
        return $session->sessionQuestions()
            ->where(column: 'display_order', operator: '=', value: $displayOrder)
            ->first();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findByDisplayOrderOrFail(Session $session, int $displayOrder): SessionQuestion
    {
        return $session->sessionQuestions()
            ->where(column: 'display_order', operator: '=', value: $displayOrder)
            ->firstOrFail();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function updateSessionQuestion(SessionQuestion $sessionQuestion, array $data): void
    {
        $sessionQuestion->update(attributes: $data);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function loadRelations(SessionQuestion $sessionQuestion, string|array $relations): SessionQuestion
    {
        return $sessionQuestion->load(relations: $relations);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getWithParticipantResponses(Session $session, string $participantId): Collection
    {
        return $session->sessionQuestions()
            ->orderBy(column: 'display_order')
            ->with(relations: [
                'quizQuestion.questionVersion.answerOptions',
                'responses' => fn ($q) => $q->where(column: 'participant_id', operator: '=', value: $participantId),
            ])
            ->get();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getWithAllResponses(Session $session): Collection
    {
        return $session->sessionQuestions()
            ->orderBy(column: 'display_order')
            ->with(relations: [
                'quizQuestion.questionVersion.answerOptions',
                'quizQuestion.questionVersion.question',
                'responses.participant',
            ])
            ->get();
    }
}
