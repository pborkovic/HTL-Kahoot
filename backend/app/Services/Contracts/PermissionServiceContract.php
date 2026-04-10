<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Permission;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Database\QueryException;

interface PermissionServiceContract extends BaseServiceContract
{
    /**
     * Delete a permission and detach it from all associated roles.
     *
     * Removes the permission from every role's `permission_role` pivot record
     * before deleting the permission itself. This ensures no orphaned pivot
     * records remain after deletion.
     *
     * @param  Permission  $permission  The permission instance to delete
     *
     * @throws QueryException If a database constraint prevents deletion
     *
     * @see delete() For deleting by ID without relation cleanup
     */
    public function deleteWithRelations(Permission $permission): void;
}
