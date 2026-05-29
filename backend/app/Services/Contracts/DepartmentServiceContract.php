<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Department;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Support\Collection;

interface DepartmentServiceContract extends BaseServiceContract
{
    /**
     * @return Collection<int, Department>
     */
    public function listOrdered(): Collection;

    /**
     * Count all departments.
     */
    public function countAll(): int;
}
