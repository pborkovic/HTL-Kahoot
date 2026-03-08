<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\PermissionServiceContract;
use Exception;
use Illuminate\Support\Facades\Log;

class PermissionService extends BaseService implements PermissionServiceContract
{
    protected PermissionRepositoryContract $repository;

    public function __construct(PermissionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return Permission::class;
    }

    /**
     * {@inheritDoc}
     *
     * @uthor Philipp Borkovic
     */
    public function deleteWithRelations(Permission $permission): void
    {
        try {
            $permission->roles()->detach();
            $this->repository->delete(id: $permission->id);
        } catch (Exception $e) {
            Log::error(message: "Service error deleting permission with relations: {$e->getMessage()}", context: [
                'service'       => get_class($this),
                'permission_id' => $permission->id,
                'trace'         => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
