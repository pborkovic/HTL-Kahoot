<?php

namespace App\Http\Controllers;

use App\Services\Contracts\SessionServiceContract;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\Response;

class SessionController extends Controller
{
    public function __construct(
        private readonly SessionServiceContract $sessionService
    ) {}

    #[Post(
        path: '/api/sessions',
        description: 'Creates a new game session for a quiz. Generates a unique 8-digit game pin and a QR code for players to join. The authenticated user becomes the host.',
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
                                new Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'quiz', type: 'object'),
                                new Property(property: 'host', type: 'object'),
                            ],
                            type: 'object',
                        ),
                        new Property(property: 'game_pin', type: 'string', example: '48291037'),
                        new Property(property: 'qr_code', type: 'string', example: 'data:image/svg+xml;base64,...'),
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
    public function store(Request $request): JsonResponse
    {
        $request->validate(
            rules: [
                'quiz_id' => 'required|uuid|exists:quizzes,id',
            ]
        );

        try {
            $session = $this->sessionService->createGame(
                quizId: $request->quiz_id,
                host: $request->user() ?? \App\Models\User::first()
            );

            return response()->json(
                data: [
                    'session' => $session,
                    'game_pin' => $session->game_pin,
                    'qr_code' => $session->qr_code_url,
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
}
