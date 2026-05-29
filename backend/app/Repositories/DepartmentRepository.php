<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Department;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\DepartmentRepositoryContract;
use Illuminate\Support\Collection;

class DepartmentRepository extends BaseRepository implements DepartmentRepositoryContract
{
    public function __construct(Department $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function listOrdered(): Collection
    {
        return $this->model->newQuery()
            ->orderBy(column: 'display_order')
            ->orderBy(column: 'name')
            ->get();
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
