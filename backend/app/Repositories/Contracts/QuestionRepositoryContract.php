<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Question;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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

    /**
     * Create a new version for an existing question atomically.
     *
     * Optionally updates the question's type, then creates a new QuestionVersion
     * record with the next version number. Falls back to the current version's
     * values for any fields not provided in $data. Also creates new AnswerOption
     * records if answer_options are provided. Updates current_version_id to the
     * newly created version.
     *
     * @param Question $question The existing question to update.
     * @param array{
     *     type?: string,
     *     title?: string,
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
     * } $data   The update data (partial; missing fields inherit from current version).
     * @param string $userId The UUID of the user creating the new version.
     *
     * @return Question The updated question with currentVersion.answerOptions loaded.
     *
     * @throws QueryException If a database constraint is violated.
     */
    public function updateWithNewVersion(Question $question, array $data, string $userId): Question;

    /**
     * Find a soft-deleted question by its ID or fail.
     *
     * Includes trashed (soft-deleted) records in the query scope so that
     * a previously deleted question can be located for restoration.
     *
     * @param string $id The UUID of the question.
     *
     * @return Question The found question (may be soft-deleted).
     *
     * @throws ModelNotFoundException If no question with the given ID exists.
     */
    public function findTrashedOrFail(string $id): Question;

    /**
     * Get all versions of a question with their answer options.
     *
     * Returns versions ordered ascending by version number, each with
     * their answerOptions relation eagerly loaded.
     *
     * @param Question $question The question whose versions to retrieve.
     *
     * @return Collection<int, \App\Models\QuestionVersion> Ordered collection of versions.
     */
    public function getVersionsWithAnswerOptions(Question $question): Collection;

    /**
     * List questions with filters and pagination.
     *
     * Applies the QuestionFilter, optionally includes trashed records,
     * eager-loads the currentVersion relation, and paginates the results.
     *
     * @param array<string, mixed> $filters    Validated filter parameters.
     * @param bool                 $withTrashed Whether to include soft-deleted questions.
     * @param int                  $perPage     Number of results per page.
     *
     * @return LengthAwarePaginator Paginated, filtered question list.
     */
    public function listFiltered(array $filters, bool $withTrashed, int $perPage): LengthAwarePaginator;
}
