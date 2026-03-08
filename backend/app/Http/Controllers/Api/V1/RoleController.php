<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AssignRoleRequest;
use App\Http\Requests\Api\V1\CreateRoleRequest;
use App\Http\Requests\Api\V1\RolePermissionRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\Contracts\RoleServiceContract;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes\Delete;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleServiceContract $roleService,
    ) {}

    #[Get(
        path: '/api/v1/roles',
        summary: 'List all roles',
        description: 'Returns all roles with their assigned permissions. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        responses: [
            new Response(
                response: 200,
                description: 'Role list',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/Role')),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::with('permissions')->get();

        return response()->json([
            'data' => RoleResource::collection($roles),
        ]);
    }

    #[Post(
        path: '/api/v1/roles',
        summary: 'Create a role',
        description: 'Creates a new role. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['name'],
                properties: [
                    new Property(property: 'name', type: 'string', maxLength: 50, description: 'Unique role name'),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'Role created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Role')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = $this->roleService->create($request->validated());
        $role->load('permissions');

        return (new RoleResource($role))->response()->setStatusCode(201);
    }

    #[Delete(
        path: '/api/v1/roles/{id}',
        summary: 'Delete a role',
        description: 'Deletes a role and detaches all associated users and permissions. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 204, description: 'Deleted (no content)'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        $role->permissions()->detach();
        $role->users()->detach();
        $this->roleService->delete($role->id);

        return response()->json(null, 204);
    }

    #[Post(
        path: '/api/v1/users/{id}/roles',
        summary: 'Assign a role to a user',
        description: 'Assigns an existing role to a user. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid'), description: 'User ID'),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['role_id'],
                properties: [
                    new Property(property: 'role_id', type: 'string', format: 'uuid', description: 'The role ID to assign'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Role assigned', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'User already has this role'),
        ]
    )]
    public function assignRole(AssignRoleRequest $request, User $user): JsonResponse
    {
        $this->authorize('assignRole', Role::class);

        $data = $request->validated();

        if ($user->roles()->where('roles.id', $data['role_id'])->exists()) {
            return response()->json(['message' => 'User already has this role.'], 422);
        }

        $user->roles()->attach($data['role_id'], [
            'assigned_at' => now(),
            'assigned_by' => $request->user()->id,
        ]);

        $user->load('roles');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    #[Delete(
        path: '/api/v1/users/{id}/roles',
        summary: 'Remove a role from a user',
        description: 'Removes a role from a user. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid'), description: 'User ID'),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['role_id'],
                properties: [
                    new Property(property: 'role_id', type: 'string', format: 'uuid', description: 'The role ID to remove'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Role removed', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/User')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function removeRole(AssignRoleRequest $request, User $user): JsonResponse
    {
        $this->authorize('removeRole', Role::class);

        $data = $request->validated();

        $user->roles()->detach($data['role_id']);
        $user->load('roles');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    #[Post(
        path: '/api/v1/roles/{id}/permissions',
        summary: 'Add a permission to a role',
        description: 'Attaches a permission to a role. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid'), description: 'Role ID'),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['permission_id'],
                properties: [
                    new Property(property: 'permission_id', type: 'string', format: 'uuid', description: 'The permission ID to add'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Permission added', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Role')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Role already has this permission'),
        ]
    )]
    public function addPermission(RolePermissionRequest $request, Role $role): JsonResponse
    {
        $this->authorize('managePermissions', Role::class);

        $data = $request->validated();

        if ($role->permissions()->where('permissions.id', $data['permission_id'])->exists()) {
            return response()->json(['message' => 'Role already has this permission.'], 422);
        }

        $role->permissions()->attach($data['permission_id']);
        $role->load('permissions');

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }

    #[Delete(
        path: '/api/v1/roles/{id}/permissions',
        summary: 'Remove a permission from a role',
        description: 'Detaches a permission from a role. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid'), description: 'Role ID'),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['permission_id'],
                properties: [
                    new Property(property: 'permission_id', type: 'string', format: 'uuid', description: 'The permission ID to remove'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Permission removed', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Role')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function removePermission(RolePermissionRequest $request, Role $role): JsonResponse
    {
        $this->authorize('managePermissions', Role::class);

        $data = $request->validated();

        $role->permissions()->detach($data['permission_id']);
        $role->load('permissions');

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }
}
