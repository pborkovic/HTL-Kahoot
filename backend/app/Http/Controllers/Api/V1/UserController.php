<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\BulkCreateUsersRequest;
use App\Http\Requests\Api\V1\ChangePasswordRequest;
use App\Http\Requests\Api\V1\CreateUserRequest;
use App\Http\Requests\Api\V1\ListUsersRequest;
use App\Http\Requests\Api\V1\UpdatePreferencesRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Services\Contracts\UserServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use OpenApi\Attributes\Delete;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Patch;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\Put;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;
use RuntimeException;

class UserController extends Controller
{
    public function __construct(
        private readonly UserServiceContract $userService
    ) {}

    #[Get(
        path: '/api/v1/users',
        description: 'Returns a paginated, filterable list of users. Accessible by teachers, admins and superadmins.',
        summary: 'List users',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'role', description: 'Filter by role name (student, teacher, admin, superadmin)', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'class', description: 'Filter by exact class_name', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'class_prefix', description: 'Filter classes starting with this prefix (e.g. "3" matches 3a, 3b)', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'search', description: 'Case-insensitive search in email, username, display_name', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'is_active', in: 'query', required: false, schema: new Schema(type: 'boolean')),
            new Parameter(name: 'auth_provider', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['local', 'entra_id'])),
            new Parameter(name: 'created_after', in: 'query', required: false, schema: new Schema(type: 'string', format: 'date')),
            new Parameter(name: 'created_before', in: 'query', required: false, schema: new Schema(type: 'string', format: 'date')),
            new Parameter(name: 'sort', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['email', 'created_at', 'display_name', 'class_name', 'last_login_at'])),
            new Parameter(name: 'direction', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['asc', 'desc'])),
            new Parameter(name: 'per_page', description: 'Items per page (default: 25)', in: 'query', required: false, schema: new Schema(type: 'integer', maximum: 100, minimum: 1)),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
            new Parameter(name: 'with_trashed', description: 'Include soft-deleted users (admin/superadmin only)', in: 'query', required: false, schema: new Schema(type: 'boolean')),
        ],
        responses: [
            new Response(response: 200, description: 'Paginated user list', content: new JsonContent(ref: '#/components/schemas/UserList')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(ListUsersRequest $request): ResourceCollection
    {
        $this->authorize(ability: 'viewAny', arguments: User::class);

        $perPage = min((int) $request->input('per_page', 25), 100);

        return $this->userService->listUsers(
            filters: $request->validated(),
            perPage: $perPage,
            withTrashed: $request->boolean('with_trashed'),
        );
    }

    #[Get(
        path: '/api/v1/users/classes',
        description: 'Returns distinct class names with the number of students in each. Accessible by teachers, admins and superadmins.',
        summary: 'List classes with student counts',
        security: [['sanctum' => []]],
        tags: ['Users'],
        responses: [
            new Response(
                response: 200,
                description: 'Class list',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'data',
                            type: 'array',
                            items: new Items(ref: '#/components/schemas/ClassEntry')
                        ),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function classes(): JsonResponse
    {
        $this->authorize(ability: 'viewClasses', arguments: User::class);

        $data = $this->userService->getClasses();

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/users/stats',
        description: 'Returns aggregated user counts. Admin and superadmin only.',
        summary: 'User statistics',
        security: [['sanctum' => []]],
        tags: ['Users'],
        responses: [
            new Response(
                response: 200,
                description: 'Statistics',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', ref: '#/components/schemas/UserStats'),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function stats(): JsonResponse
    {
        $this->authorize(ability: 'viewStats', arguments: User::class);

        $data = $this->userService->getStats();

        return response()->json(data: ['data' => $data]);
    }

    #[Post(
        path: '/api/v1/users/bulk',
        description: 'Imports multiple users at once. Skips existing emails and collects per-row errors. Admin and superadmin only.',
        summary: 'Bulk import users',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['users'],
                properties: [
                    new Property(
                        property: 'users',
                        type: 'array',
                        items: new Items(
                            required: ['email', 'role'],
                            properties: [
                                new Property(property: 'email', type: 'string', format: 'email'),
                                new Property(property: 'display_name', type: 'string', nullable: true),
                                new Property(property: 'class_name', type: 'string', nullable: true),
                                new Property(property: 'auth_provider', type: 'string', enum: ['local', 'entra_id'], nullable: true),
                                new Property(property: 'role', type: 'string'),
                            ],
                            type: 'object'
                        ),
                        minItems: 1
                    ),
                    new Property(property: 'default_auth_provider', type: 'string', enum: ['local', 'entra_id'], example: 'local'),
                ]
            )
        ),
        tags: ['Users'],
        responses: [
            new Response(response: 200, description: 'Import summary', content: new JsonContent(ref: '#/components/schemas/BulkResult')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function bulk(BulkCreateUsersRequest $request): JsonResponse
    {
        $this->authorize(ability: 'bulkCreate', arguments: User::class);

        $result = $this->userService->bulkImport(
            users: $request->validated()['users'],
            defaultProvider: $request->input('default_auth_provider', 'local'),
            assignedBy: $request->user()->id,
        );

        return response()->json(data: $result);
    }

    #[Post(
        path: '/api/v1/users',
        description: 'Creates a new user and assigns a role. Admin and superadmin only.',
        summary: 'Create a user',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['email', 'auth_provider', 'role'],
                properties: [
                    new Property(property: 'email', type: 'string', format: 'email'),
                    new Property(property: 'username', type: 'string', maxLength: 100, nullable: true),
                    new Property(property: 'display_name', type: 'string', maxLength: 255, nullable: true),
                    new Property(property: 'password', description: 'Required when auth_provider is local. Must contain uppercase, lowercase and a number.', type: 'string', minLength: 8),
                    new Property(property: 'auth_provider', type: 'string', enum: ['local', 'entra_id']),
                    new Property(property: 'class_name', type: 'string', maxLength: 20, nullable: true),
                    new Property(property: 'role', description: 'Must exist in roles table', type: 'string'),
                    new Property(property: 'is_active', type: 'boolean', example: true),
                ]
            )
        ),
        tags: ['Users'],
        responses: [
            new Response(response: 201, description: 'User created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateUserRequest $request): JsonResponse
    {
        $this->authorize(ability: 'create', arguments: User::class);

        $user = $this->userService->createUser(
            data: $request->validated(),
            assignedBy: $request->user()->id,
        );

        return (new UserResource($user))->response()
            ->setStatusCode(201);
    }

    #[Get(
        path: '/api/v1/users/{id}',
        description: 'Returns full user details. Admins and superadmins can view any user; other users can only view their own profile.',
        summary: 'Get a user',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'User detail', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(User $user): UserResource
    {
        $this->authorize(ability: 'view', arguments: $user);

        return new UserResource($this->userService->getUser(userId: $user->id));
    }

    #[Put(
        path: '/api/v1/users/{id}',
        description: 'Updates user fields. Admins/superadmins can update all fields including role. Users can only update their own display_name and username. Setting is_active to false invalidates all active sessions.',
        summary: 'Update a user',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'email', type: 'string', format: 'email'),
                    new Property(property: 'username', type: 'string', maxLength: 100, nullable: true),
                    new Property(property: 'display_name', type: 'string', maxLength: 255, nullable: true),
                    new Property(property: 'class_name', type: 'string', maxLength: 20, nullable: true),
                    new Property(property: 'is_active', type: 'boolean'),
                    new Property(property: 'auth_provider', type: 'string', enum: ['local', 'entra_id']),
                    new Property(property: 'role', description: 'Admin only — replaces all current roles with this one', type: 'string'),
                ]
            )
        ),
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Updated user', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $this->authorize(ability: 'update', arguments: $user);

        $updatedUser = $this->userService->updateUser(
            user: $user,
            data: $request->validated(),
            authUser: $request->user(),
        );

        return new UserResource($updatedUser);
    }

    #[Delete(
        path: '/api/v1/users/{id}',
        description: 'Soft-deletes a user. Superadmin only. Cannot delete yourself or the last superadmin.',
        summary: 'Soft-delete a user',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'User soft-deleted', content: new JsonContent(ref: UserResource::class)),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Cannot delete yourself or last superadmin'),
        ]
    )]
    public function destroy(Request $request, User $user): UserResource|JsonResponse
    {
        $this->authorize(ability: 'delete', arguments: $user);

        try {
            $this->userService->deleteUser(
                user: $user,
                authUser: $request->user()
            );
        } catch (RuntimeException $e) {
            return response()->json(data: ['message' => $e->getMessage()], status: 422);
        }

        return new UserResource($user->fresh());
    }

    #[Post(
        path: '/api/v1/users/{id}/restore',
        description: 'Restores a previously soft-deleted user. Superadmin only.',
        summary: 'Restore a soft-deleted user',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Restored user', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function restore(User $user): UserResource
    {
        $this->authorize(ability: 'restore', arguments: $user);

        $restoredUser = $this->userService->restoreUser(user: $user);

        return new UserResource($restoredUser);
    }

    #[Patch(
        path: '/api/v1/users/{id}/password',
        description: 'Changes the password for a local-auth user. Users changing their own password must supply current_password. Admins/superadmins resetting another user\'s password do not need current_password. Invalidates all active Sanctum tokens after a successful change.',
        summary: 'Change password',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['new_password'],
                properties: [
                    new Property(property: 'current_password', description: 'Required when changing own password', type: 'string'),
                    new Property(property: 'new_password', description: 'Must contain uppercase, lowercase and a number', type: 'string', minLength: 8),
                ]
            )
        ),
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Password changed', content: new JsonContent(properties: [new Property(property: 'message', type: 'string')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Wrong current password or non-local provider'),
        ]
    )]
    public function changePassword(ChangePasswordRequest $request, User $user): JsonResponse
    {
        $this->authorize(ability: 'changePassword', arguments: $user);

        try {
            $this->userService->changePassword(
                user: $user,
                data: $request->validated(),
                isSelf: $request->user()->id === $user->id,
            );
        } catch (RuntimeException $e) {
            $key = str_contains(haystack: $e->getMessage(), needle: 'Current password')
                ? 'current_password'
                : 'message';

            return response()->json(data: [$key === 'current_password' ? 'errors' : 'message' =>
                $key === 'current_password' ? ['current_password' => [$e->getMessage()]] : $e->getMessage()
            ], status: 422);
        }

        return response()->json(data: ['message' => 'Password updated successfully.']);
    }

    #[Get(
        path: '/api/v1/users/{id}/completed-quizzes',
        description: 'Returns the number of quizzes the user has completed.',
        summary: 'Get completed quizzes count',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Completed quizzes count'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function completedQuizzes(User $user): JsonResponse
    {
        $this->authorize(ability: 'view', arguments: $user);

        $data = $this->userService->getCompletedQuizzesCount(userId: $user->id);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/users/{id}/answer-distribution',
        description: 'Returns the correct/wrong/unanswered answer distribution and correct percentage across all completed quizzes.',
        summary: 'Get answer distribution',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Answer distribution'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function answerDistribution(User $user): JsonResponse
    {
        $this->authorize(ability: 'view', arguments: $user);

        $data = $this->userService->getAnswerDistribution(userId: $user->id);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/users/{id}/quiz-history',
        description: 'Returns the list of completed quizzes with per-quiz breakdown of questions, correct/wrong answers, score, and completion time.',
        summary: 'Get quiz history',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Quiz history'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function quizHistory(User $user): JsonResponse
    {
        $this->authorize(ability: 'view', arguments: $user);

        $data = $this->userService->getQuizHistory(userId: $user->id);

        return response()->json(data: ['data' => $data]);
    }

    #[Get(
        path: '/api/v1/users/me/preferences',
        description: 'Returns the authenticated user\'s personal preferences (theme, language, font size).',
        summary: 'Get own preferences',
        security: [['sanctum' => []]],
        tags: ['Users'],
        responses: [
            new Response(response: 200, description: 'User preferences'),
            new Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function preferences(Request $request): JsonResponse
    {
        return response()->json(data: [
            'data' => $request->user()->preferences ?? (object) [],
        ]);
    }

    #[Put(
        path: '/api/v1/users/me/preferences',
        description: 'Updates the authenticated user\'s personal preferences. Only provided fields are updated, others are preserved.',
        summary: 'Update own preferences',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'theme', type: 'string', enum: ['light', 'dark', 'high-contrast', 'dark-high-contrast', 'colorblind-friendly', 'dark-colorblind-friendly']),
                    new Property(property: 'language', type: 'string', enum: ['de', 'en']),
                    new Property(property: 'font_size', type: 'string', enum: ['small', 'medium', 'large']),
                ]
            )
        ),
        tags: ['Users'],
        responses: [
            new Response(response: 200, description: 'Updated preferences'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $current = $user->preferences ?? [];
        $user->update(attributes: [
            'preferences' => array_merge($current, $request->validated()),
        ]);

        return response()->json(data: [
            'data' => $user->fresh()->preferences,
        ]);
    }
}
