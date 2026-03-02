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

class QuizController extends Controller
{
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

    public function store(CreateQuizRequest $request): JsonResponse
    {
        $this->authorize('create', Quiz::class);

        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $quiz = Quiz::create($data);

        return response()->json(new QuizResource($quiz), 201);
    }

    public function show(Quiz $quiz): JsonResponse
    {
        $this->authorize('view', $quiz);

        $quiz->load(['quizQuestions.questionVersion.answerOptions', 'pool']);

        return response()->json(new QuizResource($quiz));
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quiz->update($request->validated());

        return response()->json(new QuizResource($quiz));
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return response()->json(null, 204);
    }

    public function restore(string $id): JsonResponse
    {
        $quiz = Quiz::withTrashed()->findOrFail($id);

        $this->authorize('restore', $quiz);

        $quiz->restore();

        return response()->json(new QuizResource($quiz));
    }

    public function publish(Quiz $quiz): JsonResponse
    {
        $this->authorize('publish', $quiz);

        $quiz->update(['is_published' => !$quiz->is_published]);

        return response()->json(new QuizResource($quiz));
    }

    public function addQuestion(AddQuizQuestionRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion = $quiz->quizQuestions()->create($request->validated());

        return response()->json(
            new QuizQuestionResource($quizQuestion->load('questionVersion')),
            201
        );
    }

    public function updateQuestion(UpdateQuizQuestionRequest $request, Quiz $quiz, QuizQuestion $quizQuestion): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion->update($request->validated());

        return response()->json(new QuizQuestionResource($quizQuestion->load('questionVersion')));
    }

    public function removeQuestion(Quiz $quiz, QuizQuestion $quizQuestion): JsonResponse
    {
        $this->authorize('update', $quiz);

        $quizQuestion->delete();

        return response()->json(null, 204);
    }
}
