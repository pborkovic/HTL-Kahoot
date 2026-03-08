<?php

declare(strict_types=1);

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
        $this->authorize(ability: 'viewAny', arguments: Role::class);

        $roles = $this->roleService->getAllWithPermissions();

        return response()->json(data: [
            'data' => RoleResource::collection(resource: $roles),
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
        $this->authorize(ability: 'create', arguments: Role::class);

        $role = $this->roleService->create(data: $request->validated());
        $role->load(relations: 'permissions');

        return (new RoleResource(resource: $role))->response()->setStatusCode(code: 201);
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
        $this->authorize(ability: 'delete', arguments: $role);

        $this->roleService->deleteWithRelations(role: $role);

        return response()->json(data: null, status: 204);
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
        $this->authorize(ability: 'assignRole', arguments: Role::class);

        $data     = $request->validated();
        $assigned = $this->roleService->assignRoleToUser(
            user:       $user,
            roleId:     $data['role_id'],
            assignedBy: $request->user()->id,
        );

        if (!$assigned) {
            return response()->json(data: ['message' => 'User already has this role.'], status: 422);
        }

        $user->load(relations: 'roles');

        return response()->json(data: [
            'data' => new UserResource(resource: $user),
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
        $this->authorize(ability: 'removeRole', arguments: Role::class);

        $data = $request->validated();
        $this->roleService->removeRoleFromUser(user: $user, roleId: $data['role_id']);

        $user->load(relations: 'roles');

        return response()->json(data: [
            'data' => new UserResource(resource: $user),
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
        $this->authorize(ability: 'managePermissions', arguments: Role::class);

        $data  = $request->validated();
        $added = $this->roleService->addPermissionToRole(role: $role, permissionId: $data['permission_id']);

        if (!$added) {
            return response()->json(data: ['message' => 'Role already has this permission.'], status: 422);
        }

        $role->load(relations: 'permissions');

        return response()->json(data: [
            'data' => new RoleResource(resource: $role),
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
        $this->authorize(ability: 'managePermissions', arguments: Role::class);

        $data = $request->validated();
        $this->roleService->removePermissionFromRole(role: $role, permissionId: $data['permission_id']);

        $role->load(relations: 'permissions');

        return response()->json(data: [
            'data' => new RoleResource(resource: $role),
        ]);
    }
}
