<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AddPoolQuestionsRequest;
use App\Http\Requests\Api\V1\CreatePoolRequest;
use App\Http\Requests\Api\V1\UpdatePoolRequest;
use App\Http\Resources\Api\V1\QuestionPoolCollection;
use App\Http\Resources\Api\V1\QuestionPoolResource;
use App\Models\Question;
use App\Models\QuestionPool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use OpenApi\Attributes\Delete;
use OpenApi\Attributes\Get;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\Put;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class QuestionPoolController extends Controller
{
    #[Get(
        path: '/api/v1/pools',
        summary: 'List question pools',
        description: 'Returns a paginated list of question pools. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        parameters: [
            new Parameter(name: 'per_page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1, maximum: 100)),
            new Parameter(name: 'page', in: 'query', required: false, schema: new Schema(type: 'integer', minimum: 1)),
        ],
        responses: [
            new Response(response: 200, description: 'Paginated pool list', content: new JsonContent(ref: '#/components/schemas/QuestionPoolList')),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Request $request): ResourceCollection
    {
        $perPage = $request->integer('per_page', 20);

        $pools = QuestionPool::withCount('questions')->paginate($perPage);

        return new QuestionPoolCollection($pools);
    }

    #[Post(
        path: '/api/v1/pools',
        summary: 'Create a question pool',
        description: 'Creates a new question pool. Accessible by teachers, admins and superadmins.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['name'],
                properties: [
                    new Property(property: 'name', type: 'string', maxLength: 255, example: 'Geography Questions'),
                    new Property(property: 'description', type: 'string', nullable: true),
                    new Property(property: 'is_shared', type: 'boolean', example: false),
                ]
            )
        ),
        responses: [
            new Response(response: 201, description: 'Pool created', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuestionPool')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(CreatePoolRequest $request): JsonResponse
    {
        $data               = $request->validated();
        $data['created_by'] = $request->user()?->id ?? \App\Models\User::first()?->id;

        $pool = QuestionPool::create($data);

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')), 201);
    }

    #[Get(
        path: '/api/v1/pools/{id}',
        summary: 'Get a question pool',
        description: 'Returns a question pool with its question count. Shared pools are visible to all authenticated users.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 200, description: 'Pool detail', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuestionPool')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(QuestionPool $pool): JsonResponse
    {
        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    #[Put(
        path: '/api/v1/pools/{id}',
        summary: 'Update a question pool',
        description: 'Updates pool name, description or shared flag. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                properties: [
                    new Property(property: 'name', type: 'string', maxLength: 255),
                    new Property(property: 'description', type: 'string', nullable: true),
                    new Property(property: 'is_shared', type: 'boolean'),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Updated pool', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuestionPool')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdatePoolRequest $request, QuestionPool $pool): JsonResponse
    {
        $pool->update($request->validated());

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    #[Delete(
        path: '/api/v1/pools/{id}',
        summary: 'Delete a question pool',
        description: 'Deletes a question pool. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
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
    public function destroy(QuestionPool $pool): JsonResponse
    {
        $pool->delete();

        return response()->json(null, 204);
    }

    #[Post(
        path: '/api/v1/pools/{id}/questions',
        summary: 'Add questions to a pool',
        description: 'Attaches one or more questions to the pool. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        requestBody: new RequestBody(
            required: true,
            content: new JsonContent(
                required: ['question_ids'],
                properties: [
                    new Property(
                        property: 'question_ids',
                        type: 'array',
                        items: new Items(type: 'string', format: 'uuid'),
                        example: ['uuid-1', 'uuid-2']
                    ),
                ]
            )
        ),
        responses: [
            new Response(response: 200, description: 'Pool with updated count', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuestionPool')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function addQuestions(AddPoolQuestionsRequest $request, QuestionPool $pool): JsonResponse
    {
        $questionIds = $request->validated()['question_ids'];
        $now         = now();

        $syncData = array_fill_keys($questionIds, ['added_at' => $now]);
        $pool->questions()->syncWithoutDetaching($syncData);

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    #[Delete(
        path: '/api/v1/pools/{id}/questions/{questionId}',
        summary: 'Remove a question from a pool',
        description: 'Detaches a question from the pool. Owner or admin/superadmin only.',
        security: [['sanctum' => []]],
        tags: ['Question Pools'],
        parameters: [
            new Parameter(name: 'id', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'questionId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 204, description: 'Removed (no content)'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function removeQuestion(QuestionPool $pool, Question $question): JsonResponse
    {

        $pool->questions()->detach($question->id);

        return response()->json(null, 204);
    }
}
