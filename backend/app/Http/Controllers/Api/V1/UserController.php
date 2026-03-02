<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\UserFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\BulkCreateUsersRequest;
use App\Http\Requests\Api\V1\ChangePasswordRequest;
use App\Http\Requests\Api\V1\CreateUserRequest;
use App\Http\Requests\Api\V1\ListUsersRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserCollection;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
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

class UserController extends Controller
{
    #[Get(
        path: '/api/v1/users',
        summary: 'List users',
        description: 'Returns a paginated, filterable list of users. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'role', in: 'query', required: false, schema: new Schema(type: 'string'), description: 'Filter by role name (student, teacher, admin, superadmin)'),
            new Parameter(name: 'class', in: 'query', required: false, schema: new Schema(type: 'string'), description: 'Filter by exact class_name'),
            new Parameter(name: 'class_prefix', in: 'query', required: false, schema: new Schema(type: 'string'), description: 'Filter classes starting with this prefix (e.g. "3" matches 3a, 3b)'),
            new Parameter(name: 'search', in: 'query', required: false, schema: new Schema(type: 'string'), description: 'Case-insensitive search in email, username, display_name'),
            new Parameter(name: 'is_active', in: 'query', required: false, schema: new Schema(type: 'boolean')),
            new Parameter(name: 'auth_provider', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['local', 'entra_id'])),
            new Parameter(name: 'created_after', in: 'query', required: false, schema: new Schema(type: 'string', format: 'date')),
            new Parameter(name: 'created_before', in: 'query', required: false, schema: new Schema(type: 'string', format: 'date')),
            new Parameter(name: 'sort', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['email', 'created_at', 'display_name', 'class_name', 'last_login_at'])),
            new Parameter(name: 'direction', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['asc', 'desc'])),
            new Parameter(name: 'per_page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1, maximum: 100), description: 'Items per page (default: 25)'),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
            new Parameter(name: 'with_trashed', in: 'query', required: false, schema: new Schema(type: 'boolean'), description: 'Include soft-deleted users (admin/superadmin only)'),
        ],
        responses: [
            new Response(response: 200, description: 'Paginated user list', content: new JsonContent(ref: '#/components/schemas/UserList')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(ListUsersRequest $request): UserCollection
    {
        $query = User::query()->with('roles');

        if ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        (new UserFilter())->apply($query, $request->validated());

        $perPage = min((int) $request->input('per_page', 25), 100);

        return new UserCollection($query->paginate($perPage));
    }

    #[Get(
        path: '/api/v1/users/classes',
        summary: 'List classes with student counts',
        description: 'Returns distinct class names with the number of students in each. Accessible by teachers, admins and superadmins.',
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
        $classes = User::query()
            ->whereHas('roles', fn($q) => $q->where('name', 'student'))
            ->whereNotNull('class_name')
            ->selectRaw('class_name, COUNT(*) as student_count')
            ->groupBy('class_name')
            ->orderBy('class_name')
            ->get();

        return response()->json(['data' => $classes]);
    }

    #[Get(
        path: '/api/v1/users/stats',
        summary: 'User statistics',
        description: 'Returns aggregated user counts. Admin and superadmin only.',
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
        $byRole = Role::withCount('users')->get()->pluck('users_count', 'name');

        $byAuthProvider = User::selectRaw('auth_provider, COUNT(*) as count')
            ->groupBy('auth_provider')
            ->pluck('count', 'auth_provider');

        return response()->json(['data' => [
            'total_users'        => User::count(),
            'active_users'       => User::where('is_active', true)->count(),
            'by_role'            => $byRole,
            'by_auth_provider'   => $byAuthProvider,
            'recent_signups_30d' => User::where('created_at', '>=', now()->subDays(30))->count(),
        ]]);
    }

    #[Post(
        path: '/api/v1/users/bulk',
        summary: 'Bulk import users',
        description: 'Imports multiple users at once. Skips existing emails and collects per-row errors. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['users'],
                properties: [
                    new Property(
                        property: 'users',
                        type: 'array',
                        minItems: 1,
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
                        )
                    ),
                    new Property(property: 'default_auth_provider', type: 'string', enum: ['local', 'entra_id'], example: 'local'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Import summary', content: new JsonContent(ref: '#/components/schemas/BulkResult')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function bulk(BulkCreateUsersRequest $request): JsonResponse
    {
        $created         = 0;
        $skipped         = 0;
        $errors          = [];
        $users           = $request->validated()['users'];
        $defaultProvider = $request->input('default_auth_provider', 'local');

        DB::transaction(function () use ($users, $defaultProvider, $request, &$created, &$skipped, &$errors) {
            foreach ($users as $index => $row) {
                $validator = Validator::make($row, [
                    'email'        => 'required|email',
                    'display_name' => 'nullable|string|max:255',
                    'class_name'   => 'nullable|string|max:20',
                    'role'         => 'required|string|exists:roles,name',
                ]);

                if ($validator->fails()) {
                    $errors[] = [
                        'row'    => $index + 1,
                        'email'  => $row['email'] ?? null,
                        'errors' => $validator->errors()->all(),
                    ];
                    continue;
                }

                if (User::where('email', $row['email'])->exists()) {
                    $skipped++;
                    continue;
                }

                $role = Role::where('name', $row['role'])->first();
                $user = User::create([
                    'email'         => $row['email'],
                    'display_name'  => $row['display_name'] ?? null,
                    'class_name'    => $row['class_name'] ?? null,
                    'auth_provider' => $row['auth_provider'] ?? $defaultProvider,
                    'is_active'     => true,
                ]);

                $user->roles()->attach($role->id, [
                    'assigned_at' => now(),
                    'assigned_by' => $request->user()?->id,
                ]);

                $created++;
            }
        });

        return response()->json(['created' => $created, 'skipped' => $skipped, 'errors' => $errors]);
    }

    #[Post(
        path: '/api/v1/users',
        summary: 'Create a user',
        description: 'Creates a new user and assigns a role. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['email', 'auth_provider', 'role'],
                properties: [
                    new Property(property: 'email', type: 'string', format: 'email'),
                    new Property(property: 'username', type: 'string', maxLength: 100, nullable: true),
                    new Property(property: 'display_name', type: 'string', maxLength: 255, nullable: true),
                    new Property(property: 'password', type: 'string', minLength: 8, description: 'Required when auth_provider is local. Must contain uppercase, lowercase and a number.'),
                    new Property(property: 'auth_provider', type: 'string', enum: ['local', 'entra_id']),
                    new Property(property: 'class_name', type: 'string', maxLength: 20, nullable: true),
                    new Property(property: 'role', type: 'string', description: 'Must exist in roles table'),
                    new Property(property: 'is_active', type: 'boolean', example: true),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'User created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = Role::where('name', $data['role'])->firstOrFail();

        $user = User::create([
            'email'         => $data['email'],
            'username'      => $data['username'] ?? null,
            'display_name'  => $data['display_name'] ?? null,
            'password_hash' => isset($data['password']) ? password_hash($data['password'], PASSWORD_ARGON2ID) : null,
            'auth_provider' => $data['auth_provider'],
            'class_name'    => $data['class_name'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
        ]);

        $user->roles()->attach($role->id, [
            'assigned_at' => now(),
            'assigned_by' => $request->user()?->id,
        ]);

        $user->load('roles');

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    #[Get(
        path: '/api/v1/users/{id}',
        summary: 'Get a user',
        description: 'Returns full user details. Admins and superadmins can view any user; other users can only view their own profile.',
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
        $user->load('roles');

        return new UserResource($user);
    }

    #[Put(
        path: '/api/v1/users/{id}',
        summary: 'Update a user',
        description: 'Updates user fields. Admins/superadmins can update all fields including role. Users can only update their own display_name and username. Setting is_active to false invalidates all active sessions.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
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
                    new Property(property: 'role', type: 'string', description: 'Admin only — replaces all current roles with this one'),
                ]
            )
        ),
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
        $authUser = $request->user();
        $isAdmin  = $authUser?->hasAnyRole(['admin', 'superadmin']) ?? true;
        $data     = $request->validated();

        $updateData = [];

        if ($isAdmin) {
            foreach (['email', 'username', 'display_name', 'class_name', 'is_active', 'auth_provider'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (isset($data['role'])) {
                $role = Role::where('name', $data['role'])->firstOrFail();
                $user->roles()->sync([$role->id => ['assigned_at' => now(), 'assigned_by' => $authUser?->id]]);
            }

            if (isset($data['is_active']) && !$data['is_active']) {
                $user->tokens()->delete();
            }
        } else {
            foreach (['display_name', 'username'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        $user->load('roles');

        return new UserResource($user->fresh());
    }

    #[Delete(
        path: '/api/v1/users/{id}',
        summary: 'Soft-delete a user',
        description: 'Soft-deletes a user. Superadmin only. Cannot delete yourself or the last superadmin.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 204, description: 'Deleted (no content)'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Cannot delete yourself or last superadmin'),
        ]
    )]
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user() && $user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself.'], 422);
        }

        if ($user->hasRole('superadmin')) {
            $count = User::whereHas('roles', fn($q) => $q->where('name', 'superadmin'))->count();
            if ($count <= 1) {
                return response()->json(['message' => 'Cannot delete the last superadmin.'], 422);
            }
        }

        $user->delete();

        return response()->json(null, 204);
    }

    #[Post(
        path: '/api/v1/users/{id}/restore',
        summary: 'Restore a soft-deleted user',
        description: 'Restores a previously soft-deleted user. Superadmin only.',
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
        $user->restore();
        $user->load('roles');

        return new UserResource($user);
    }

    #[Patch(
        path: '/api/v1/users/{id}/password',
        summary: 'Change password',
        description: 'Changes the password for a local-auth user. Users changing their own password must supply current_password. Admins/superadmins resetting another user\'s password do not need current_password. Invalidates all active Sanctum tokens after a successful change.',
        security: [['sanctum' => []]],
        tags: ['Users'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['new_password'],
                properties: [
                    new Property(property: 'current_password', type: 'string', description: 'Required when changing own password'),
                    new Property(property: 'new_password', type: 'string', minLength: 8, description: 'Must contain uppercase, lowercase and a number'),
                ]
            )
        ),
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
        if ($user->auth_provider !== 'local') {
            return response()->json(['message' => 'Password change not available for this auth provider.'], 422);
        }

        $data   = $request->validated();
        $isSelf = $request->user()?->id === $user->id;

        if ($isSelf && !password_verify($data['current_password'], $user->password_hash)) {
            return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
        }

        $user->update(['password_hash' => password_hash($data['new_password'], PASSWORD_ARGON2ID)]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
