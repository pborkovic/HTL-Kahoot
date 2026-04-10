<?php

declare(strict_types=1);

namespace App\Repositories\Base;

use App\Repositories\Contracts\BaseRepositoryContract;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Base repository implementation.
 *
 * This class provides the implementation for the BaseRepositoryContract
 * and serves as the base class for all concrete repositories.
 */
abstract class BaseRepository implements BaseRepositoryContract
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Apply an associative criteria array as WHERE clauses on a query builder.
     *
     * Supports both simple equality (`['field' => value]`) and
     * operator syntax (`['field' => ['>', 10]]`).
     *
     * @param  Builder  $query  The query builder instance.
     * @param  array<string, mixed>  $criteria  The criteria to apply.
     * @return Builder The query with criteria applied.
     *
     * @author Philipp Borkovic
     */
    protected function applyCriteria(Builder $query, array $criteria): Builder
    {
        foreach ($criteria as $field => $value) {
            if (is_array($value)) {
                [$operator, $val] = $value;
                $query->where($field, $operator, $val);
            } else {
                $query->where($field, $value);
            }
        }

        return $query;
    }

    /**
     * Build a logging context array with the model class included.
     *
     * @param  array<string, mixed>  $extra  Additional context entries.
     * @return array<string, mixed> The merged context.
     *
     * @author Philipp Borkovic
     */
    protected function logContext(array $extra = []): array
    {
        return array_merge(['model' => get_class(object: $this->model)], $extra);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function all(): Collection
    {
        try {
            return $this->model->all();
        } catch (Exception $e) {
            Log::error("Error fetching all records: {$e->getMessage()}", $this->logContext([
                'trace' => $e->getTraceAsString(),
            ]));

            return collect();
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function find(string $id): ?Model
    {
        try {
            return $this->model->find($id);
        } catch (Exception $e) {
            Log::error("Error finding record by ID: {$e->getMessage()}", $this->logContext([
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]));

            return null;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findOrFail(string $id): Model
    {
        try {
            return $this->model->findOrFail($id);
        } catch (ModelNotFoundException $e) {
            Log::warning("Record not found: {$e->getMessage()}", $this->logContext([
                'id' => $id,
            ]));

            throw $e;
        } catch (Exception $e) {
            Log::error("Error finding record by ID: {$e->getMessage()}", $this->logContext([
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function first(): ?Model
    {
        try {
            return $this->model->first();
        } catch (Exception $e) {
            Log::error("Error fetching first record: {$e->getMessage()}", $this->logContext([
                'trace' => $e->getTraceAsString(),
            ]));

            return null;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function create(array $data): Model
    {
        try {
            return $this->model->create($data);
        } catch (Exception $e) {
            Log::error("Error creating record: {$e->getMessage()}", $this->logContext([
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function update(string $id, array $data): Model
    {
        try {
            $model = $this->findOrFail($id);
            $model->update($data);

            return $model->fresh();
        } catch (Exception $e) {
            Log::error("Error updating record: {$e->getMessage()}", $this->logContext([
                'id' => $id,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function delete(string $id): ?bool
    {
        try {
            $model = $this->findOrFail($id);

            return $model->delete();
        } catch (ModelNotFoundException $e) {
            Log::warning("Record to delete not found: {$e->getMessage()}", $this->logContext([
                'id' => $id,
            ]));

            return false;
        } catch (Exception $e) {
            Log::error("Error deleting record: {$e->getMessage()}", $this->logContext([
                'id' => $id,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /* ── Criteria-based queries ─────────────────────────────── */

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findWhere(array $criteria): Collection
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->get();
        } catch (Exception $e) {
            Log::error("Error finding records by criteria: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]));

            return collect();
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findWhereFirst(array $criteria): ?Model
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->first();
        } catch (Exception $e) {
            Log::error("Error finding first record by criteria: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]));

            return null;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getTotalRecordsWhere(array $criteria): int
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->count();
        } catch (Exception $e) {
            Log::error("Error getting total records with criteria: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]));

            return 0;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function paginateWhere(array $criteria, ?int $perPage = null): LengthAwarePaginator
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->paginate($perPage ?? 15);
        } catch (Exception $e) {
            Log::error("Error paginating records with criteria: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function updateWhere(array $criteria, array $data): bool
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->update($data) > 0;
        } catch (Exception $e) {
            Log::error("Error updating records where: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function deleteWhere(array $criteria): bool
    {
        try {
            $query = $this->applyCriteria(query: $this->model->query(), criteria: $criteria);

            return $query->delete() > 0;
        } catch (Exception $e) {
            Log::error("Error deleting records where: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     *
     * @see BaseRepository::paginate() method from the previous implementation
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
            $query = $this->applyCriteria(
                query: $this->model->select($columns)->with($relations),
                criteria: $where,
            );

            return $query->orderBy($orderBy, $orderDir)->paginate($perPage);
        } catch (Exception $e) {
            Log::error("Error paginating records: {$e->getMessage()}", $this->logContext([
                'where' => $where,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getTotalRecords(): int
    {
        try {
            return $this->model->count();
        } catch (Exception $e) {
            Log::error("Error getting total records: {$e->getMessage()}", $this->logContext([
                'trace' => $e->getTraceAsString(),
            ]));

            return 0;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function findMany(array $ids): Collection
    {
        try {
            return $this->model->findMany($ids);
        } catch (Exception $e) {
            Log::error("Error finding many records: {$e->getMessage()}", $this->logContext([
                'ids' => $ids,
                'trace' => $e->getTraceAsString(),
            ]));

            return collect();
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createMany(array $data): Collection
    {
        try {
            return $this->model->insert($data);
        } catch (Exception $e) {
            Log::error("Error creating many records: {$e->getMessage()}", $this->logContext([
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function insertMany(array $data): bool
    {
        try {
            return $this->model->insert($data);
        } catch (Exception $e) {
            Log::error("Error inserting many records: {$e->getMessage()}", $this->logContext([
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function select(array $columns): Model
    {
        try {
            return $this->model->select($columns);
        } catch (Exception $e) {
            Log::error("Error selecting columns: {$e->getMessage()}", $this->logContext([
                'columns' => $columns,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function with(array $relations): Builder
    {
        try {
            return $this->model->with($relations);
        } catch (Exception $e) {
            Log::error("Error loading relations: {$e->getMessage()}", $this->logContext([
                'relations' => $relations,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function exists(string $field, $value): bool
    {
        try {
            return $this->model->where($field, $value)->exists();
        } catch (Exception $e) {
            Log::error("Error checking existence: {$e->getMessage()}", $this->logContext([
                'field' => $field,
                'value' => $value,
                'trace' => $e->getTraceAsString(),
            ]));

            return false;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function orderBy(string $column, string $direction = 'asc'): Model
    {
        try {
            return $this->model->orderBy($column, $direction);
        } catch (Exception $e) {
            Log::error("Error ordering records: {$e->getMessage()}", $this->logContext([
                'column' => $column,
                'direction' => $direction,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function whereBetweenDates(string $column, string $startDate, string $endDate): Model
    {
        try {
            return $this->model->whereBetween($column, [$startDate, $endDate]);
        } catch (Exception $e) {
            Log::error("Error filtering dates: {$e->getMessage()}", $this->logContext([
                'column' => $column,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function chunk(int $amount, callable $callback): bool
    {
        try {
            return $this->model->chunk($amount, $callback);
        } catch (Exception $e) {
            Log::error("Error chunking records: {$e->getMessage()}", $this->logContext([
                'amount' => $amount,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function firstOrCreate(array $criteria, array $data): Model
    {
        try {
            return $this->model->firstOrCreate($criteria, $data);
        } catch (Exception $e) {
            Log::error("Error in firstOrCreate: {$e->getMessage()}", $this->logContext([
                'criteria' => $criteria,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]));

            throw $e;
        }
    }
}
