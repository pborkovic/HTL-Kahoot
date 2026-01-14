<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Base Repository Interface
 *
 * Defines the contract for all repository implementations, providing a standardized
 * abstraction layer for data access operations. This interface promotes the Repository
 * Pattern, separating business logic from data access logic and making the codebase
 * more maintainable, testable, and flexible.
 *
 * All repository implementations must adhere to this contract to ensure consistency
 * across the application's data layer.
 *
 * @package App\Repositories\Contracts
 */
interface BaseRepositoryContract
{

    /**
     * Retrieve all records from the repository.
     *
     * This method fetches all records from the underlying data source without
     * any filtering or pagination. Use with caution on large datasets as it may
     * cause memory issues. Consider using pagination methods for large collections.
     *
     * @see paginate() For retrieving records in paginated format
     * @see chunk() For processing large datasets in manageable chunks
     *
     * @return Collection<int, Model>|array<int, Model> Collection of all model instances
     */
    public function all(): mixed;

    /**
     * Find a record by its unique identifier or throw an exception.
     *
     * Similar to find(), but throws a ModelNotFoundException if the record
     * does not exist. This is useful in controller methods where you want
     * automatic 404 responses when a resource is not found.
     *
     * @param string $id The unique identifier (primary key) of the record to find
     *
     * @throws ModelNotFoundException If no record with the given ID exists
     *
     * @see find() For a non-throwing version that returns null
     *
     * @return Model The found model instance
     */
    public function findOrFail(string $id): mixed;

    /**
     * Find a record by its unique identifier.
     *
     * Searches for a single record using its primary key. Returns the model instance
     * if found, or null if no matching record exists. This method does not throw
     * exceptions when the record is not found.
     *
     * @param string $id The unique identifier (primary key) of the record to find
     *
     * @see findOrFail() For throwing an exception when record is not found
     * @see findMany() For finding multiple records by their IDs
     *
     * @return Model|null The found model instance, or null if not found
     */
    public function find(string $id): mixed;

    /**
     * Retrieve the first record from the repository.
     *
     * Returns the first record according to the default ordering (usually by
     * primary key or created_at timestamp). Returns null if no records exist.
     * This method is useful when you need a single record without specific criteria.
     *
     * @see findWhereFirst() For finding the first record matching specific criteria
     * @see firstOrCreate() For retrieving or creating a record
     *
     * @return Model|null The first model instance, or null if the repository is empty
     */
    public function first(): mixed;

    /**
     * Create a new record in the repository.
     *
     * Validates and persists a new record to the database. Mass assignment
     * protection rules defined in the model will be applied. Timestamps
     * (created_at, updated_at) are automatically managed if enabled on the model.
     *
     * @param array<string, mixed> $data Associative array of field names and values
     *                                   to populate the new record
     *
     * @throws \Illuminate\Database\QueryException If database constraints are violated
     * @throws \Illuminate\Validation\ValidationException If validation rules fail (if implemented)
     *
     * @see createMany() For creating multiple records at once
     * @see firstOrCreate() For creating only if a record doesn't exist
     * @see insertMany() For bulk insert without model events
     */
    public function create(array $data): mixed;

    /**
     * Update an existing record by its identifier.
     *
     * Finds the record by its primary key and updates it with the provided data.
     * Only the fields present in the $data array will be updated; other fields
     * remain unchanged. The updated_at timestamp is automatically updated if
     * timestamps are enabled on the model.
     *
     * @param string               $id The unique identifier of the record to update
     * @param array<string, mixed> $data Associative array of field names and their new values
     *
     * @return Model The updated model instance with fresh data from the database
     *
     * @throws ModelNotFoundException If no record with the given ID exists
     * @throws \Illuminate\Database\QueryException If database constraints are violated
     *
     * @see updateWhere() For updating multiple records matching criteria
     */
    public function update(string $id, array $data): Model;

    /**
     * Delete a record by its identifier.
     *
     * Removes the specified record from the database. If the model uses soft deletes,
     * the record will be marked as deleted rather than physically removed. Returns
     * true if the deletion was successful, false if it failed, and null if the
     * record was not found.
     *
     * @param string $id The unique identifier of the record to delete
     *
     * @return bool|null True if successfully deleted, false if deletion failed,
     *                   null if the record doesn't exist
     *
     * @see deleteWhere() For deleting multiple records matching criteria
     */
    public function delete(string $id): ?bool;

    /**
     * Find records matching the given criteria.
     *
     * Retrieves all records where the specified fields match the provided values.
     * This method uses exact matching (WHERE field = value) for all criteria.
     * Multiple criteria are combined with AND logic.
     *
     * @param array<string, mixed> $criteria Associative array where keys are field names
     *                                       and values are the values to match
     *
     * @return Collection<int, Model>|array<int, Model> Collection of matching model instances,
     *                                                   empty collection if no matches found
     *
     * @see findWhereFirst() For retrieving only the first matching record
     * @see paginateWhere() For paginated results with criteria
     */
    public function findWhere(array $criteria): mixed;

    /**
     * Find the first record matching the given criteria.
     *
     * Similar to findWhere(), but returns only the first matching record instead
     * of a collection. Returns null if no records match the criteria. This is
     * more efficient than findWhere() when you only need one result.
     *
     * @param array<string, mixed> $criteria Associative array where keys are field names
     *                                       and values are the values to match
     *
     * @return Model|null The first matching model instance, or null if no match found
     *
     * @see findWhere() For retrieving all matching records
     * @see firstOrCreate() For creating a record if none is found
     */
    public function findWhereFirst(array $criteria): mixed;

    /**
     * Retrieve paginated records with optional filtering, relationships, and ordering.
     *
     * This is the most comprehensive query method, supporting pagination with customizable
     * per-page counts, column selection, eager loading of relationships, WHERE conditions,
     * and custom ordering. Ideal for building data tables, lists, and API endpoints.
     *
     * The method returns a LengthAwarePaginator instance which includes:
     * - The current page of items
     * - Total number of items
     * - Number of items per page
     * - Current page number
     * - Links for pagination navigation
     *
     * @param int                  $perPage Number of records to display per page (default: 15)
     * @param array<int, string>   $columns Array of column names to select (default: ['*'] for all columns)
     * @param array<int, string>   $relations Array of relationship names to eager load
     *                                      (e.g., ['posts', 'comments.author'])
     * @param array<string, mixed> $where Associative array of field => value pairs for filtering
     *                                    (combined with AND logic)
     * @param string               $orderBy Column name to order results by (default: 'created_at')
     * @param string               $orderDir Order direction: 'asc' for ascending, 'desc' for descending
     *                         (default: 'desc')
     *
     * @return LengthAwarePaginator Paginator instance containing the results and pagination metadata
     *
     * @see paginateWhere() For simpler pagination with just criteria
     * @see all() For retrieving all records without pagination
     */
    public function paginate(
        int    $perPage = 15,
        array  $columns = ['*'],
        array  $relations = [],
        array  $where = [],
        string $orderBy = 'created_at',
        string $orderDir = 'desc'
    ): LengthAwarePaginator;

    /**
     * Get the total number of records in the repository.
     *
     * Returns a count of all records without loading them into memory. This is
     * more efficient than calling all()->count() as it performs a COUNT query
     * at the database level. Soft-deleted records are excluded if soft deletes
     * are enabled on the model.
     *
     * @return int Total count of records in the repository
     *
     * @see getTotalRecordsWhere() For counting records matching specific criteria
     */
    public function getTotalRecords(): int;

    /**
     * Get the total number of records matching the given criteria.
     *
     * Returns a count of records that match the specified conditions without
     * loading them into memory. Performs a COUNT query with WHERE clauses at
     * the database level for optimal performance.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs to match
     *
     * @return int Count of records matching the criteria
     *
     * @see getTotalRecords() For counting all records
     */
    public function getTotalRecordsWhere(array $criteria): int;

    /**
     * Find multiple records by their identifiers.
     *
     * Retrieves a collection of records matching the provided array of primary keys.
     * This is more efficient than calling find() in a loop as it performs a single
     * query with a WHERE IN clause. Records are returned in the order found in the
     * database, not necessarily in the order of the provided IDs.
     *
     * @param array<int, string> $ids Array of unique identifiers (primary keys) to find
     *
     * @return Collection<int, Model>|array<int, Model> Collection of found model instances
     *                                                   (may contain fewer items than IDs provided
     *                                                   if some IDs don't exist)
     *
     * @see find() For finding a single record
     */
    public function findMany(array $ids): mixed;

    /**
     * Retrieve paginated records matching the given criteria.
     *
     * Simplified pagination method that filters results based on the provided criteria.
     * Uses the repository's default per-page setting unless explicitly specified.
     * This is a convenience method for common use cases where you need filtered,
     * paginated results without complex options.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs for filtering
     * @param int|null             $perPage Number of records per page, or null to use default setting
     *
     * @return LengthAwarePaginator|Collection<int, Model> Paginator instance with matching records
     *
     * @see paginate() For more advanced pagination options
     * @see findWhere() For retrieving all matching records without pagination
     */
    public function paginateWhere(array $criteria, ?int $perPage = null): mixed;

    /**
     * Create multiple records in a single operation.
     *
     * Efficiently creates multiple model instances in one transaction. Each array
     * element represents one record to be created. Unlike insertMany(), this method
     * fires model events (creating, created, etc.) for each record and returns
     * fully hydrated model instances with all timestamps and auto-generated fields.
     *
     * Note: This method creates records one-by-one internally, so for very large
     * datasets (1000+ records), consider using insertMany() for better performance.
     *
     * @param array<int, array<string, mixed>> $data Array of associative arrays, each representing
     *                                               a record to create
     *
     * @return Collection<int, Model>|array<int, Model> Collection of newly created model instances
     *
     * @throws \Illuminate\Database\QueryException If any database constraints are violated
     *
     * @see create() For creating a single record
     * @see insertMany() For bulk insert without model events (faster for large datasets)
     */
    public function createMany(array $data): mixed;

    /**
     * Update records matching the given criteria.
     *
     * Updates all records that match the specified conditions with the provided data.
     * This is a bulk update operation that does not fire model events or update the
     * updated_at timestamp individually for each record (though the database may update
     * updated_at via triggers if configured). Use with caution as it bypasses model
     * observers and mutators.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to identify records to update
     * @param array<string, mixed> $data Associative array of field => value pairs
     *                                   containing the new values
     *
     * @return bool True if one or more records were updated, false if no matching records
     *              were found or if the update failed
     *
     * @see update() For updating a single record with full model event firing
     */
    public function updateWhere(array $criteria, array $data): bool;

    /**
     * Delete records matching the given criteria.
     *
     * Removes all records that match the specified conditions. If the model uses
     * soft deletes, records will be marked as deleted rather than physically removed.
     * This is a bulk delete operation that may not fire individual model events
     * depending on the implementation.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to identify records to delete
     *
     * @return bool True if one or more records were deleted, false if no matching
     *              records were found or if the deletion failed
     *
     * @see delete() For deleting a single record by ID
     */
    public function deleteWhere(array $criteria): bool;

    /**
     * Set which columns to select in the query.
     *
     * Specifies which columns should be retrieved from the database. This is useful
     * for optimizing queries by only loading the data you need, reducing memory usage
     * and improving performance. This method is chainable and should be called before
     * executing a retrieval method.
     *
     * @param array<int, string> $columns Array of column names to select
     *                                    (e.g., ['id', 'name', 'email'])
     *
     * @return $this The repository instance for method chaining
     *
     * @see with() For eager loading relationships
     */
    public function select(array $columns): mixed;

    /**
     * Eager load relationships for the query.
     *
     * Specifies which model relationships should be loaded along with the main query
     * to avoid the N+1 query problem. Supports dot notation for nested relationships.
     * This method is chainable and significantly improves performance when accessing
     * related models.
     *
     * @param array<int, string> $relations Array of relationship names to eager load.
     *                                      Supports nested relations with dot notation
     *                                      (e.g., ['posts', 'posts.comments', 'roles'])
     *
     * @return $this The repository instance for method chaining
     *
     * @see select() For choosing which columns to load
     */
    public function with(array $relations): mixed;

    /**
     * Check if a record exists with the given field value.
     *
     * Performs an efficient existence check without loading the full model into memory.
     * Returns true if at least one record exists where the specified field matches
     * the given value, false otherwise. This is more performant than retrieving
     * the record and checking for null.
     *
     * @param string $field The field name to check (e.g., 'email', 'username')
     * @param mixed  $value The value to search for
     *
     * @return bool True if a matching record exists, false otherwise
     *
     * @see find() For retrieving a record if it exists
     */
    public function exists(string $field, $value): bool;

    /**
     * Order query results by a specific column.
     *
     * Adds an ORDER BY clause to the query, sorting results by the specified column
     * in ascending or descending order. This method is chainable and can be called
     * multiple times to add secondary sort columns. Must be called before a retrieval
     * method to take effect.
     *
     * @param string $column The name of the column to order by (e.g., 'created_at', 'name')
     * @param string $direction The sort direction: 'asc' for ascending (A-Z, 0-9, oldest-newest)
     *                          or 'desc' for descending (Z-A, 9-0, newest-oldest)
     *                          Default: 'asc'
     *
     * @return $this The repository instance for method chaining
     *
     * @see paginate() Which includes orderBy parameters
     */
    public function orderBy(string $column, string $direction = 'asc'): mixed;

    /**
     * Filter records where a date column falls within a date range.
     *
     * Adds a WHERE BETWEEN clause for date filtering, retrieving records where the
     * specified date column falls within the inclusive range [startDate, endDate].
     * Supports various date formats including Y-m-d, timestamps, and Carbon instances.
     * This method is chainable and can be combined with other query methods.
     *
     * @param string $column The name of the date/datetime column to filter on
     *                       (e.g., 'created_at', 'published_at', 'date_of_birth')
     * @param string $startDate The start date of the range (inclusive), formatted as Y-m-d
     *                          or any format parseable by Carbon
     * @param string $endDate The end date of the range (inclusive), formatted as Y-m-d
     *                        or any format parseable by Carbon
     *
     * @return $this The repository instance for method chaining
     *
     * @see orderBy() For sorting date-based results
     */
    public function whereBetweenDates(string $column, string $startDate, string $endDate): mixed;

    /**
     * Process records in chunks to optimize memory usage.
     *
     * Retrieves and processes records in manageable batches rather than loading all
     * records into memory at once. This is essential for processing large datasets
     * (thousands or millions of records) without exhausting available memory. The
     * provided callback function is executed for each chunk.
     *
     * The callback receives a Collection of models for each chunk. Processing stops
     * if the callback returns false explicitly (strict comparison), otherwise continues
     * through all chunks.
     *
     * Note: Do not modify the chunked table's records within the callback in a way
     * that affects the ordering, as this may cause records to be skipped or processed
     * multiple times.
     *
     * @param int      $amount Number of records to process in each chunk (e.g., 100, 500, 1000)
     * @param callable $callback Function to execute for each chunk. Receives a Collection
     *                           of models as its parameter. Return false to stop processing.
     *                           Signature: function(Collection $models): bool|void
     *
     * @return bool True if all chunks were processed successfully, false if processing
     *              was stopped early by the callback returning false
     *
     * @see all() For loading all records (use only for small datasets)
     */
    public function chunk(int $amount, callable $callback): bool;

    /**
     * Insert multiple records efficiently without model events.
     *
     * Performs a bulk insert operation directly at the database level, bypassing
     * Eloquent's model events, mutators, and automatic timestamp management. This
     * is significantly faster than createMany() for large datasets but comes with
     * tradeoffs: no created_at/updated_at timestamps, no model events fired, and
     * no auto-generated IDs returned.
     *
     * Use this method when:
     * - Inserting thousands of records where performance is critical
     * - You don't need model events or observers to fire
     * - Timestamps can be manually managed or are not required
     *
     * Do not use this method when:
     * - You need the IDs of inserted records
     * - Model events/observers must execute
     * - Automatic timestamps are required
     *
     * @param array<int, array<string, mixed>> $data Array of associative arrays, each
     *                                               representing a record to insert.
     *                                               All arrays must have the same keys.
     *
     * @return bool True if the insert was successful, false otherwise
     *
     * @throws \Illuminate\Database\QueryException If database constraints are violated
     *
     * @see createMany() For smaller datasets where you need model events and returned instances
     */
    public function insertMany(array $data): bool;

    /**
     * Retrieve the first record matching criteria or create it if it doesn't exist.
     *
     * Searches for a record matching the specified criteria. If found, returns that
     * record. If not found, creates a new record using both the criteria and the
     * additional data provided. This is an atomic operation useful for ensuring a
     * record exists before proceeding.
     *
     * The criteria array is used for both the search WHERE clause and as part of
     * the data when creating. The additional data array is only used for creation.
     *
     * Common use cases:
     * - Ensuring a settings record exists for a user
     * - Creating default configurations
     * - Implementing "get or create" patterns
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to search for. These will also be included
     *                                       when creating a new record.
     * @param array<string, mixed> $data Additional data to include only when creating
     *                                   a new record (not used in the search)
     *
     * @return Model The found or newly created model instance
     *
     * @see findWhereFirst() For just finding without creating
     * @see create() For always creating a new record
     */
    public function firstOrCreate(array $criteria, array $data): mixed;
}
