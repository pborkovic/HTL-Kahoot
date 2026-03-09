<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface RoleRepositoryContract extends BaseRepositoryContract
{
    /**
     * Retrieve all roles with their permissions eager-loaded.
     *
     * Fetches every role from the database and includes the related permissions
     * via a single additional query using Eloquent's `with()`. This avoids the
     * N+1 query problem when iterating over roles and accessing their permissions.
     *
     * @return Collection<int, \App\Models\Role> Collection of Role models, each with
     *                                           its `permissions` relationship loaded
     *
     * @see all() For retrieving roles without eager-loaded permissions
     */
    public function allWithPermissions(): Collection;
}
