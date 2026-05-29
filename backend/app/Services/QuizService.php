<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Quiz;
use App\Repositories\Contracts\QuizRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\QuizServiceContract;

class QuizService extends BaseService implements QuizServiceContract
{
    protected QuizRepositoryContract $repository;

    public function __construct(QuizRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getModelForPolicy(): string
    {
        return Quiz::class;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function countAll(): int
    {
        return $this->repository->countAll();
    }
}
