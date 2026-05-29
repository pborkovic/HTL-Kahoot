<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Quiz;
use App\Services\Base\Contracts\BaseServiceContract;

interface QuizServiceContract extends BaseServiceContract
{
    /**
     * Count all non-deleted quizzes.
     *
     * @see Quiz
     */
    public function countAll(): int;
}
