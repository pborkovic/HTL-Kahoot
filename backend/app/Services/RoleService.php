<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Repositories\Contracts\RoleRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\RoleServiceContract;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class RoleService extends BaseService implements RoleServiceContract
{
    protected RoleRepositoryContract $repository;

    public function __construct(RoleRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return Role::class;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getAllWithPermissions(): Collection
    {
        try {
            return $this->repository->allWithPermissions();
        } catch (Exception $e) {
            Log::error(message: "Service error fetching roles with permissions: {$e->getMessage()}", context: [
                'service' => get_class($this),
                'trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function deleteWithRelations(Role $role): void
    {
        try {
            $role->permissions()->detach();
            $role->users()->detach();
            $this->repository->delete(id: $role->id);
        } catch (Exception $e) {
            Log::error(message: "Service error deleting role with relations: {$e->getMessage()}", context: [
                'service' => get_class($this),
                'role_id' => $role->id,
                'trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function assignRoleToUser(User $user, string $roleId, string $assignedBy): bool
    {
        try {
            if ($user->roles()->where(column: 'roles.id', operator: '=', value: $roleId)->exists()) {
                return false;
            }

            $user->roles()->attach(ids: $roleId, attributes: [
                'assigned_at' => now(),
                'assigned_by' => $assignedBy,
            ]);

            return true;
        } catch (Exception $e) {
            Log::error(message: "Service error assigning role to user: {$e->getMessage()}", context: [
                'service' => get_class($this),
                'user_id' => $user->id,
                'role_id' => $roleId,
                'trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function removeRoleFromUser(User $user, string $roleId): void
    {
        try {
            $user->roles()->detach(ids: $roleId);
        } catch (Exception $e) {
            Log::error(message: "Service error removing role from user: {$e->getMessage()}", context: [
                'service' => get_class($this),
                'user_id' => $user->id,
                'role_id' => $roleId,
                'trace'   => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function addPermissionToRole(Role $role, string $permissionId): bool
    {
        try {
            if ($role->permissions()->where(column: 'permissions.id', operator: '=', value: $permissionId)->exists()) {
                return false;
            }

            $role->permissions()->attach(ids: $permissionId);

            return true;
        } catch (Exception $e) {
            Log::error(message: "Service error adding permission to role: {$e->getMessage()}", context: [
                'service'       => get_class($this),
                'role_id'       => $role->id,
                'permission_id' => $permissionId,
                'trace'         => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function removePermissionFromRole(Role $role, string $permissionId): void
    {
        try {
            $role->permissions()->detach(ids: $permissionId);
        } catch (Exception $e) {
            Log::error(message: "Service error removing permission from role: {$e->getMessage()}", context: [
                'service'       => get_class($this),
                'role_id'       => $role->id,
                'permission_id' => $permissionId,
                'trace'         => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getUserCountsByRole(): Collection
    {
        return $this->repository->getUserCountsByRole();
    }
}
