<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\QuestionFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CreateQuestionRequest;
use App\Http\Requests\Api\V1\ListQuestionsRequest;
use App\Http\Requests\Api\V1\UpdateQuestionRequest;
use App\Http\Resources\Api\V1\QuestionCollection;
use App\Http\Resources\Api\V1\QuestionResource;
use App\Http\Resources\Api\V1\QuestionVersionResource;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\DB;
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
        logger()->info("HELLLOOOOO");
        $query = Question::query();

        if ($request->boolean('with_trashed') && $request->user()?->hasAnyRole(['admin', 'superadmin'])) {
            $query->withTrashed();
        }

        $query->with('currentVersion');

        $filter = new QuestionFilter();
        $filter->apply($query, $request->validated());

        $perPage = $request->integer('per_page', 20);

        return new QuestionCollection($query->paginate($perPage));
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
        $data = $request->validated();
        $userId = $request->user()?->id ?? \App\Models\User::first()?->id;

        $question = DB::transaction(function () use ($data, $userId) {
            $question = Question::create([
                'created_by'   => $userId,
                'type'         => $data['type'],
                'is_published' => false,
            ]);

            $version = $question->versions()->create([
                'version'            => 1,
                'title'              => $data['title'],
                'explanation'        => $data['explanation'] ?? null,
                'difficulty'         => $data['difficulty'] ?? null,
                'default_points'     => $data['default_points'] ?? 1000,
                'default_time_limit' => $data['default_time_limit'] ?? null,
                'randomize_options'  => $data['randomize_options'] ?? true,
                'config'             => $data['config'] ?? [],
                'created_by'         => $userId,
            ]);

            foreach ($data['answer_options'] ?? [] as $i => $option) {
                $version->answerOptions()->create([
                    'text'       => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false,
                    'sort_order' => $option['sort_order'] ?? $i,
                ]);
            }

            $question->update(['current_version_id' => $version->id]);

            return $question->load('currentVersion.answerOptions');
        });

        return response()->json(new QuestionResource($question), 201);
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

        $question->load('currentVersion.answerOptions', 'currentVersion.quizQuestions');

        return response()->json(new QuestionResource($question));
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
        $data = $request->validated();
        $userId = $request->user()?->id ?? \App\Models\User::first()?->id;

        $question = DB::transaction(function () use ($data, $userId, $question) {
            if (!empty($data['type'])) {
                $question->update(['type' => $data['type']]);
            }

            $currentVersion = $question->currentVersion;
            $nextVersion    = $question->versions()->max('version') + 1;

            $version = $question->versions()->create([
                'version'            => $nextVersion,
                'title'              => $data['title'] ?? $currentVersion->title,
                'explanation'        => array_key_exists('explanation', $data) ? $data['explanation'] : $currentVersion->explanation,
                'difficulty'         => array_key_exists('difficulty', $data) ? $data['difficulty'] : $currentVersion->difficulty,
                'default_points'     => $data['default_points'] ?? $currentVersion->default_points,
                'default_time_limit' => array_key_exists('default_time_limit', $data) ? $data['default_time_limit'] : $currentVersion->default_time_limit,
                'randomize_options'  => $data['randomize_options'] ?? $currentVersion->randomize_options,
                'config'             => $data['config'] ?? $currentVersion->config,
                'created_by'         => $userId,
            ]);

            foreach ($data['answer_options'] ?? [] as $i => $option) {
                $version->answerOptions()->create([
                    'text'       => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false,
                    'sort_order' => $option['sort_order'] ?? $i,
                ]);
            }

            $question->update(['current_version_id' => $version->id]);

            return $question->load('currentVersion.answerOptions');
        });

        return response()->json(new QuestionResource($question));
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

        $question->delete();

        return response()->json(null, 204);
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
        $question = Question::withTrashed()->findOrFail($id);


        $question->restore();

        return response()->json(new QuestionResource($question->load('currentVersion')));
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

        $versions = $question->versions()->with('answerOptions')->orderBy('version')->get();

        return response()->json(QuestionVersionResource::collection($versions));
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

        $question->update(['is_published' => !$question->is_published]);

        return response()->json(new QuestionResource($question->load('currentVersion')));
    }
}
