<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\AuthCallbackDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AuthCallbackRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Services\Contracts\AuthServiceContract;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthServiceContract $authService
    ) {}

    #[Get(
        path: '/api/auth/redirect',
        description: 'Returns the Azure AD OAuth2 authorization URL that the client should redirect to for authentication.',
        summary: 'Get Azure OAuth2 redirect URL',
        tags: ['Auth'],
        responses: [
            new Response(
                response: 200,
                description: 'Redirect URL retrieved successfully',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'url',
                            type: 'string',
                            example: 'https://login.microsoftonline.com/...',
                        ),
                    ],
                ),
            ),
        ],
    )]
    public function redirect(): JsonResponse
    {
        return response()->json(
            data: [
                'url' => $this->authService->getRedirectUrl()
            ]
        );
    }

    #[Get(
        path: '/api/auth/callback',
        description: 'Handles the OAuth2 callback from Azure AD via GET. Exchanges the authorization code for a user and returns a Sanctum token.',
        summary: 'Handle OAuth2 callback (GET)',
        tags: ['Auth'],
        parameters: [
            new Parameter(
                name: 'code',
                description: 'The authorization code received from Azure AD',
                in: 'query',
                required: true,
                schema: new Schema(type: 'string'),
            ),
        ],
        responses: [
            new Response(
                response: 200,
                description: 'Authentication successful',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'user',
                            properties: [
                                new Property(property: 'id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new Property(property: 'username', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'display_name', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'class_name', type: 'string', example: '3AHITN', nullable: true),
                                new Property(property: 'auth_provider', type: 'string', example: 'azure'),
                                new Property(property: 'is_active', type: 'boolean', example: true),
                                new Property(property: 'totp_enabled', type: 'boolean', example: false),
                                new Property(property: 'last_login_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z', nullable: true),
                                new Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'deleted_at', type: 'string', format: 'date-time', example: null, nullable: true),
                                new Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'student'),
                                ),
                            ],
                            type: 'object',
                        ),
                        new Property(property: 'token', type: 'string', example: '1|abc123tokenvalue'),
                    ],
                ),
            ),
            new Response(
                response: 401,
                description: 'Authentication failed',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'error', type: 'string', example: 'Authentication failed'),
                        new Property(property: 'message', type: 'string', example: 'Invalid authorization code'),
                    ],
                ),
            ),
            new Response(
                response: 422,
                description: 'Validation error',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'The code field is required.'),
                        new Property(
                            property: 'errors',
                            properties: [
                                new Property(
                                    property: 'code',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'The code field is required.'),
                                ),
                            ],
                            type: 'object',
                        ),
                    ],
                ),
            ),
        ],
    )]
    #[Post(
        path: '/api/auth/callback',
        description: 'Handles the OAuth2 callback from Azure AD via POST. Exchanges the authorization code for a user and returns a Sanctum token.',
        summary: 'Handle OAuth2 callback (POST)',
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['code'],
                properties: [
                    new Property(
                        property: 'code',
                        description: 'The authorization code received from Azure AD',
                        type: 'string',
                    ),
                ],
            ),
        ),
        tags: ['Auth'],
        responses: [
            new Response(
                response: 200,
                description: 'Authentication successful',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'user',
                            properties: [
                                new Property(property: 'id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new Property(property: 'username', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'display_name', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'class_name', type: 'string', example: '3AHITN', nullable: true),
                                new Property(property: 'auth_provider', type: 'string', example: 'azure'),
                                new Property(property: 'is_active', type: 'boolean', example: true),
                                new Property(property: 'totp_enabled', type: 'boolean', example: false),
                                new Property(property: 'last_login_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z', nullable: true),
                                new Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'deleted_at', type: 'string', format: 'date-time', example: null, nullable: true),
                                new Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'student'),
                                ),
                            ],
                            type: 'object',
                        ),
                        new Property(property: 'token', type: 'string', example: '1|abc123tokenvalue'),
                    ],
                ),
            ),
            new Response(
                response: 401,
                description: 'Authentication failed',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'error', type: 'string', example: 'Authentication failed'),
                        new Property(property: 'message', type: 'string', example: 'Invalid authorization code'),
                    ],
                ),
            ),
            new Response(
                response: 422,
                description: 'Validation error',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'The code field is required.'),
                        new Property(
                            property: 'errors',
                            properties: [
                                new Property(
                                    property: 'code',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'The code field is required.'),
                                ),
                            ],
                            type: 'object',
                        ),
                    ],
                ),
            ),
        ],
    )]
    public function callback(AuthCallbackRequest $request): JsonResponse
    {
        $dto = AuthCallbackDto::fromRequest($request);

        try {
            $socialiteUser = $this->authService->handleCallback(
                code: $dto->code
            );

            $user = $this->authService->findOrCreateUser(
                socialiteUser: $socialiteUser
            );

            $token = $this->authService->createToken(
                user: $user
            );

            $user->load(relations: 'roles');

            return response()->json(
                data: [
                    'user' => new UserResource($user),
                    'token' => $token,
                ]
            );
        } catch (Exception $e) {
            return response()->json(
                data: [
                    'error' => 'Authentication failed',
                    'message' => $e->getMessage(),
                ],
                status: 401
            );
        }
    }

    #[Get(
        path: '/api/auth/user',
        description: 'Returns the currently authenticated user with their roles.',
        summary: 'Get authenticated user',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new Response(
                response: 200,
                description: 'Authenticated user retrieved successfully',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'user',
                            properties: [
                                new Property(property: 'id', type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new Property(property: 'username', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'display_name', type: 'string', example: 'John Doe', nullable: true),
                                new Property(property: 'class_name', type: 'string', example: '3AHITN', nullable: true),
                                new Property(property: 'auth_provider', type: 'string', example: 'azure'),
                                new Property(property: 'is_active', type: 'boolean', example: true),
                                new Property(property: 'totp_enabled', type: 'boolean', example: false),
                                new Property(property: 'last_login_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z', nullable: true),
                                new Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(property: 'deleted_at', type: 'string', format: 'date-time', example: null, nullable: true),
                                new Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new Items(type: 'string', example: 'student'),
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
        ],
    )]
    public function user(Request $request): JsonResponse
    {
        $request->user()->load(relations: 'roles');

        return response()->json(
            data: [
                'user' => new UserResource($request->user()),
            ]
        );
    }

    #[Post(
        path: '/api/auth/logout',
        description: 'Revokes the current user\'s authentication token.',
        summary: 'Logout user',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new Response(
                response: 200,
                description: 'Logged out successfully',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'message', type: 'string', example: 'Logged out successfully'),
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
        ],
    )]
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(
            user: $request->user()
        );

        return response()->json(
            data: ['message' => 'Logged out successfully']
        );
    }
}
