<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\QuizFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AddQuizQuestionRequest;
use App\Http\Requests\Api\V1\CreateQuizRequest;
use App\Http\Requests\Api\V1\ListQuizzesRequest;
use App\Http\Requests\Api\V1\UpdateQuizQuestionRequest;
use App\Http\Requests\Api\V1\UpdateQuizRequest;
use App\Http\Resources\Api\V1\QuizCollection;
use App\Http\Resources\Api\V1\QuizQuestionResource;
use App\Http\Resources\Api\V1\QuizResource;
use App\Models\Quiz;
use App\Models\QuizQuestion;
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

class QuizController extends Controller
{
    #[Get(
        path: '/api/v1/quizzes',
        summary: 'List quizzes',
        description: 'Returns a paginated, filterable list of quizzes. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'is_published', in: 'query', required: false, schema: new Schema(type: 'boolean')),
            new Parameter(name: 'search', in: 'query', required: false, schema: new Schema(type: 'string')),
            new Parameter(name: 'created_by', in: 'query', required: false, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'pool_id', in: 'query', required: false, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'sort', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['created_at', 'title', 'is_published'])),
            new Parameter(name: 'direction', in: 'query', required: false, schema: new Schema(type: 'string', enum: ['asc', 'desc'])),
            new Parameter(name: 'per_page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1, maximum: 100)),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
            new Parameter(name: 'with_trashed', in: 'query', required: false, schema: new Schema(type: 'boolean'), description: 'Include soft-deleted quizzes (admin/superadmin only)'),
        ],
        responses: [
            new Response(response: 200, description: 'Paginated quiz list', content: new JsonContent(ref: '#/components/schemas/QuizList')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(ListQuizzesRequest $request): ResourceCollection
    {
        $this->authorize('viewAny', Quiz::class);

        $query = Quiz::query();

        if ($request->boolean('with_trashed') && $request->user()->hasAnyRole(['admin', 'superadmin'])) {
            $query->withTrashed();
        }

        $filter = new QuizFilter();
        $filter->apply($query, $request->validated());

        $perPage = $request->integer('per_page', 20);

        return new QuizCollection($query->paginate($perPage));
    }

    #[Post(
        path: '/api/v1/quizzes',
        summary: 'Create a quiz',
        description: 'Creates a new quiz. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['title'],
                properties: [
                    new Property(property: 'title', type: 'string', example: 'French Geography Quiz'),
                    new Property(property: 'description', type: 'string', nullable: true),
                    new Property(property: 'pool_id', type: 'string', format: 'uuid', nullable: true),
                    new Property(property: 'time_mode', type: 'string', enum: ['per_question', 'total'], example: 'per_question'),
                    new Property(property: 'total_time_limit', type: 'integer', nullable: true),
                    new Property(property: 'speed_scoring', type: 'boolean', example: true),
                    new Property(property: 'speed_factor_min', type: 'number', example: 0.8),
                    new Property(property: 'speed_factor_max', type: 'number', example: 1.0),
                    new Property(property: 'gamble_uses', type: 'integer', example: 0),
                    new Property(property: 'randomize_questions', type: 'boolean', example: false),
                    new Property(property: 'random_mode', type: 'string', nullable: true),
                    new Property(property: 'random_count', type: 'integer', nullable: true),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'Quiz created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Quiz')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreateQuizRequest $request): JsonResponse
    {
        $this->authorize('create', Quiz::class);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $quiz = Quiz::create($data);

        return response()->json(new QuizResource($quiz), 201);
    }

    #[Get(
        path: '/api/v1/quizzes/{id}',
        summary: 'Get a quiz',
        description: 'Returns a quiz with its questions and pool. Published quizzes are visible to all authenticated users.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Quiz detail', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Quiz')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        $quiz->load(['quizQuestions.questionVersion.answerOptions', 'pool']);

        return response()->json(new QuizResource($quiz));
    }

    #[Put(
        path: '/api/v1/quizzes/{id}',
        summary: 'Update a quiz',
        description: 'Updates quiz settings. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'title', type: 'string'),
                    new Property(property: 'description', type: 'string', nullable: true),
                    new Property(property: 'pool_id', type: 'string', format: 'uuid', nullable: true),
                    new Property(property: 'time_mode', type: 'string', enum: ['per_question', 'total']),
                    new Property(property: 'total_time_limit', type: 'integer', nullable: true),
                    new Property(property: 'speed_scoring', type: 'boolean'),
                    new Property(property: 'speed_factor_min', type: 'number'),
                    new Property(property: 'speed_factor_max', type: 'number'),
                    new Property(property: 'gamble_uses', type: 'integer'),
                    new Property(property: 'randomize_questions', type: 'boolean'),
                    new Property(property: 'random_mode', type: 'string', nullable: true),
                    new Property(property: 'random_count', type: 'integer', nullable: true),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Updated quiz', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Quiz')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateQuizRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quiz->update($request->validated());

        return response()->json(new QuizResource($quiz));
    }

    #[Delete(
        path: '/api/v1/quizzes/{id}',
        summary: 'Soft-delete a quiz',
        description: 'Soft-deletes a quiz. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
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
    public function destroy(Quiz $quiz): JsonResponse
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return response()->json(null, 204);
    }

    #[Post(
        path: '/api/v1/quizzes/{id}/restore',
        summary: 'Restore a soft-deleted quiz',
        description: 'Restores a previously soft-deleted quiz. Admin and superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Restored quiz', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Quiz')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function restore(string $id): JsonResponse
    {
        $quiz = Quiz::withTrashed()->findOrFail($id);

        $this->authorize('restore', $quiz);

        $quiz->restore();

        return response()->json(new QuizResource($quiz));
    }

    #[Patch(
        path: '/api/v1/quizzes/{id}/publish',
        summary: 'Toggle published status',
        description: 'Toggles the is_published flag of a quiz. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Updated quiz', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/Quiz')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function publish(Quiz $quiz): JsonResponse
    {
        $this->authorize('publish', $quiz);

        $quiz->update(['is_published' => !$quiz->is_published]);

        return response()->json(new QuizResource($quiz));
    }

    #[Post(
        path: '/api/v1/quizzes/{id}/questions',
        summary: 'Add a question to a quiz',
        description: 'Adds a specific question version to the quiz with sort order and optional overrides.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['question_version_id', 'sort_order'],
                properties: [
                    new Property(property: 'question_version_id', type: 'string', format: 'uuid'),
                    new Property(property: 'sort_order', type: 'integer', minimum: 0, example: 0),
                    new Property(property: 'points_override', type: 'integer', minimum: 0, nullable: true),
                    new Property(property: 'time_limit_override', type: 'integer', minimum: 1, nullable: true),
                    new Property(property: 'weight', type: 'number', example: 1.0),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'Question added', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuizQuestion')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function addQuestion(AddQuizQuestionRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion = $quiz->quizQuestions()->create($request->validated());

        return response()->json(
            new QuizQuestionResource($quizQuestion->load('questionVersion')),
            201
        );
    }

    #[Put(
        path: '/api/v1/quizzes/{id}/questions/{quizQuestionId}',
        summary: 'Update a quiz question',
        description: 'Updates sort order, point/time overrides, or weight for a question in the quiz.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'quizQuestionId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'sort_order', type: 'integer', minimum: 0),
                    new Property(property: 'points_override', type: 'integer', minimum: 0, nullable: true),
                    new Property(property: 'time_limit_override', type: 'integer', minimum: 1, nullable: true),
                    new Property(property: 'weight', type: 'number'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Updated quiz question', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuizQuestion')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updateQuestion(UpdateQuizQuestionRequest $request, Quiz $quiz, QuizQuestion $quizQuestion): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion->update($request->validated());

        return response()->json(new QuizQuestionResource($quizQuestion->load('questionVersion')));
    }

    #[Delete(
        path: '/api/v1/quizzes/{id}/questions/{quizQuestionId}',
        summary: 'Remove a question from a quiz',
        description: 'Removes a question entry from the quiz.',
        security: [['sanctum' => []]],
        tags: ['Quizzes'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'quizQuestionId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 204, description: 'Removed (no content)'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function removeQuestion(Quiz $quiz, QuizQuestion $quizQuestion): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion->delete();

        return response()->json(null, 204);
    }
}
