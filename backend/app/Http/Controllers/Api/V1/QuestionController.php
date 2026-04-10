<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CreateQuestionRequest;
use App\Http\Requests\Api\V1\ImportQuestionsRequest;
use App\Http\Requests\Api\V1\ListQuestionsRequest;
use App\Http\Requests\Api\V1\UpdateQuestionRequest;
use App\Http\Resources\Api\V1\QuestionCollection;
use App\Http\Resources\Api\V1\QuestionResource;
use App\Http\Resources\Api\V1\QuestionVersionResource;
use App\Models\Question;
use App\Services\Contracts\QuestionImportServiceContract;
use App\Services\Contracts\QuestionServiceContract;
use Illuminate\Http\JsonResponse;
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

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionServiceContract $questionService,
        private readonly QuestionImportServiceContract $importService,
    ) {}

    #[Get(
        path: '/api/v1/questions',
        summary: 'List questions',
        description: 'Returns a paginated, filterable list of questions. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'type', in: 'query', required: false, schema: new Schema(type: 'string', example: 'multiple_choice')),
            new Parameter(name: 'is_published', in: 'query', required: false, schema: new Schema(type: 'boolean')),
            new Parameter(name: 'search', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'created_by', in: 'query', required: false, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'pool_id', in: 'query', required: false, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'sort', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['created_at', 'type', 'is_published'])),
            new Parameter(name: 'direction', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['asc', 'desc'])),
            new Parameter(name: 'per_page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1, maximum: 100)),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
            new Parameter(name: 'with_trashed', in: 'query', required: false, schema: new Schema(type: 'boolean'), description: 'Include soft-deleted questions (admin/superadmin only)'),
        ],
        responses: [
            new Response(response: 200, description: 'Paginated question list', content: new JsonContent(ref: '#/components/schemas/QuestionList')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(ListQuestionsRequest $request): ResourceCollection
    {
        $this->authorize(ability: 'viewAny', arguments: Question::class);

        $withTrashed = $request->boolean(key: 'with_trashed') && $request->user()->hasAnyRole(roles: ['admin', 'superadmin']);

        $questions = $this->questionService->listFiltered(
            filters: $request->validated(),
            withTrashed: $withTrashed,
            perPage: $request->integer(key: 'per_page', default: 20),
        );

        return new QuestionCollection(resource: $questions);
    }

    #[Post(
        path: '/api/v1/questions',
        summary: 'Create a question',
        description: 'Creates a new question and its first version atomically. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['type', 'title'],
                properties: [
                    new Property(property: 'type', type: 'string', example: 'multiple_choice'),
                    new Property(property: 'title', type: 'string', example: 'What is the capital of France?'),
                    new Property(property: 'explanation', type: 'string', nullable: true),
                    new Property(property: 'difficulty', type: 'integer', minimum: 1, maximum: 5, nullable: true),
                    new Property(property: 'default_points', type: 'integer', minimum: 0, example: 1000),
                    new Property(property: 'default_time_limit', type: 'integer', minimum: 1, nullable: true),
                    new Property(property: 'randomize_options', type: 'boolean', example: true),
                    new Property(property: 'config', type: 'object'),
                    new Property(
                        property: 'answer_options',
                        type: 'array',
                        items: new Items(
                            properties: [
                                new Property(property: 'text', type: 'string', example: 'Paris'),
                                new Property(property: 'is_correct', type: 'boolean', example: true),
                                new Property(property: 'sort_order', type: 'integer', example: 0),
                            ],
                            type: 'object'
                        )
                    ),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'Question created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Question')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateQuestionRequest $request): JsonResponse
    {
        $this->authorize(ability: 'create', arguments: Question::class);

        $question = $this->questionService->createQuestion(
            data: $request->validated(),
            user: $request->user(),
        );

        return response()->json(data: new QuestionResource($question), status: 201);
    }

    #[Get(
        path: '/api/v1/questions/{id}',
        summary: 'Get a question',
        description: 'Returns a question with its current version and answer options. Published questions are visible to all authenticated users; unpublished ones require ownership or admin role.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Question detail', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Question')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Question $question): JsonResponse
    {
        $this->authorize(ability: 'view', arguments: $question);

        $question = $this->questionService->showQuestion(question: $question);

        return response()->json(data: new QuestionResource($question));
    }

    #[Put(
        path: '/api/v1/questions/{id}',
        summary: 'Update a question',
        description: 'Creates a new version of the question, preserving all previous versions. Updates current_version_id to the new version.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'type', type: 'string'),
                    new Property(property: 'title', type: 'string'),
                    new Property(property: 'explanation', type: 'string', nullable: true),
                    new Property(property: 'difficulty', type: 'integer', minimum: 1, maximum: 5, nullable: true),
                    new Property(property: 'default_points', type: 'integer', minimum: 0),
                    new Property(property: 'default_time_limit', type: 'integer', minimum: 1, nullable: true),
                    new Property(property: 'randomize_options', type: 'boolean'),
                    new Property(property: 'config', type: 'object'),
                    new Property(
                        property: 'answer_options',
                        type: 'array',
                        items: new Items(
                            properties: [
                                new Property(property: 'text', type: 'string'),
                                new Property(property: 'is_correct', type: 'boolean'),
                                new Property(property: 'sort_order', type: 'integer'),
                            ],
                            type: 'object'
                        )
                    ),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Updated question', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Question')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateQuestionRequest $request, Question $question): JsonResponse
    {
        $this->authorize(ability: 'update', arguments: $question);

        $question = $this->questionService->updateQuestion(
            question: $question,
            data: $request->validated(),
            user: $request->user(),
        );

        return response()->json(data: new QuestionResource($question));
    }

    #[Delete(
        path: '/api/v1/questions/{id}',
        summary: 'Soft-delete a question',
        description: 'Soft-deletes a question. The owner or admin/superadmin can delete.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
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
    public function destroy(Question $question): JsonResponse
    {
        $this->authorize(ability: 'delete', arguments: $question);

        $this->questionService->deleteQuestion(question: $question);

        return response()->json(data: null, status: 204);
    }

    #[Post(
        path: '/api/v1/questions/{id}/restore',
        summary: 'Restore a soft-deleted question',
        description: 'Restores a previously soft-deleted question. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Restored question', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Question')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function restore(string $id): JsonResponse
    {
        $question = $this->questionService->restoreQuestion(id: $id);

        $this->authorize(ability: 'restore', arguments: $question);

        return response()->json(data: new QuestionResource($question));
    }

    #[Get(
        path: '/api/v1/questions/{id}/versions',
        summary: 'List question versions',
        description: 'Returns all versions of a question ordered by version number. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(
                response: 200,
                description: 'List of versions',
                content: new JsonContent(
                    properties: [
                        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/QuestionVersion')),
                    ]
                )
            ),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function versions(Question $question): JsonResponse
    {
        $this->authorize(ability: 'viewVersions', arguments: $question);

        $versions = $this->questionService->getVersions(question: $question);

        return response()->json(data: QuestionVersionResource::collection(resource: $versions));
    }

    #[Patch(
        path: '/api/v1/questions/{id}/publish',
        summary: 'Toggle published status',
        description: 'Toggles the is_published flag of a question. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Updated question', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Question')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function publish(Question $question): JsonResponse
    {
        $this->authorize(ability: 'publish', arguments: $question);

        $question = $this->questionService->togglePublish(question: $question);

        return response()->json(data: new QuestionResource($question));
    }

    #[Post(
        path: '/api/v1/questions/import',
        summary: 'Import questions from file',
        description: 'Imports questions from a JSON or Moodle GIFT format file. Creates questions and their first versions atomically. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Questions'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['file', 'format'],
                properties: [
                    new Property(property: 'file', type: 'string', format: 'binary', description: 'The import file (JSON or GIFT)'),
                    new Property(property: 'format', type: 'string', enum: ['json', 'gift'], description: 'The file format'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Import results', content: new JsonContent(
                properties: [
                    new Property(property: 'imported', type: 'integer', example: 5),
                    new Property(property: 'failed', type: 'integer', example: 1),
                    new Property(property: 'errors', type: 'array', items: new Items(type: 'string')),
                    new Property(property: 'questions', type: 'array', items: new Items(ref: '#/components/schemas/Question')),
                ]
            )),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function import(ImportQuestionsRequest $request): JsonResponse
    {
        $this->authorize(ability: 'create', arguments: Question::class);

        $file = $request->file(key: 'file');
        $format = $request->validated(key: 'format');
        $content = $file->get();

        $result = $this->importService->import(
            content: $content,
            format: $format,
            user: $request->user(),
        );

        return response()->json(data: [
            'imported' => $result['imported'],
            'failed' => $result['failed'],
            'errors' => $result['errors'],
            'questions' => QuestionResource::collection(resource: $result['questions']),
        ]);
    }
}
