<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\DTOs\CreateSessionDto;
use App\Models\Response;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use InvalidArgumentException;
use RuntimeException;

interface SessionServiceContract extends BaseServiceContract
{
    /**
     * Find a session by game pin with participants loaded.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return Session The session with participants relation loaded.
     *
     * @throws ModelNotFoundException If no session found.
     */
    public function findByGamePin(string $gamePin): Session;

    /**
     * Create a new game session with a unique game pin and QR code.
     *
     * @param CreateSessionDto $dto  The session creation data containing the quiz ID.
     * @param User             $host The authenticated user who will host the session.
     *
     * @return Session The created session with quiz and host relations loaded.
     */
    public function createGame(CreateSessionDto $dto, User $host): Session;

    /**
     * Join an existing game session by its game pin.
     *
     * @param string $gamePin The 8-digit game pin of the session to join.
     * @param User   $user    The authenticated user joining the session.
     *
     * @return SessionParticipant The created or existing participant record.
     *
     * @throws InvalidArgumentException If no session with the given game pin exists.
     * @throws RuntimeException         If the session is not in 'lobby' status.
     */
    public function joinSession(string $gamePin, User $user): SessionParticipant;

    /**
     * Generate a base64-encoded SVG QR code data URI for the given game pin.
     *
     * @param string $gamePin The 8-digit game pin to encode in the QR code.
     *
     * @return string The QR code as a data:image/svg+xml;base64 URI.
     */
    public function generateQrCodeDataUri(string $gamePin): string;

    /**
     * Start a game session.
     *
     * Creates SessionQuestion records from the quiz, sets the session to active,
     * and opens the first question.
     *
     * @param string $gamePin The 8-digit game pin.
     * @param User   $host    The authenticated host user.
     *
     * @return Session The updated session.
     *
     * @throws RuntimeException If the session is not in lobby status or the user is not the host.
     */
    public function startGame(string $gamePin, User $host): Session;

    /**
     * Advance to the next question or finish the game.
     *
     * Closes the current question and either opens the next one
     * or finishes the session if all questions have been shown.
     *
     * @param string $gamePin The 8-digit game pin.
     * @param User   $host    The authenticated host user.
     *
     * @return Session The updated session.
     *
     * @throws RuntimeException If the session is not active or the user is not the host.
     */
    public function nextQuestion(string $gamePin, User $host): Session;

    /**
     * Get the current question for a session.
     *
     * Returns question text, answer options (without is_correct),
     * timing information, and position within the quiz.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array{
     *     question_text: string,
     *     answer_options: array<int, array{
     *         id: string,
     *         text: string,
     *         sort_order: int
     *     }>,
     *     question_index: int,
     *     total_questions: int,
     *     time_limit: int,
     *     time_remaining: float,
     *     opened_at: string
     * }
     *
     * @throws RuntimeException If the session is not active or no question is open.
     */
    public function getCurrentQuestion(string $gamePin): array;

    /**
     * Submit an answer for the current question.
     *
     * Validates timing, calculates correctness and score, creates the Response
     * record, and updates the participant's total score.
     *
     * @param string $gamePin The 8-digit game pin.
     * @param User   $user    The authenticated student user.
     * @param array{
     *     answer: array<int, string>
     * } $answerData The submitted answer option UUIDs.
     *
     * @return Response The created response record.
     *
     * @throws RuntimeException If the session is not active, time has expired, or already answered.
     */
    public function submitAnswer(string $gamePin, User $user, array $answerData): Response;

    /**
     * Get the current status of a session.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array{
     *     status: string,
     *     current_question_idx: int|null,
     *     is_question_open: bool,
     *     total_questions: int
     * }
     */
    public function getSessionStatus(string $gamePin): array;

    /**
     * Close the current question without advancing to the next one.
     *
     * @param string $gamePin The 8-digit game pin.
     * @param User   $host    The authenticated host user.
     *
     * @return void
     *
     * @throws RuntimeException If the session is not active or the user is not the host.
     */
    public function closeCurrentQuestion(string $gamePin, User $host): void;

    /**
     * Get answer distribution for the current question.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array{
     *     answer_distribution: array<int, array{
     *         option_id: string,
     *         option_text: string,
     *         count: int,
     *         is_correct: bool
     *     }>,
     *     total_responses: int,
     *     correct_count: int,
     *     total_participants: int
     * }
     */
    public function getQuestionResults(string $gamePin): array;

    /**
     * Get the current leaderboard.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array<int, array{
     *     rank: int,
     *     participant_id: string,
     *     nickname: string,
     *     total_score: int
     * }>
     */
    public function getLeaderboard(string $gamePin): array;

    /**
     * Get final game results.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array{
     *     session_id: string,
     *     quiz_title: string,
     *     total_questions: int,
     *     total_participants: int,
     *     leaderboard: array<int, array{
     *         rank: int,
     *         participant_id: string,
     *         nickname: string,
     *         total_score: int
     *     }>
     * }
     */
    public function getFinalResults(string $gamePin): array;

    /**
     * Get a student's review of all questions in a session.
     *
     * Returns every question with the correct answer options and
     * the answer options the student chose, along with scoring details.
     *
     * @param string $gamePin The 8-digit game pin.
     * @param User   $user    The authenticated student user.
     *
     * @return array{
     *     session_id: string,
     *     quiz_title: string,
     *     total_score: int,
     *     questions: array<int, array{
     *         question_index: int,
     *         question_text: string,
     *         answer_options: array<int, array{
     *             id: string,
     *             text: string,
     *             is_correct: bool,
     *             was_selected: bool,
     *             sort_order: int
     *         }>,
     *         is_correct: bool|null,
     *         score_awarded: int,
     *         time_taken_ms: int|null
     *     }>
     * }
     *
     * @throws RuntimeException If the user is not a participant of the session.
     */
    public function getStudentReview(string $gamePin, User $user): array;

    /**
     * Get a full review of all questions in a session with every student's answers.
     *
     * Returns every question with the correct answer options and each
     * participant's chosen answers with scoring details. Teacher-facing endpoint.
     *
     * @param string $gamePin The 8-digit game pin.
     *
     * @return array{
     *     session_id: string,
     *     quiz_title: string,
     *     participants: array<int, array{
     *         participant_id: string,
     *         nickname: string,
     *         total_score: int
     *     }>,
     *     questions: array<int, array{
     *         question_index: int,
     *         question_text: string,
     *         answer_options: array<int, array{
     *             id: string,
     *             text: string,
     *             is_correct: bool,
     *             sort_order: int
     *         }>,
     *         student_answers: array<int, array{
     *             participant_id: string,
     *             nickname: string,
     *             selected_option_ids: array<int, string>,
     *             is_correct: bool|null,
     *             score_awarded: int,
     *             time_taken_ms: int|null
     *         }>
     *     }>
     * }
     */
    public function getFullReview(string $gamePin): array;
}
