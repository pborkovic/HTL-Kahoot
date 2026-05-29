<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class DepartmentController extends Controller
{
    #[Get(
        path: '/api/v1/departments',
        summary: 'List departments',
        description: 'Returns the full list of departments ordered by display_order.',
        security: [['sanctum' => []]],
        tags: ['Departments'],
        responses: [
            new Response(
                response: 200,
                description: 'List of departments',
                content: new JsonContent(
                    properties: [
                        new Property(
                            property: 'data',
                            type: 'array',
                            items: new Items(
                                properties: [
                                    new Property(property: 'id', type: 'string', format: 'uuid'),
                                    new Property(property: 'name', type: 'string'),
                                    new Property(property: 'slug', type: 'string'),
                                    new Property(property: 'display_order', type: 'integer'),
                                ],
                                type: 'object'
                            )
                        ),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->orderBy(column: 'display_order')
            ->orderBy(column: 'name')
            ->get();

        return response()->json(data: [
            'data' => DepartmentResource::collection(resource: $departments),
        ]);
    }
}
