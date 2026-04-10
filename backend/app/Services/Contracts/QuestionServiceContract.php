<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Question;
use App\Models\QuestionVersion;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface QuestionServiceContract extends BaseServiceContract
{
    /**
     * List questions with filtering, sorting, and pagination.
     *
     * Applies validated filter parameters, optionally includes soft-deleted
     * questions (for admins), and returns a paginated result set.
     *
     * @param  array<string, mixed>  $filters  Validated filter/sort parameters.
     * @param  bool  $withTrashed  Whether to include soft-deleted questions.
     * @param  int  $perPage  Number of results per page.
     * @return LengthAwarePaginator Paginated question list with currentVersion loaded.
     */
    public function listFiltered(array $filters, bool $withTrashed, int $perPage): LengthAwarePaginator;

    /**
     * Create a new question with its first version and answer options.
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
     * } $data   The validated question data.
     * @param  User  $user  The authenticated user creating the question.
     * @return Question The created question with currentVersion.answerOptions loaded.
     */
    public function createQuestion(array $data, User $user): Question;

    /**
     * Show a question with its current version, answer options, and quiz questions.
     *
     * @param  Question  $question  The question to load relations for.
     * @return Question The question with relations loaded.
     */
    public function showQuestion(Question $question): Question;

    /**
     * Update a question by creating a new version.
     *
     * @param  Question  $question  The question to update.
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
     * } $data   The validated update data.
     * @param  User  $user  The authenticated user creating the new version.
     * @return Question The updated question with currentVersion.answerOptions loaded.
     */
    public function updateQuestion(Question $question, array $data, User $user): Question;

    /**
     * Soft-delete a question.
     *
     * @param  Question  $question  The question to delete.
     */
    public function deleteQuestion(Question $question): void;

    /**
     * Restore a soft-deleted question.
     *
     * @param  string  $id  The UUID of the soft-deleted question.
     * @return Question The restored question with currentVersion loaded.
     *
     * @throws ModelNotFoundException If no question with the given ID exists.
     */
    public function restoreQuestion(string $id): Question;

    /**
     * Get all versions of a question with their answer options.
     *
     * @param  Question  $question  The question whose versions to retrieve.
     * @return Collection<int, QuestionVersion> Ordered collection of versions.
     */
    public function getVersions(Question $question): Collection;

    /**
     * Toggle the published status of a question.
     *
     * @param  Question  $question  The question to toggle.
     * @return Question The updated question with currentVersion loaded.
     */
    public function togglePublish(Question $question): Question;
}
