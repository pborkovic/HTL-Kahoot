<?php

namespace App\Services\Base;

use App\Services\Base\Contracts\BaseServiceContract;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Base service implementation.
 *
 * This class provides the base functionality for all services,
 * proxying to the repository methods and adding additional functionality.
 */
abstract class BaseService implements BaseServiceContract
{
    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function all(): Collection
    {
        try {
            return $this->repository->all();
        } catch (Exception $e) {
            Log::error("Service error fetching all records: {$e->getMessage()}", [
                'service' => get_class($this),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function find(int|string $id): ?Model
    {
        try {
            return $this->repository->find($id);
        } catch (Exception $e) {
            Log::error("Service error finding record by ID: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function findOrFail(int|string $id): Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::warning("Service warning: Record not found: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
            ]);

            throw $e;
        } catch (Exception $e) {
            Log::error("Service error finding record by ID: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function first(): ?Model
    {
        try {
            return $this->repository->first();
        } catch (Exception $e) {
            Log::error("Service error fetching first record: {$e->getMessage()}", [
                'service' => get_class($this),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function create(array $data): Model
    {
        try {
            return $this->repository->create($data);
        } catch (Exception $e) {
            Log::error("Service error creating record: {$e->getMessage()}", [
                'service' => get_class($this),
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function update(int|string $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (Exception $e) {
            Log::error("Service error updating record: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function delete(int|string $id): ?bool
    {
        try {
            return $this->repository->delete($id);
        } catch (ModelNotFoundException $e) {
            Log::warning("Service warning: Record to delete not found: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
            ]);

            return false;
        } catch (Exception $e) {
            Log::error("Service error deleting record: {$e->getMessage()}", [
                'service' => get_class($this),
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function findWhere(array $criteria): Collection
    {
        try {
            return $this->repository->findWhere($criteria);
        } catch (Exception $e) {
            Log::error("Service error finding records by criteria: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function findWhereFirst(array $criteria): ?Model
    {
        try {
            return $this->repository->findWhereFirst($criteria);
        } catch (Exception $e) {
            Log::error("Service error finding first record by criteria: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function paginate(
        int $perPage = 15,
        array $columns = ['*'],
        array $relations = [],
        array $where = [],
        string $orderBy = 'created_at',
        string $orderDir = 'desc'
    ): LengthAwarePaginator {
        try {
            return $this->repository->paginate($perPage, $columns, $relations, $where, $orderBy, $orderDir);
        } catch (Exception $e) {
            Log::error("Service error paginating records: {$e->getMessage()}", [
                'service' => get_class($this),
                'where' => $where,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function getTotalRecords(): int
    {
        try {
            return $this->repository->getTotalRecords();
        } catch (Exception $e) {
            Log::error("Service error getting total records: {$e->getMessage()}", [
                'service' => get_class($this),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function getTotalRecordsWhere(array $criteria): int
    {
        try {
            return $this->repository->getTotalRecordsWhere($criteria);
        } catch (Exception $e) {
            Log::error("Service error getting total records with criteria: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function findMany(array $ids): Collection
    {
        try {
            return $this->repository->findMany($ids);
        } catch (Exception $e) {
            Log::error("Service error finding many records: {$e->getMessage()}", [
                'service' => get_class($this),
                'ids' => $ids,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function paginateWhere(array $criteria, ?int $perPage = null): LengthAwarePaginator
    {
        try {
            return $this->repository->paginateWhere($criteria, $perPage);
        } catch (Exception $e) {
            Log::error("Service error paginating records with criteria: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function createMany(array $data): Collection
    {
        try {
            return $this->repository->createMany($data);
        } catch (Exception $e) {
            Log::error("Service error creating many records: {$e->getMessage()}", [
                'service' => get_class($this),
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function updateWhere(array $criteria, array $data): bool
    {
        try {
            return $this->repository->updateWhere($criteria, $data);
        } catch (Exception $e) {
            Log::error("Service error updating records where: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function deleteWhere(array $criteria): bool
    {
        try {
            return $this->repository->deleteWhere($criteria);
        } catch (Exception $e) {
            Log::error("Service error deleting records where: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function select(array $columns): Model
    {
        try {
            return $this->repository->select($columns);
        } catch (Exception $e) {
            Log::error("Service error selecting columns: {$e->getMessage()}", [
                'service' => get_class($this),
                'columns' => $columns,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function with(array $relations): Model
    {
        try {
            return $this->repository->with($relations);
        } catch (Exception $e) {
            Log::error("Service error loading relations: {$e->getMessage()}", [
                'service' => get_class($this),
                'relations' => $relations,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function exists(string $field, $value): bool
    {
        try {
            return $this->repository->exists($field, $value);
        } catch (Exception $e) {
            Log::error("Service error checking existence: {$e->getMessage()}", [
                'service' => get_class($this),
                'field' => $field,
                'value' => $value,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function orderBy(string $column, string $direction = 'asc'): Model
    {
        try {
            return $this->repository->orderBy($column, $direction);
        } catch (Exception $e) {
            Log::error("Service error ordering records: {$e->getMessage()}", [
                'service' => get_class($this),
                'column' => $column,
                'direction' => $direction,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function whereBetweenDates(string $column, string $startDate, string $endDate): Model
    {
        try {
            return $this->repository->whereBetweenDates($column, $startDate, $endDate);
        } catch (Exception $e) {
            Log::error("Service error filtering dates: {$e->getMessage()}", [
                'service' => get_class($this),
                'column' => $column,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function chunk(int $amount, callable $callback): bool
    {
        try {
            return $this->repository->chunk($amount, $callback);
        } catch (Exception $e) {
            Log::error("Service error chunking records: {$e->getMessage()}", [
                'service' => get_class($this),
                'amount' => $amount,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function insertMany(array $data): bool
    {
        try {
            return $this->repository->insertMany($data);
        } catch (Exception $e) {
            Log::error("Service error inserting many records: {$e->getMessage()}", [
                'service' => get_class($this),
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function firstOrCreate(array $criteria, array $data): Model
    {
        try {
            return $this->repository->firstOrCreate($criteria, $data);
        } catch (Exception $e) {
            Log::error("Service error in firstOrCreate: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function updateOrCreate(array $criteria, array $data): Model
    {
        try {
            $model = $this->repository->findWhereFirst($criteria);

            if ($model) {
                $this->repository->update($model->id, array_merge($criteria, $data));

                return $model->fresh();
            }

            return $this->repository->create(array_merge($criteria, $data));
        } catch (Exception $e) {
            Log::error("Service error in updateOrCreate: {$e->getMessage()}", [
                'service' => get_class($this),
                'criteria' => $criteria,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function transaction(callable $callback): mixed
    {
        try {
            return DB::transaction($callback);
        } catch (Exception $e) {
            Log::error("Service error in transaction: {$e->getMessage()}", [
                'service' => get_class($this),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    public function authorize(string $ability, $model = null): bool
    {
        try {
            return auth()->user()->can($ability, $model);
        } catch (Exception $e) {
            Log::error("Service error in authorize: {$e->getMessage()}", [
                'service' => get_class($this),
                'ability' => $ability,
                'model' => $model,
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp
     */
    abstract public function getModelForPolicy(): string;
}
