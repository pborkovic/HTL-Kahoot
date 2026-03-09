<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Question;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\QuestionRepositoryContract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuestionRepository extends BaseRepository implements QuestionRepositoryContract
{
    public function __construct(Question $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createWithVersionAndOptions(array $data, string $userId): Question
    {
        return DB::transaction(function () use ($data, $userId): Question {
            $question = $this->model->newInstance()->create([
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

            return $question->load(relations: 'currentVersion.answerOptions');
        });
    }
}
