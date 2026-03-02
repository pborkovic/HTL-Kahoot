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

class QuestionController extends Controller
{
    public function index(ListQuestionsRequest $request): ResourceCollection
    {
        $this->authorize('viewAny', Question::class);

        $query = Question::query();

        if ($request->boolean('with_trashed') && $request->user()->hasAnyRole(['admin', 'superadmin'])) {
            $query->withTrashed();
        }

        $query->with('currentVersion');

        $filter = new QuestionFilter();
        $filter->apply($query, $request->validated());

        $perPage = $request->integer('per_page', 20);

        return new QuestionCollection($query->paginate($perPage));
    }

    public function store(CreateQuestionRequest $request): JsonResponse
    {
        $this->authorize('create', Question::class);

        $data = $request->validated();

        $question = DB::transaction(function () use ($data, $request) {
            $question = Question::create([
                'created_by'   => $request->user()->id,
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
                'created_by'         => $request->user()->id,
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

    public function show(Question $question): JsonResponse
    {
        $this->authorize('view', $question);

        $question->load('currentVersion.answerOptions', 'currentVersion.quizQuestions');

        return response()->json(new QuestionResource($question));
    }

    public function update(UpdateQuestionRequest $request, Question $question): JsonResponse
    {
        $this->authorize('update', $question);

        $data = $request->validated();

        $question = DB::transaction(function () use ($data, $request, $question) {
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
                'created_by'         => $request->user()->id,
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

    public function destroy(Question $question): JsonResponse
    {
        $this->authorize('delete', $question);

        $question->delete();

        return response()->json(null, 204);
    }

    public function restore(string $id): JsonResponse
    {
        $question = Question::withTrashed()->findOrFail($id);

        $this->authorize('restore', $question);

        $question->restore();

        return response()->json(new QuestionResource($question->load('currentVersion')));
    }

    public function versions(Question $question): JsonResponse
    {
        $this->authorize('viewVersions', $question);

        $versions = $question->versions()->with('answerOptions')->orderBy('version')->get();

        return response()->json(QuestionVersionResource::collection($versions));
    }

    public function publish(Question $question): JsonResponse
    {
        $this->authorize('publish', $question);

        $question->update(['is_published' => !$question->is_published]);

        return response()->json(new QuestionResource($question->load('currentVersion')));
    }
}
