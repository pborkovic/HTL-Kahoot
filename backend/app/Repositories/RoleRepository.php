<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Role;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\RoleRepositoryContract;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class RoleRepository extends BaseRepository implements RoleRepositoryContract
{
    public function __construct(Role $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function allWithPermissions(): Collection
    {
        try {
            return $this->model->with(relations: 'permissions')->get();
        } catch (Exception $e) {
            Log::error(message: "Repository error fetching roles with permissions: {$e->getMessage()}", context: [
                'repository' => get_class($this),
                'trace'      => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getUserCountsByRole(): Collection
    {
        return $this->model
            ->withCount(relations: 'users')
            ->get()
            ->pluck(value: 'users_count', key: 'name');
    }
}
