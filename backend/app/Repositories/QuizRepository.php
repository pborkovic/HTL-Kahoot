<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Quiz;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\QuizRepositoryContract;

class QuizRepository extends BaseRepository implements QuizRepositoryContract
{
    public function __construct(Quiz $model)
    {
        parent::__construct(model: $model);
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
}
