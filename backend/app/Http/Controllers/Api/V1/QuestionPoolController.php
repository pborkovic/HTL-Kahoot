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

class QuestionPoolController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $this->authorize('viewAny', QuestionPool::class);

        $perPage = $request->integer('per_page', 20);

        $pools = QuestionPool::withCount('questions')->paginate($perPage);

        return new QuestionPoolCollection($pools);
    }

    public function store(CreatePoolRequest $request): JsonResponse
    {
        $this->authorize('create', QuestionPool::class);

        $data               = $request->validated();
        $data['created_by'] = $request->user()->id;

        $pool = QuestionPool::create($data);

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')), 201);
    }

    public function show(QuestionPool $pool): JsonResponse
    {
        $this->authorize('view', $pool);

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    public function update(UpdatePoolRequest $request, QuestionPool $pool): JsonResponse
    {
        $this->authorize('update', $pool);

        $pool->update($request->validated());

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    public function destroy(QuestionPool $pool): JsonResponse
    {
        $this->authorize('delete', $pool);

        $pool->delete();

        return response()->json(null, 204);
    }

    public function addQuestions(AddPoolQuestionsRequest $request, QuestionPool $pool): JsonResponse
    {
        $this->authorize('manageQuestions', $pool);

        $questionIds = $request->validated()['question_ids'];
        $now         = now();

        $syncData = array_fill_keys($questionIds, ['added_at' => $now]);
        $pool->questions()->syncWithoutDetaching($syncData);

        return response()->json(new QuestionPoolResource($pool->loadCount('questions')));
    }

    public function removeQuestion(QuestionPool $pool, Question $question): JsonResponse
    {
        $this->authorize('manageQuestions', $pool);

        $pool->questions()->detach($question->id);

        return response()->json(null, 204);
    }
}
