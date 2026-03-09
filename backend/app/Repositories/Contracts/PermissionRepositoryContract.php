<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

/**
 * Contract for the Permission repository.
 *
 * Inherits all standard CRUD and query operations from BaseRepositoryContract.
 * No additional methods are required — permission data access is fully covered
 * by the base repository operations.
 *
 * @see BaseRepositoryContract For inherited methods (all, find, create, update, delete, etc.)
 */
interface PermissionRepositoryContract extends BaseRepositoryContract
{
    //
}
