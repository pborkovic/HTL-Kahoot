<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

/**
 * Contract for the Quiz repository.
 *
 * Currently exposes only count helpers used by aggregated reporting. The
 * existing Quiz controller talks to the Eloquent model directly; new quiz
 * data-access entry points should be added here.
 */
interface QuizRepositoryContract extends BaseRepositoryContract
{
    /**
     * Count all non-deleted quizzes.
     */
    public function countAll(): int;
}
