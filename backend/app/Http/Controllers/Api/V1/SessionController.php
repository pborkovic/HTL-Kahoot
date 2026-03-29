<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateSessionDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CreateSessionRequest;
use App\Http\Requests\Api\V1\JoinSessionRequest;
use App\Http\Requests\Api\V1\SubmitAnswerRequest;
use App\Http\Resources\Api\V1\SessionParticipantResource;
use App\Http\Resources\Api\V1\SessionResource;
use App\Models\Session;
use App\Services\Contracts\SessionServiceContract;
use Exception;
use InvalidArgumentException;
use RuntimeException;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class SessionController extends Controller
{
    public function __construct(
        private readonly SessionServiceContract $sessionService
    ) {}

    #[Get(
        path: '/api/v1/sessions/{gamePin}',
        description: 'Returns session details including QR code and participants list. The host of the session can access this endpoint.',
        summary: 'Get a session by game pin',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Session details', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/SessionResource')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(string $gamePin): JsonResponse
    {
        $session = $this->sessionService->findByGamePin(gamePin: $gamePin);

        return response()->json(data: [
            'data' => new SessionResource($session),
        ]);
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/participants',
        description: 'Returns the list of participants for a session. Used for polling in the lobby.',
        summary: 'Get session participants',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Participants list', content: new JsonContent(properties: [
                new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/SessionParticipant')),
            ])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function participants(string $gamePin): JsonResponse
    {
        $session = $this->sessionService->findByGamePin(gamePin: $gamePin);

        return response()->json(data: [
            'data' => SessionParticipantResource::collection(resource: $session->participants),
        ]);
    }

    #[Post(
        path: '/api/v1/sessions',
        description: 'Creates a new game session for a quiz. Generates a unique 8-digit game pin and a QR code for players to join. The authenticated user becomes the host. Requires teacher, admin, or superadmin role.',
        summary: 'Create a new game session',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['quiz_id'],
                properties: [
                    new Property(
                        property: 'quiz_id',
                        description: 'The UUID of the quiz to create a game session for',
                        type: 'string',
                        format: 'uuid',
                        example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    ),
                ],
            ),
        ),
        tags: ['Sessions'],
        responses: [
            new Response(
                response: 201,
                description: 'Game session created successfully',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'session',
                            properties: [
                                new Property(property: 'id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'quiz_id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'host_id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'game_pin', type: 'string', example: '48291037'),
                                new Property(property: 'qr_code_url', type: 'string', example: 'data:image/svg+xml;base64,...'),
                                new Property(property: 'status', type: 'string', example: 'lobby'),
                                new Property(property: 'current_question_idx', type: 'integer', example: null, nullable: true),
                                new Property(property: 'started_at', type: 'string', format: 'date-time', example: null, nullable: true),
                                new Property(property: 'finished_at', type: 'string', format: 'date-time', example: null, nullable: true),
                                new Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'quiz', type: 'object'),
                                new Property(property: 'host', type: 'object'),
                                new Property(
                                    property: 'participants',
                                    type: 'array',
                                    items: new Items(type: 'object'),
                                ),
                            ],
                            type: 'object',
                        ),
                    ],
                ),
            ),
            new Response(
                response: 401,
                description: 'Unauthenticated',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
                    ],
                ),
            ),
            new Response(
                response: 403,
                description: 'Unauthorized',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'You must be a teacher or admin to create a game session.'),
                    ],
                ),
            ),
            new Response(
                response: 422,
                description: 'Validation error',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'The quiz id field is required.'),
                        new Property(
                            property: 'errors',
                            properties: [
                                new Property(
                                    property: 'quiz_id',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'The quiz id field is required.'),
                                ),
                            ],
                            type: 'object',
                        ),
                    ],
                ),
            ),
            new Response(
                response: 500,
                description: 'Server error',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'error', type: 'string', example: 'Failed to create game session'),
                        new Property(property: 'message', type: 'string', example: 'Something went wrong'),
                    ],
                ),
            ),
        ],
    )]
    public function store(CreateSessionRequest $request): JsonResponse
    {
        $this->authorize('create', Session::class);

        $dto = CreateSessionDto::fromRequest($request);

        try {
            $session = $this->sessionService->createGame(
                dto: $dto,
                host: $request->user()
            );

            return response()->json(
                data: [
                    'session' => new SessionResource($session),
                ],
                status: 201
            );
        } catch (Exception $e) {
            return response()->json(
                data: [
                    'error' => 'Failed to create game session',
                    'message' => $e->getMessage(),
                ],
                status: 500
            );
        }
    }

    #[Post(
        path: '/api/v1/sessions/join',
        description: 'Join an existing game session using an 8-digit game pin. The authenticated user\'s display name is used as the participant nickname.',
        summary: 'Join a game session by game pin',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['game_pin'],
                properties: [
                    new Property(
                        property: 'game_pin',
                        description: 'The 8-digit game pin',
                        type: 'string',
                        example: '48291037',
                    ),
                ],
            ),
        ),
        tags: ['Sessions'],
        responses: [
            new Response(
                response: 200,
                description: 'Successfully joined the session',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'participant_id', type: 'string', format: 'uuid'),
                        new Property(property: 'session_id', type: 'string', format: 'uuid'),
                        new Property(property: 'game_pin', type: 'string', example: '48291037'),
                        new Property(property: 'nickname', type: 'string', example: 'Max M.'),
                        new Property(property: 'status', type: 'string', example: 'lobby'),
                    ],
                ),
            ),
            new Response(
                response: 401,
                description: 'Unauthenticated',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
                    ],
                ),
            ),
            new Response(
                response: 404,
                description: 'Game pin not found',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'error', type: 'string', example: 'Kein Spiel mit diesem Code gefunden.'),
                    ],
                ),
            ),
            new Response(
                response: 409,
                description: 'Session not in lobby state',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'error', type: 'string', example: 'Dieses Spiel hat bereits begonnen oder ist beendet.'),
                    ],
                ),
            ),
            new Response(
                response: 422,
                description: 'Validation error',
            ),
        ],
    )]
    public function join(JoinSessionRequest $request): JsonResponse
    {
        try {
            $participant = $this->sessionService->joinSession(
                gamePin: $request->validated('game_pin'),
                user: $request->user(),
            );

            return response()->json(
                data: [
                    'participant_id' => $participant->id,
                    'session_id' => $participant->session_id,
                    'game_pin' => $request->validated('game_pin'),
                    'nickname' => $participant->nickname,
                    'status' => $participant->session->status,
                ],
                status: 200
            );
        } catch (InvalidArgumentException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 404
            );
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Post(
        path: '/api/v1/sessions/{gamePin}/start',
        description: 'Starts the game session, creating session questions and opening the first question. Only the host can start the game.',
        summary: 'Start a game session',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Game started'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 409, description: 'Invalid session state'),
        ]
    )]
    public function start(string $gamePin): JsonResponse
    {
        try {
            $session = $this->sessionService->startGame(
                gamePin: $gamePin,
                host: request()->user(),
            );

            return response()->json(data: [
                'data' => new SessionResource($session),
            ]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Post(
        path: '/api/v1/sessions/{gamePin}/next',
        description: 'Closes the current question and opens the next one. If no more questions, finishes the game.',
        summary: 'Advance to the next question',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Advanced to next question or finished'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 409, description: 'Invalid session state'),
        ]
    )]
    public function next(string $gamePin): JsonResponse
    {
        try {
            $session = $this->sessionService->nextQuestion(
                gamePin: $gamePin,
                host: request()->user(),
            );

            return response()->json(data: [
                'data' => new SessionResource($session),
            ]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/current-question',
        description: 'Returns the current question with answer options (without correct answers) and timing information.',
        summary: 'Get the current question',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Current question data'),
            new Response(response: 409, description: 'No active question'),
        ]
    )]
    public function currentQuestion(string $gamePin): JsonResponse
    {
        try {
            $data = $this->sessionService->getCurrentQuestion(gamePin: $gamePin);

            return response()->json(data: ['data' => $data]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Post(
        path: '/api/v1/sessions/{gamePin}/close-question',
        description: 'Closes the current question without advancing to the next one. Only the host can close a question.',
        summary: 'Close the current question',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Question closed'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 409, description: 'Invalid session state'),
        ]
    )]
    public function closeQuestion(string $gamePin): JsonResponse
    {
        try {
            $this->sessionService->closeCurrentQuestion(
                gamePin: $gamePin,
                host: request()->user(),
            );

            return response()->json(data: [
                'data' => ['message' => 'Frage geschlossen.'],
            ]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Post(
        path: '/api/v1/sessions/{gamePin}/answer',
        description: 'Submit an answer for the current question. The answer must be submitted before the time limit expires.',
        summary: 'Submit an answer',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['answer'],
                properties: [
                    new Property(property: 'answer', type: 'array', items: new Items(type: 'string', format: 'uuid')),
                ],
            ),
        ),
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Answer submitted'),
            new Response(response: 409, description: 'Time expired or already answered'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function answer(SubmitAnswerRequest $request, string $gamePin): JsonResponse
    {
        try {
            $response = $this->sessionService->submitAnswer(
                gamePin: $gamePin,
                user: $request->user(),
                answerData: $request->validated(),
            );

            return response()->json(data: [
                'data' => [
                    'is_correct'    => $response->is_correct,
                    'score_awarded' => $response->score_awarded,
                    'time_taken_ms' => $response->time_taken_ms,
                    'answer_streak' => $response->participant->answer_streak ?? 0,
                ],
            ]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/status',
        description: 'Returns the current session status, question index, and whether a question is currently open. Used for polling.',
        summary: 'Get session status',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Session status'),
        ]
    )]
    public function status(string $gamePin): JsonResponse
    {
        $data = $this->sessionService->getSessionStatus(gamePin: $gamePin);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/question-results',
        description: 'Returns the answer distribution for the current question. Teacher-facing endpoint.',
        summary: 'Get question results',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Question results with answer distribution'),
        ]
    )]
    public function questionResults(string $gamePin): JsonResponse
    {
        try {
            $data = $this->sessionService->getQuestionResults(gamePin: $gamePin);

            return response()->json(data: ['data' => $data]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/leaderboard',
        description: 'Returns participants ranked by total score.',
        summary: 'Get the leaderboard',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Leaderboard'),
        ]
    )]
    public function leaderboard(string $gamePin): JsonResponse
    {
        $data = $this->sessionService->getLeaderboard(gamePin: $gamePin);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/review',
        description: 'Returns all questions in the session with the correct answers and the authenticated student\'s chosen answers, along with scoring details.',
        summary: 'Get student review of all questions',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Student review with all questions and answers'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 409, description: 'Not a participant'),
        ]
    )]
    public function review(string $gamePin): JsonResponse
    {
        try {
            $data = $this->sessionService->getStudentReview(
                gamePin: $gamePin,
                user: request()->user(),
            );

            return response()->json(data: ['data' => $data]);
        } catch (RuntimeException $e) {
            return response()->json(
                data: ['error' => $e->getMessage()],
                status: 409
            );
        }
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/full-review',
        description: 'Returns all questions with correct answers and every student\'s chosen answers. Teacher-facing endpoint.',
        summary: 'Get full review with all students\' answers',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Full review with all students and answers'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function fullReview(string $gamePin): JsonResponse
    {
        $data = $this->sessionService->getFullReview(gamePin: $gamePin);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/results',
        description: 'Returns the final game results including leaderboard and quiz metadata.',
        summary: 'Get final game results',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Final results'),
        ]
    )]
    public function results(string $gamePin): JsonResponse
    {
        $data = $this->sessionService->getFinalResults(gamePin: $gamePin);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/sessions/{gamePin}/report',
        description: 'Returns a participant-centric session report with per-student statistics including accuracy percentage, average response time, and detailed per-question answers.',
        summary: 'Get session report',
        security: [['sanctum' => []]],
        tags: ['Sessions'],
        parameters: [
            new Parameter(name: 'gamePin', in: 'path', required: true, schema: new Schema(type: 'string', example: '48291037')),
        ],
        responses: [
            new Response(response: 200, description: 'Session report with participant statistics'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function report(string $gamePin): JsonResponse
    {
        $data = $this->sessionService->getSessionReport(gamePin: $gamePin);

        return response()->json(data: ['data' => $data]);
    }
}
