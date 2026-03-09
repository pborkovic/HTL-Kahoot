<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Question;
use Illuminate\Database\QueryException;

interface QuestionRepositoryContract extends BaseRepositoryContract
{
    /**
     * Create a question together with its first version and answer options atomically.
     *
     * Wraps the creation of the Question, its initial QuestionVersion, and
     * all associated AnswerOption records inside a single database transaction.
     * On success the returned Question has the `currentVersion.answerOptions`
     * relations already loaded.
     *
     * @param array{
     *     type: string,
     *     title: string,
     *     explanation?: string|null,
     *     difficulty?: int|null,
     *     default_points?: int,
     *     default_time_limit?: int|null,
     *     randomize_options?: bool,
     *     config?: array,
     *     answer_options?: array<int, array{
     *         text: string,
     *         is_correct?: bool,
     *         sort_order?: int
     *     }>,
     * } $data     Normalised question data.
     * @param string $userId The UUID of the user creating the question.
     *
     * @return Question The persisted question with currentVersion.answerOptions loaded.
     *
     * @throws QueryException If a database constraint is violated.
     */
    public function createWithVersionAndOptions(array $data, string $userId): Question;
}
