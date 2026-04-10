<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SubmitPlatformFeedbackRequest;
use App\Http\Resources\Api\V1\PlatformFeedbackResource;
use App\Models\PlatformFeedback;
use App\Services\Contracts\PlatformFeedbackServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Patch;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

/**
 * REST controller for the platform feedback feature.
 */
class PlatformFeedbackController extends Controller
{
    public function __construct(
        private readonly PlatformFeedbackServiceContract $feedbackService,
    ) {}

    #[Post(
        path: '/api/v1/feedback',
        description: 'Submits a new piece of platform feedback. The local AI model classifies the message as constructive or not before persistence.',
        summary: 'Submit platform feedback',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['message'],
                properties: [
                    new Property(property: 'message', type: 'string', minLength: 5, maxLength: 4000),
                ]
            )
        ),
        tags: ['Platform Feedback'],
        responses: [
            new Response(response: 201, description: 'Feedback submitted', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/PlatformFeedback')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(SubmitPlatformFeedbackRequest $request): JsonResponse
    {
        $this->authorize(ability: 'create', arguments: PlatformFeedback::class);

        $feedback = $this->feedbackService->submit(
            user: $request->user(),
            message: $request->validated(key: 'message'),
        );

        return (new PlatformFeedbackResource(resource: $feedback))
            ->response()
            ->setStatusCode(code: 201);
    }

    #[Get(
        path: '/api/v1/feedback/me',
        description: 'Lists every feedback entry submitted by the authenticated user, newest first.',
        summary: "List the caller's own feedback",
        security: [['sanctum' => []]],
        tags: ['Platform Feedback'],
        responses: [
            new Response(
                response: 200,
                description: 'My feedback list',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/PlatformFeedback')),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function mine(Request $request): JsonResponse
    {
        $this->authorize(ability: 'viewOwn', arguments: PlatformFeedback::class);

        $items = $this->feedbackService->listForUser(user: $request->user());

        return response()->json(data: [
            'data' => PlatformFeedbackResource::collection(resource: $items),
        ]);
    }

    #[Get(
        path: '/api/v1/feedback',
        description: 'Lists constructive feedback for administrators. Supports filtering by status (open/solved) and pagination.',
        summary: 'List all platform feedback (admin)',
        security: [['sanctum' => []]],
        tags: ['Platform Feedback'],
        parameters: [
            new Parameter(name: 'status', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['open', 'solved'])),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
            new Parameter(name: 'per_page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1, maximum: 100)),
        ],
        responses: [
            new Response(
                response: 200,
                description: 'Feedback list',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/PlatformFeedback')),
                        new Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $this->authorize(ability: 'viewAll', arguments: PlatformFeedback::class);

        $status = $request->query(key: 'status');
        $page = max(1, (int) $request->query(key: 'page', default: 1));
        $perPage = min(100, max(1, (int) $request->query(key: 'per_page', default: 20)));

        if ($status !== null && ! in_array(needle: $status, haystack: ['open', 'solved'], strict: true)) {
            $status = null;
        }

        $paginator = $this->feedbackService->paginateForAdmin(
            status: $status,
            page: $page,
            perPage: $perPage,
        );

        return response()->json(data: [
            'data' => PlatformFeedbackResource::collection(resource: $paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    #[Patch(
        path: '/api/v1/feedback/{id}/resolve',
        description: 'Marks a feedback entry as solved. Admin only.',
        summary: 'Resolve a feedback entry',
        security: [['sanctum' => []]],
        tags: ['Platform Feedback'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Marked as solved', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/PlatformFeedback')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function resolve(Request $request, PlatformFeedback $feedback): JsonResponse
    {
        $this->authorize(ability: 'resolve', arguments: $feedback);

        $updated = $this->feedbackService->markResolved(
            feedback: $feedback,
            admin: $request->user(),
        );

        return response()->json(data: [
            'data' => new PlatformFeedbackResource(resource: $updated),
        ]);
    }

    #[Patch(
        path: '/api/v1/feedback/{id}/reopen',
        description: 'Reopens a previously resolved feedback entry. Admin only.',
        summary: 'Reopen a feedback entry',
        security: [['sanctum' => []]],
        tags: ['Platform Feedback'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Reopened', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/PlatformFeedback')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function reopen(PlatformFeedback $feedback): JsonResponse
    {
        $this->authorize(ability: 'resolve', arguments: $feedback);

        $updated = $this->feedbackService->reopen(feedback: $feedback);

        return response()->json(data: [
            'data' => new PlatformFeedbackResource(resource: $updated),
        ]);
    }
}
