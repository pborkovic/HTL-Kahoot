<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DepartmentRepositoryContract extends BaseRepositoryContract
{
    /**
     * Return all departments ordered by display_order then name.
     */
    public function listOrdered(): Collection;

    /**
     * Count all departments.
     */
    public function countAll(): int;
}
