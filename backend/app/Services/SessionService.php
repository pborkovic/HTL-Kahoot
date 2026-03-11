<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CreateSessionDto;
use App\Events\AnswerReceived;
use App\Events\GameFinished;
use App\Events\GameStarted;
use App\Events\ParticipantJoined;
use App\Events\QuestionClosed;
use App\Events\QuestionOpened;
use App\Models\Response;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\SessionQuestion;
use App\Models\User;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\SessionServiceContract;
use Carbon\Carbon;
use InvalidArgumentException;
use RuntimeException;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SessionService extends BaseService implements SessionServiceContract
{
    protected SessionRepositoryContract $repository;

    public function __construct(SessionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePin(string $gamePin): Session
    {
        return $this->repository->findByGamePinWithParticipantsOrFail(gamePin: $gamePin);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createGame(CreateSessionDto $dto, User $host): Session
    {
        $gamePin = $this->repository->generateUniqueGamePin();

        $qrCodeDataUri = $this->generateQrCodeDataUri(gamePin: $gamePin);

        $session = $this->repository->create(data: [
            'quiz_id'      => $dto->quizId,
            'host_id'      => $host->id,
            'game_pin'     => $gamePin,
            'qr_code_url'  => $qrCodeDataUri,
            'status'       => 'lobby',
        ]);

        return $this->repository->loadSessionRelations(session: $session, relations: ['quiz', 'host']);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function joinSession(string $gamePin, User $user): SessionParticipant
    {
        $session = $this->repository->findByGamePin(gamePin: $gamePin);

        if (!$session) {
            throw new InvalidArgumentException(message: 'Kein Spiel mit diesem Code gefunden.');
        }

        if ($session->status !== 'lobby') {
            throw new RuntimeException(message: 'Dieses Spiel hat bereits begonnen oder ist beendet.');
        }

        $existing = $this->repository->findParticipantByUserId(session: $session, userId: $user->id);

        if ($existing) {
            return $existing;
        }

        $nickname = $user->display_name ?? $user->username ?? explode(separator: '@', string: $user->email)[0];

        $participant = $this->repository->createParticipant(session: $session, data: [
            'user_id'      => $user->id,
            'nickname'     => $nickname,
            'total_score'  => 0,
            'is_connected' => true,
            'joined_at'    => now(),
        ]);

        broadcast(event: new ParticipantJoined(
            gamePin: $gamePin,
            participantId: $participant->id,
            nickname: $participant->nickname,
            joinedAt: $participant->joined_at->toIso8601String(),
        ))->toOthers();

        return $participant;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function generateQrCodeDataUri(string $gamePin): string
    {
        $joinUrl = config(key: 'app.frontend_url', default: config(key: 'app.url')) . '/join/' . $gamePin;

        $qrCode = QrCode::format(format: 'svg')
            ->size(pixels: 300)
            ->margin(margin: 1)
            ->generate(text: $joinUrl);

        return 'data:image/svg+xml;base64,' . base64_encode(string: $qrCode);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function startGame(string $gamePin, User $host): Session
    {
        $session = $this->repository->findByGamePinWithQuizQuestions(gamePin: $gamePin);

        $this->assertHost(session: $session, user: $host);
        $this->assertStatus(session: $session, expected: 'lobby');

        $quizQuestions = $session->quiz->quizQuestions;

        if ($quizQuestions->isEmpty()) {
            throw new RuntimeException(message: 'Das Quiz enthält keine Fragen.');
        }

        $result = $this->repository->wrapInTransaction(callback: function () use ($session, $quizQuestions): Session {
            $order = $session->quiz->randomize_questions
                ? $quizQuestions->shuffle()->values()
                : $quizQuestions;

            foreach ($order as $index => $quizQuestion) {
                $this->repository->createSessionQuestion(session: $session, data: [
                    'quiz_question_id' => $quizQuestion->id,
                    'display_order'    => $index,
                    'opened_at'        => $index === 0 ? now() : null,
                    'closed_at'        => null,
                ]);
            }

            $this->repository->updateSession(session: $session, data: [
                'status'               => 'active',
                'current_question_idx' => 0,
                'started_at'           => now(),
            ]);

            return $this->repository->refreshSession(session: $session);
        });

        broadcast(
            event: new GameStarted(gamePin: $gamePin)
        );

        $totalQuestions = $this->repository->countSessionQuestions(session: $result);
        broadcast(event: new QuestionOpened(
            gamePin: $gamePin,
            questionIndex: 0,
            totalQuestions: $totalQuestions,
        ));

        return $result;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function nextQuestion(string $gamePin, User $host): Session
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);

        $this->assertHost(session: $session, user: $host);
        $this->assertStatus(session: $session, expected: 'active');

        $currentQuestion = $this->findCurrentSessionQuestion(session: $session);
        $this->repository->updateSessionQuestion(sessionQuestion: $currentQuestion, data: ['closed_at' => now()]);

        broadcast(event: new QuestionClosed(
            gamePin: $gamePin,
            questionIndex: $session->current_question_idx,
        ));

        $nextIdx = $session->current_question_idx + 1;
        $totalQuestions = $this->repository->countSessionQuestions(session: $session);

        if ($nextIdx >= $totalQuestions) {
            $this->repository->updateSession(session: $session, data: [
                'status'               => 'finished',
                'current_question_idx' => $nextIdx - 1,
                'finished_at'          => now(),
            ]);

            broadcast(event: new GameFinished(gamePin: $gamePin));
        } else {
            $nextQuestion = $this->repository->findSessionQuestionByDisplayOrderOrFail(
                session: $session,
                displayOrder: $nextIdx,
            );

            $this->repository->updateSessionQuestion(
                sessionQuestion: $nextQuestion,
                data: ['opened_at' => now()]
            );

            $this->repository->updateSession(session: $session, data: [
                'current_question_idx' => $nextIdx,
            ]);

            broadcast(event: new QuestionOpened(
                gamePin: $gamePin,
                questionIndex: $nextIdx,
                totalQuestions: $totalQuestions,
            ));
        }

        return $this->repository->refreshSession(session: $session);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getCurrentQuestion(string $gamePin): array
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);
        $this->assertStatus(session: $session, expected: 'active');

        $sessionQuestion = $this->findCurrentSessionQuestion(session: $session);

        $this->repository->loadSessionQuestionRelations(
            sessionQuestion: $sessionQuestion,
            relations: 'quizQuestion.questionVersion.answerOptions',
        );

        $quizQuestion = $sessionQuestion->quizQuestion;
        $questionVersion = $quizQuestion->questionVersion;
        $timeLimit = $this->resolveTimeLimit(
            quizQuestion: $quizQuestion,
            questionVersion: $questionVersion
        );
        $timeRemaining = $this->calculateTimeRemaining(
            openedAt: $sessionQuestion->opened_at,
            timeLimit: $timeLimit
        );
        $totalQuestions = $this->repository->countSessionQuestions(session: $session);

        $answerOptions = $questionVersion->answerOptions
            ->sortBy(callback: 'sort_order')
            ->values()
            ->map(callback: fn($opt) => [
                'id'         => $opt->id,
                'text'       => $opt->text,
                'sort_order' => $opt->sort_order,
            ])
            ->all();

        return [
            'question_text'  => $questionVersion->title,
            'answer_options' => $answerOptions,
            'question_index' => $session->current_question_idx,
            'total_questions' => $totalQuestions,
            'time_limit'     => $timeLimit,
            'time_remaining' => $timeRemaining,
            'opened_at'      => $sessionQuestion->opened_at->toIso8601String(),
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function submitAnswer(string $gamePin, User $user, array $answerData): Response
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);
        $this->assertStatus(
            session: $session,
            expected: 'active'
        );

        $participant = $this->findParticipant(
            session: $session,
            user: $user
        );
        $sessionQuestion = $this->findCurrentSessionQuestion(session: $session);

        $this->repository->loadSessionQuestionRelations(
            sessionQuestion: $sessionQuestion,
            relations: 'quizQuestion.questionVersion.answerOptions',
        );

        $quizQuestion = $sessionQuestion->quizQuestion;
        $questionVersion = $quizQuestion->questionVersion;
        $timeLimit = $this->resolveTimeLimit(
            quizQuestion: $quizQuestion,
            questionVersion: $questionVersion
        );

        $this->assertQuestionOpen(
            sessionQuestion: $sessionQuestion,
            timeLimit: $timeLimit
        );
        $this->assertNotAlreadyAnswered(
            sessionQuestion: $sessionQuestion,
            participant: $participant
        );

        $submittedAt = now();
        $timeTakenMs = (int) $sessionQuestion->opened_at->diffInMilliseconds(date: $submittedAt);
        $submittedIds = $answerData['answer'];
        $correctIds = $questionVersion->answerOptions
            ->where(key: 'is_correct', operator: '=', value: true)
            ->pluck(value: 'id')
            ->all();

        $isCorrect     = $this->evaluateAnswer(
            submittedIds: $submittedIds,
            correctIds: $correctIds
        );
        $scoreAwarded  = $this->calculateScore(
            isCorrect: $isCorrect,
            quizQuestion: $quizQuestion,
            questionVersion: $questionVersion,
            session: $session,
            timeTakenMs: $timeTakenMs,
            timeLimit: $timeLimit,
        );

        $response = $this->repository->wrapInTransaction(callback: function () use ($sessionQuestion, $participant, $submittedIds, $isCorrect, $scoreAwarded, $timeTakenMs, $submittedAt): Response {
            $response = $this->repository->createResponse(sessionQuestion: $sessionQuestion, data: [
                'participant_id'    => $participant->id,
                'answer'            => $submittedIds,
                'is_correct'        => $isCorrect,
                'score_awarded'     => $scoreAwarded,
                'time_taken_ms'     => $timeTakenMs,
                'gamble_multiplier' => 1.00,
                'submitted_at'      => $submittedAt,
            ]);

            $this->repository->incrementParticipantScore(
                participant: $participant,
                amount: $scoreAwarded
            );

            return $response;
        });

        broadcast(event: new AnswerReceived(
            gamePin: $gamePin,
            totalResponses: $this->repository->countResponses(sessionQuestion: $sessionQuestion),
            totalParticipants: $this->repository->countParticipants(session: $session),
        ));

        return $response;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getSessionStatus(string $gamePin): array
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);
        $totalQuestions = $this->repository->countSessionQuestions(session: $session);
        $isQuestionOpen = false;

        if ($session->status === 'active' && $session->current_question_idx !== null) {
            $currentQuestion = $this->repository->findSessionQuestionByDisplayOrder(
                session: $session,
                displayOrder: $session->current_question_idx,
            );

            $isQuestionOpen = $currentQuestion
                && $currentQuestion->opened_at !== null
                && $currentQuestion->closed_at === null;
        }

        return [
            'status'               => $session->status,
            'current_question_idx' => $session->current_question_idx,
            'is_question_open'     => $isQuestionOpen,
            'total_questions'      => $totalQuestions,
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getQuestionResults(string $gamePin): array
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);

        $sessionQuestion = $this->findCurrentSessionQuestion(session: $session);
        $this->repository->loadSessionQuestionRelations(
            sessionQuestion: $sessionQuestion,
            relations: [
                'responses',
                'quizQuestion.questionVersion.answerOptions',
            ],
        );

        $answerOptions = $sessionQuestion->quizQuestion->questionVersion->answerOptions;
        $responses = $sessionQuestion->responses;
        $totalParticipants = $this->repository->countParticipants(session: $session);

        $distribution = $answerOptions
            ->sortBy(callback: 'sort_order')
            ->values()
            ->map(callback: function ($option) use ($responses) {
                $count = $responses->filter(
                    callback: fn($r) => in_array(needle: $option->id, haystack: $r->answer, strict: true)
                )->count();

                return [
                    'option_id'  => $option->id,
                    'option_text' => $option->text,
                    'count'      => $count,
                    'is_correct' => $option->is_correct,
                ];
            })
            ->all();

        $correctCount = $responses->where(key: 'is_correct', operator: '=', value: true)->count();

        return [
            'answer_distribution' => $distribution,
            'total_responses'     => $responses->count(),
            'correct_count'       => $correctCount,
            'total_participants'  => $totalParticipants,
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getLeaderboard(string $gamePin): array
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);

        return $this->buildLeaderboard(session: $session);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getFinalResults(string $gamePin): array
    {
        $session = $this->repository->findByGamePinOrFail(gamePin: $gamePin);
        $this->repository->loadSessionRelations(
            session: $session,
            relations: 'quiz'
        );

        return [
            'session_id'         => $session->id,
            'quiz_title'         => $session->quiz->title,
            'total_questions'    => $this->repository->countSessionQuestions(session: $session),
            'total_participants' => $this->repository->countParticipants(session: $session),
            'leaderboard'        => $this->buildLeaderboard(session: $session),
        ];
    }

    public function getModelForPolicy(): string
    {
        return Session::class;
    }

    /**
     * Assert that the given user is the session host.
     *
     * @param Session $session The session to check.
     * @param User    $user    The user to verify.
     *
     * @throws RuntimeException If the user is not the host.
     *
     * @author Philipp Borkovic
     */
    private function assertHost(Session $session, User $user): void
    {
        if ($session->host_id !== $user->id) {
            throw new RuntimeException(message: 'Nur der Host kann diese Aktion ausführen.');
        }
    }

    /**
     * Assert that the session has the expected status.
     *
     * @param Session $session  The session to check.
     * @param string  $expected The expected status value.
     *
     * @throws RuntimeException If the session status does not match.
     *
     * @author Philipp Borkovic
     */
    private function assertStatus(Session $session, string $expected): void
    {
        if ($session->status !== $expected) {
            throw new RuntimeException(
                message: "Diese Aktion ist im Status '{$session->status}' nicht möglich."
            );
        }
    }

    /**
     * Find the currently active SessionQuestion for a session.
     *
     * @param Session $session The session to query.
     *
     * @return SessionQuestion The current session question.
     *
     * @throws RuntimeException If no current question is set.
     *
     * @author Philipp Borkovic
     */
    private function findCurrentSessionQuestion(Session $session): SessionQuestion
    {
        if ($session->current_question_idx === null) {
            throw new RuntimeException(message: 'Keine aktive Frage vorhanden.');
        }

        return $this->repository->findSessionQuestionByDisplayOrderOrFail(
            session: $session,
            displayOrder: $session->current_question_idx,
        );
    }

    /**
     * Find the participant record for a user in a session.
     *
     * @param Session $session The session.
     * @param User    $user    The user.
     *
     * @return SessionParticipant The participant record.
     *
     * @throws RuntimeException If the user is not a participant.
     *
     * @author Philipp Borkovic
     */
    private function findParticipant(Session $session, User $user): SessionParticipant
    {
        $participant = $this->repository->findParticipantByUserId(
            session: $session,
            userId: $user->id
        );

        if (!$participant) {
            throw new RuntimeException(message: 'Du bist kein Teilnehmer dieser Session.');
        }

        return $participant;
    }

    /**
     * Resolve the effective time limit for a question.
     *
     * Uses the quiz question override, falls back to the version default,
     * then to 30 seconds as an ultimate fallback.
     *
     * @param \App\Models\QuizQuestion    $quizQuestion    The quiz question.
     * @param \App\Models\QuestionVersion $questionVersion The question version.
     *
     * @return int The time limit in seconds.
     *
     * @author Philipp Borkovic
     */
    private function resolveTimeLimit(mixed $quizQuestion, mixed $questionVersion): int
    {
        return $quizQuestion->time_limit_override
            ?? $questionVersion->default_time_limit
            ?? 30;
    }

    /**
     * Calculate remaining time for an open question.
     *
     * @param Carbon $openedAt  When the question was opened.
     * @param int    $timeLimit The time limit in seconds.
     *
     * @return float Remaining seconds (minimum 0).
     *
     * @author Philipp Borkovic
     */
    private function calculateTimeRemaining(Carbon $openedAt, int $timeLimit): float
    {
        $elapsed = now()->diffInSeconds(date: $openedAt, absolute: true);

        return max(0, $timeLimit - $elapsed);
    }

    /**
     * Assert that the current question is still open for answers.
     *
     * A question is open if it has not been closed and the time limit
     * has not been exceeded.
     *
     * @param SessionQuestion $sessionQuestion The session question.
     * @param int             $timeLimit       The time limit in seconds.
     *
     * @throws RuntimeException If the question is closed or time has expired.
     *
     * @author Philipp Borkovic
     */
    private function assertQuestionOpen(SessionQuestion $sessionQuestion, int $timeLimit): void
    {
        if ($sessionQuestion->closed_at !== null) {
            throw new RuntimeException(message: 'Diese Frage wurde bereits geschlossen.');
        }

        $timeRemaining = $this->calculateTimeRemaining(
            openedAt: $sessionQuestion->opened_at,
            timeLimit: $timeLimit,
        );

        if ($timeRemaining <= 0) {
            throw new RuntimeException(message: 'Die Zeit für diese Frage ist abgelaufen.');
        }
    }

    /**
     * Assert that the participant has not already answered the question.
     *
     * @param SessionQuestion    $sessionQuestion The session question.
     * @param SessionParticipant $participant     The participant.
     *
     * @throws RuntimeException If the participant already submitted an answer.
     *
     * @author Philipp Borkovic
     */
    private function assertNotAlreadyAnswered(SessionQuestion $sessionQuestion, SessionParticipant $participant): void
    {
        $exists = $this->repository->hasParticipantResponded(
            sessionQuestion: $sessionQuestion,
            participantId: $participant->id,
        );

        if ($exists) {
            throw new RuntimeException(message: 'Du hast diese Frage bereits beantwortet.');
        }
    }

    /**
     * Evaluate whether the submitted answer is correct.
     *
     * Compares submitted option IDs against the correct option IDs.
     * The answer is correct only if both sets match exactly.
     *
     * @param array<int, string> $submittedIds The submitted answer option UUIDs.
     * @param array<int, string> $correctIds   The correct answer option UUIDs.
     *
     * @return bool Whether the answer is correct.
     *
     * @author Philipp Borkovic
     */
    private function evaluateAnswer(array $submittedIds, array $correctIds): bool
    {
        $submitted = collect(value: $submittedIds)->sort()->values()->all();
        $correct   = collect(value: $correctIds)->sort()->values()->all();

        return $submitted === $correct;
    }

    /**
     * Calculate the score for an answer.
     *
     * Applies speed scoring if enabled on the quiz. The speed factor
     * scales linearly between speed_factor_min (answering at the deadline)
     * and speed_factor_max (answering instantly).
     *
     * @param bool                        $isCorrect       Whether the answer is correct.
     * @param \App\Models\QuizQuestion    $quizQuestion    The quiz question (for points override).
     * @param \App\Models\QuestionVersion $questionVersion The question version (for default points).
     * @param Session                     $session         The session (for quiz scoring settings).
     * @param int                         $timeTakenMs     Time taken in milliseconds.
     * @param int                         $timeLimit       The time limit in seconds.
     *
     * @return int The score to award (0 if incorrect).
     *
     * @author Philipp Borkovic
     */
    private function calculateScore(
        bool $isCorrect,
        mixed $quizQuestion,
        mixed $questionVersion,
        Session $session,
        int $timeTakenMs,
        int $timeLimit,
    ): int {
        if (!$isCorrect) {
            return 0;
        }

        $basePoints = $quizQuestion->points_override ?? $questionVersion->default_points ?? 1000;

        $this->repository->loadSessionRelations(
            session: $session,
            relations: 'quiz'
        );
        $quiz = $session->quiz;

        if (!$quiz->speed_scoring) {
            return $basePoints;
        }

        $timeLimitMs    = $timeLimit * 1000;
        $remainingRatio = max(0, ($timeLimitMs - $timeTakenMs) / $timeLimitMs);

        $speedFactor = $quiz->speed_factor_min
            + $remainingRatio * ($quiz->speed_factor_max - $quiz->speed_factor_min);

        return (int) round(num: $basePoints * $speedFactor);
    }

    /**
     * Build a ranked leaderboard from session participants.
     *
     * @param Session $session The session.
     *
     * @return array<int, array{
     *     rank: int,
     *     participant_id: string,
     *     nickname: string,
     *     total_score: int
     * }>
     *
     * @author Philipp Borkovic
     */
    private function buildLeaderboard(Session $session): array
    {
        $participants = $this->repository->getParticipantsOrderedByScore(session: $session);

        return $participants->values()->map(callback: fn($p, $i) => [
            'rank'           => $i + 1,
            'participant_id' => $p->id,
            'nickname'       => $p->nickname,
            'total_score'    => $p->total_score,
        ])->all();
    }
}
