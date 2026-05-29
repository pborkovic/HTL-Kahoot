<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Filters\QuestionFilter;
use App\Models\Question;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\QuestionRepositoryContract;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class QuestionRepository extends BaseRepository implements QuestionRepositoryContract
{
    public function __construct(Question $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createWithVersionAndOptions(array $data, string $userId): Question
    {
        return DB::transaction(function () use ($data, $userId): Question {
            $question = $this->model->newInstance()->create(attributes: [
                'created_by' => $userId,
                'type' => $data['type'],
                'is_published' => false,
            ]);

            $version = $question->versions()->create(attributes: [
                'version' => 1,
                'title' => $data['title'],
                'explanation' => $data['explanation'] ?? null,
                'difficulty' => $data['difficulty'] ?? null,
                'default_points' => $data['default_points'] ?? 1000,
                'default_time_limit' => $data['default_time_limit'] ?? null,
                'randomize_options' => $data['randomize_options'] ?? true,
                'config' => $data['config'] ?? [],
                'created_by' => $userId,
            ]);

            foreach ($data['answer_options'] ?? [] as $i => $option) {
                $version->answerOptions()->create(attributes: [
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false,
                    'sort_order' => $option['sort_order'] ?? $i,
                ]);
            }

            $question->update(attributes: ['current_version_id' => $version->id]);

            if (array_key_exists(key: 'department_ids', array: $data)) {
                $question->departments()->sync($data['department_ids'] ?? []);
            }

            return $question->load(relations: ['currentVersion.answerOptions', 'media', 'departments']);
        });
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function updateWithNewVersion(Question $question, array $data, string $userId): Question
    {
        return DB::transaction(function () use ($question, $data, $userId): Question {
            if (! empty($data['type'])) {
                $question->update(attributes: ['type' => $data['type']]);
            }

            $currentVersion = $question->currentVersion;
            $nextVersion = $question->versions()->max(column: 'version') + 1;

            $version = $question->versions()->create(attributes: [
                'version' => $nextVersion,
                'title' => $data['title'] ?? $currentVersion->title,
                'explanation' => array_key_exists(key: 'explanation', array: $data) ? $data['explanation'] : $currentVersion->explanation,
                'difficulty' => array_key_exists(key: 'difficulty', array: $data) ? $data['difficulty'] : $currentVersion->difficulty,
                'default_points' => $data['default_points'] ?? $currentVersion->default_points,
                'default_time_limit' => array_key_exists(key: 'default_time_limit', array: $data) ? $data['default_time_limit'] : $currentVersion->default_time_limit,
                'randomize_options' => $data['randomize_options'] ?? $currentVersion->randomize_options,
                'config' => $data['config'] ?? $currentVersion->config,
                'created_by' => $userId,
            ]);

            foreach ($data['answer_options'] ?? [] as $i => $option) {
                $version->answerOptions()->create(attributes: [
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false,
                    'sort_order' => $option['sort_order'] ?? $i,
                ]);
            }

            $question->update(attributes: ['current_version_id' => $version->id]);

            if (array_key_exists(key: 'department_ids', array: $data)) {
                $question->departments()->sync($data['department_ids'] ?? []);
            }

            return $question->load(relations: ['currentVersion.answerOptions', 'media', 'departments']);
        });
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findTrashedOrFail(string $id): Question
    {
        return $this->model->newInstance()
            ->withTrashed()
            ->findOrFail(id: $id);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getVersionsWithAnswerOptions(Question $question): Collection
    {
        return $question->versions()
            ->with(relations: 'answerOptions')
            ->orderBy(column: 'version')
            ->get();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function listFiltered(array $filters, bool $withTrashed, int $perPage): LengthAwarePaginator
    {
        $query = $this->model->newInstance()->newQuery();

        if ($withTrashed) {
            $query->withTrashed();
        }

        $query->with(relations: ['currentVersion', 'media', 'departments']);

        $filter = new QuestionFilter();
        $filter->apply(query: $query, filters: $filters);

        return $query->paginate(perPage: $perPage);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countAll(): int
    {
        return $this->model->newQuery()->count();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countPublished(): int
    {
        return $this->model->newQuery()
            ->where(column: 'is_published', operator: '=', value: true)
            ->count();
    }
}
