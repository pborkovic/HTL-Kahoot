<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Response;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\SessionQuestion;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SessionRepositoryContract;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SessionRepository extends BaseRepository implements SessionRepositoryContract
{
    public function __construct(Session $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePin(string $gamePin): ?Session
    {
        try {
            return $this->model
                ->where(column: 'game_pin', operator: '=', value: $gamePin)
                ->first();
        } catch (Exception $e) {
            Log::error(message: "Error finding session by game pin: {$e->getMessage()}", context: [
                'model'    => get_class(object: $this->model),
                'game_pin' => $gamePin,
                'trace'    => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinWithParticipantsOrFail(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->with(relations: 'participants')
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinOrFail(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinWithQuizQuestions(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->with(relations: [
                'quiz.quizQuestions' => fn($q) => $q->orderBy(column: 'sort_order'),
                'quiz.quizQuestions.questionVersion.answerOptions',
            ])
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function generateUniqueGamePin(): string
    {
        do {
            $pin = str_pad(
                string: (string) random_int(min: 0, max: 99999999),
                length: 8,
                pad_string: '0',
                pad_type: STR_PAD_LEFT
            );
        } while ($this->exists(field: 'game_pin', value: $pin));

        return $pin;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateSession(Session $session, array $data): void
    {
        $session->update(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function refreshSession(Session $session): Session
    {
        return $session->fresh();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function loadSessionRelations(Session $session, string|array $relations): Session
    {
        return $session->load(relations: $relations);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findParticipantByUserId(Session $session, string $userId): ?SessionParticipant
    {
        return $session->participants()
            ->where(column: 'user_id', operator: '=', value: $userId)
            ->first();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createParticipant(Session $session, array $data): SessionParticipant
    {
        return $session->participants()->create(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countParticipants(Session $session): int
    {
        return $session->participants()->count();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getParticipantsOrderedByScore(Session $session): Collection
    {
        return $session->participants()
            ->orderByDesc(column: 'total_score')
            ->get();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function incrementParticipantScore(SessionParticipant $participant, int $amount): void
    {
        $participant->increment(column: 'total_score', amount: $amount);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateParticipant(SessionParticipant $participant, array $data): void
    {
        $participant->update(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createSessionQuestion(Session $session, array $data): SessionQuestion
    {
        return $session->sessionQuestions()->create(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countSessionQuestions(Session $session): int
    {
        return $session->sessionQuestions()->count();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findSessionQuestionByDisplayOrder(Session $session, int $displayOrder): ?SessionQuestion
    {
        return $session->sessionQuestions()
            ->where(column: 'display_order', operator: '=', value: $displayOrder)
            ->first();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findSessionQuestionByDisplayOrderOrFail(Session $session, int $displayOrder): SessionQuestion
    {
        return $session->sessionQuestions()
            ->where(column: 'display_order', operator: '=', value: $displayOrder)
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateSessionQuestion(SessionQuestion $sessionQuestion, array $data): void
    {
        $sessionQuestion->update(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function loadSessionQuestionRelations(SessionQuestion $sessionQuestion, string|array $relations): SessionQuestion
    {
        return $sessionQuestion->load(relations: $relations);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createResponse(SessionQuestion $sessionQuestion, array $data): Response
    {
        return $sessionQuestion->responses()->create(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countResponses(SessionQuestion $sessionQuestion): int
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
    public function wrapInTransaction(callable $callback): mixed
    {
        return DB::transaction(callback: $callback);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getSessionQuestionsWithParticipantResponses(Session $session, string $participantId): Collection
    {
        return $session->sessionQuestions()
            ->orderBy(column: 'display_order')
            ->with(relations: [
                'quizQuestion.questionVersion.answerOptions',
                'responses' => fn($q) => $q->where(column: 'participant_id', operator: '=', value: $participantId),
            ])
            ->get();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getSessionQuestionsWithAllResponses(Session $session): Collection
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

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getParticipantsWithResponses(Session $session): Collection
    {
        return $session->participants()
            ->orderByDesc(column: 'total_score')
            ->with(relations: [
                'responses.sessionQuestion.quizQuestion.questionVersion.answerOptions',
            ])
            ->get();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function hasPendingFreeTextEvaluations(Session $session): bool
    {
        return Response::whereHas(
            relation: 'sessionQuestion',
            callback: fn($q) => $q->where(column: 'session_id', operator: '=', value: $session->id)
        )->whereNull(columns: 'is_correct')->exists();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findResponseById(string $responseId): ?Response
    {
        return Response::find(id: $responseId);
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
    public function findParticipantById(string $participantId): ?SessionParticipant
    {
        return SessionParticipant::find(id: $participantId);
    }
}
