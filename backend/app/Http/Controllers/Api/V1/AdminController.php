<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Contracts\AdminServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Response;

class AdminController extends Controller
{
    public function __construct(
        private readonly AdminServiceContract $adminService,
    ) {
    }

    #[Get(
        path: '/api/v1/admin/system',
        summary: 'System health (superadmin)',
        description: 'Returns the up/down state for backing services (DB, Redis, queue, storage) plus app metadata. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        responses: [
            new Response(response: 200, description: 'Service status snapshot', content: new JsonContent(type: 'object')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function system(Request $request): JsonResponse
    {
        $this->adminService->ensureSuperadmin(user: $request->user());

        return response()->json(data: $this->adminService->buildSystemReport());
    }

    #[Get(
        path: '/api/v1/admin/metrics',
        summary: 'Platform metrics (superadmin)',
        description: 'Returns counters across users, content, sessions and feedback. Superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        responses: [
            new Response(response: 200, description: 'Platform metrics', content: new JsonContent(type: 'object')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function metrics(Request $request): JsonResponse
    {
        $this->adminService->ensureSuperadmin(user: $request->user());

        return response()->json(data: $this->adminService->buildMetricsReport());
    }
}
