<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Role;
use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;
use Illuminate\Support\Collection;

interface RoleServiceContract extends BaseServiceContract
{
    /**
     * Retrieve all roles with their associated permissions eager-loaded.
     *
     * Fetches every role from the repository and includes the related permissions
     * in a single query to avoid N+1 problems. Useful for admin panels that
     * need to display the full role-permission matrix at once.
     *
     * @return Collection<int, Role> Collection of Role models, each with its
     *                               `permissions` relationship loaded
     *
     * @see \App\Repositories\Contracts\RoleRepositoryContract::allWithPermissions()
     */
    public function getAllWithPermissions(): Collection;

    /**
     * Delete a role and detach all associated relationships.
     *
     * Removes the role from every user and detaches all permissions before
     * deleting the role itself. This ensures no orphaned pivot records remain
     * in the `role_user` or `permission_role` tables.
     *
     * @param Role $role The role instance to delete
     *
     * @throws \Illuminate\Database\QueryException If a database constraint prevents deletion
     *
     * @see delete() For deleting by ID without relation cleanup
     */
    public function deleteWithRelations(Role $role): void;

    /**
     * Assign a role to a user.
     *
     * Attaches the specified role to the user via the `role_user` pivot table.
     * If the user already has the role, the operation is skipped and false is
     * returned to prevent duplicate pivot records.
     *
     * @param User   $user       The user to assign the role to
     * @param string $roleId     The UUID of the role to assign
     * @param string $assignedBy The UUID of the authenticated user performing the assignment
     *
     * @return bool True if the role was successfully assigned,
     *              false if the user already has the role
     *
     * @see removeRoleFromUser() For removing a role from a user
     */
    public function assignRoleToUser(User $user, string $roleId, string $assignedBy): bool;

    /**
     * Remove a role from a user.
     *
     * Detaches the specified role from the user's `role_user` pivot record.
     * If the user does not have the role, no error is thrown — the operation
     * is silently ignored.
     *
     * @param User   $user   The user to remove the role from
     * @param string $roleId The UUID of the role to remove
     *
     * @see assignRoleToUser() For assigning a role to a user
     */
    public function removeRoleFromUser(User $user, string $roleId): void;

    /**
     * Add a permission to a role.
     *
     * Attaches the specified permission to the role via the `permission_role`
     * pivot table. If the role already has the permission, the operation is
     * skipped and false is returned to prevent duplicate pivot records.
     *
     * @param Role   $role         The role to add the permission to
     * @param string $permissionId The UUID of the permission to attach
     *
     * @return bool True if the permission was successfully added,
     *              false if the role already has the permission
     *
     * @see removePermissionFromRole() For removing a permission from a role
     */
    public function addPermissionToRole(Role $role, string $permissionId): bool;

    /**
     * Remove a permission from a role.
     *
     * Detaches the specified permission from the role's `permission_role` pivot
     * record. If the role does not have the permission, no error is thrown —
     * the operation is silently ignored.
     *
     * @param Role   $role         The role to remove the permission from
     * @param string $permissionId The UUID of the permission to detach
     *
     * @see addPermissionToRole() For adding a permission to a role
     */
    public function removePermissionFromRole(Role $role, string $permissionId): void;
}
