<?php

namespace App\Http\Controllers;

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
        description: 'Handles the OAuth2 callback from Azure AD. Exchanges the authorization code for a user and returns a Sanctum token.',
        summary: 'Handle OAuth2 callback',
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
                                new Property(property: 'id', type: 'integer', example: 1),
                                new Property(property: 'entra_id', type: 'string', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new Property(property: 'display_name', type: 'string', example: 'John Doe'),
                                new Property(property: 'first_name', type: 'string', example: 'John'),
                                new Property(property: 'last_name', type: 'string', example: 'Doe'),
                                new Property(property: 'avatar_url', type: 'string', example: null, nullable: true),
                                new Property(property: 'last_login_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new Items(
                                        properties: [
                                            new Property(property: 'id', type: 'integer', example: 1),
                                            new Property(property: 'name', type: 'string', example: 'student'),
                                        ],
                                        type: 'object',
                                    ),
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
                        new Property(property: 'user', type: 'object'),
                        new Property(property: 'token', type: 'string', example: '1|abc123tokenvalue'),
                    ],
                ),
            ),
            new Response(response: 401, description: 'Authentication failed'),
            new Response(response: 422, description: 'Validation error'),
        ],
    )]
    public function callback(Request $request): JsonResponse
    {
        $request->validate(
            rules: [
                'code' => 'required|string'
            ]
        );

        try {
            $socialiteUser = $this->authService->handleCallback(
                code: $request->code
            );

            $user = $this->authService->findOrCreateUser(
                socialiteUser: $socialiteUser
            );

            $token = $this->authService->createToken(
                user: $user
            );

            return response()->json(
                data: [
                    'user' => $user->load(relations: 'roles'),
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
                                new Property(property: 'id', type: 'integer', example: 1),
                                new Property(property: 'entra_id', type: 'string', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'),
                                new Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new Property(property: 'display_name', type: 'string', example: 'John Doe'),
                                new Property(property: 'first_name', type: 'string', example: 'John'),
                                new Property(property: 'last_name', type: 'string', example: 'Doe'),
                                new Property(property: 'avatar_url', type: 'string', example: null, nullable: true),
                                new Property(property: 'last_login_at', type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000000Z'),
                                new Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new Items(
                                        properties: [
                                            new Property(property: 'id', type: 'integer', example: 1),
                                            new Property(property: 'name', type: 'string', example: 'student'),
                                        ],
                                        type: 'object',
                                    ),
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
        return response()->json(
            data: [
                'user' => $request->user()->load(relations: 'roles')
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
