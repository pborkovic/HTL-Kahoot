<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\DepartmentServiceContract;
use Illuminate\Support\Collection;

class DepartmentService extends BaseService implements DepartmentServiceContract
{
    protected DepartmentRepositoryContract $repository;

    public function __construct(DepartmentRepositoryContract $repository)
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
        return Department::class;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function listOrdered(): Collection
    {
        return $this->repository->listOrdered();
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
