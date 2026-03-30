<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Models\User;
use App\Repositories\Contracts\QuestionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\QuestionServiceContract;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class QuestionService extends BaseService implements QuestionServiceContract
{
    protected QuestionRepositoryContract $repository;

    public function __construct(QuestionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function listFiltered(array $filters, bool $withTrashed, int $perPage): LengthAwarePaginator
    {
        return $this->repository->listFiltered(
            filters: $filters,
            withTrashed: $withTrashed,
            perPage: $perPage,
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createQuestion(array $data, User $user): Question
    {
        return $this->repository->createWithVersionAndOptions(
            data: $data,
            userId: $user->id,
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function showQuestion(Question $question): Question
    {
        return $question->load(relations: [
            'currentVersion.answerOptions',
            'currentVersion.quizQuestions',
            'media',
        ]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateQuestion(Question $question, array $data, User $user): Question
    {
        return $this->repository->updateWithNewVersion(
            question: $question,
            data: $data,
            userId: $user->id,
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function deleteQuestion(Question $question): void
    {
        $question->delete();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function restoreQuestion(string $id): Question
    {
        $question = $this->repository->findTrashedOrFail(id: $id);

        $question->restore();

        return $question->load(relations: 'currentVersion');
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getVersions(Question $question): Collection
    {
        return $this->repository->getVersionsWithAnswerOptions(question: $question);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function togglePublish(Question $question): Question
    {
        $question->update(attributes: ['is_published' => !$question->is_published]);

        return $question->load(relations: 'currentVersion');
    }

    public function getModelForPolicy(): string
    {
        return Question::class;
    }
}
