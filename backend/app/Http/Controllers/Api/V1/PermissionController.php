<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CreatePermissionRequest;
use App\Http\Resources\Api\V1\PermissionResource;
use App\Models\Permission;
use App\Services\Contracts\PermissionServiceContract;
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

class PermissionController extends Controller
{
    public function __construct(
        private readonly PermissionServiceContract $permissionService,
    ) {}

    #[Get(
        path: '/api/v1/permissions',
        description: 'Returns all available permissions. Admin and superadmin only.',
        summary: 'List all permissions',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        responses: [
            new Response(
                response: 200,
                description: 'Permission list',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/Permission')),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(): JsonResponse
    {
        $this->authorize(ability: 'viewAny', arguments: Permission::class);

        $permissions = $this->permissionService->all();

        return response()->json(data: [
            'data' => PermissionResource::collection(resource: $permissions),
        ]);
    }

    #[Post(
        path: '/api/v1/permissions',
        description: 'Creates a new permission. Superadmin only.',
        summary: 'Create a permission',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['name'],
                properties: [
                    new Property(property: 'name', description: 'Unique permission name', type: 'string', maxLength: 100),
                ]
            )
        ),
        tags: ['Permissions'],
        responses: [
            new Response(response: 201, description: 'Permission created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Permission')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreatePermissionRequest $request): JsonResponse
    {
        $this->authorize(ability: 'create', arguments: Permission::class);

        $validated = $request->validated();
        $permission = $this->permissionService->create(data: [
            'key'   => $validated['name'],
            'group' => 'custom',
        ]);

        return (
            new PermissionResource(resource: $permission)
        )->response()->setStatusCode(code: 201);
    }

    #[Delete(
        path: '/api/v1/permissions/{id}',
        description: 'Deletes a permission and detaches it from all roles. Superadmin only.',
        summary: 'Delete a permission',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
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
    public function destroy(Permission $permission): JsonResponse
    {
        $this->authorize(ability: 'delete', arguments: $permission);

        $this->permissionService->deleteWithRelations(permission: $permission);

        return response()->json(data: null, status: 204);
    }
}
