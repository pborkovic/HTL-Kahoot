<?php

namespace App\Services\Base\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Base service interface.
 *
 * This interface defines the contract for all service implementations.
 */
interface BaseServiceContract
{
    /**
     * Retrieve all records from the repository.
     *
     * This method fetches all records from the underlying data source without
     * any filtering or pagination. Use with caution on large datasets as it may
     * cause memory issues. Consider using pagination methods for large collections.
     * Soft-deleted records are excluded if soft deletes are enabled on the model.
     *
     * @return Collection<int, Model> Collection of all model instances
     *
     * @see paginate() For retrieving records in paginated format
     * @see chunk() For processing large datasets in manageable chunks
     */
    public function all(): Collection;

    /**
     * Find a record by its unique identifier.
     *
     * Searches for a single record using its primary key. Returns the model instance
     * if found, or null if no matching record exists. This method does not throw
     * exceptions when the record is not found, making it suitable for cases where
     * the absence of a record is a valid state.
     *
     * @param int|string $id The unique identifier (primary key) of the record to find.
     *                       Accepts both integer and string IDs to support various
     *                       primary key types (auto-increment, UUIDs, etc.)
     *
     * @return Model|null The found model instance with all attributes loaded,
     *                    or null if no record with the given ID exists
     *
     * @see findOrFail() For throwing an exception when record is not found
     * @see findMany() For finding multiple records by their IDs
     */
    public function find(int|string $id): ?Model;

    /**
     * Find a record by its unique identifier or throw an exception.
     *
     * Similar to find(), but throws a ModelNotFoundException if the record
     * does not exist. This is useful in controller methods where you want
     * automatic 404 responses when a resource is not found. The exception
     * is automatically caught by Laravel and converted to a 404 HTTP response.
     *
     * @param int|string $id The unique identifier (primary key) of the record to find.
     *                       Accepts both integer and string IDs to support various
     *                       primary key types
     *
     * @return Model The found model instance with all attributes loaded
     *
     * @throws ModelNotFoundException If no record with the given ID exists in the database
     *
     * @see find() For a non-throwing version that returns null
     */
    public function findOrFail(int|string $id): Model;

    /**
     * Retrieve the first record from the repository.
     *
     * Returns the first record according to the default ordering (usually by
     * primary key or created_at timestamp). Returns null if no records exist.
     * This method is useful when you need a single record without specific criteria.
     * Can be combined with orderBy() to get the first record in a custom order.
     *
     * @return Model|null The first model instance according to current query ordering,
     *                    or null if the repository is empty
     *
     * @see findWhereFirst() For finding the first record matching specific criteria
     * @see firstOrCreate() For retrieving or creating a record
     */
    public function first(): ?Model;

    /**
     * Create a new record in the repository.
     *
     * Validates and persists a new record to the database. Mass assignment
     * protection rules defined in the model's $fillable or $guarded properties
     * will be applied. Timestamps (created_at, updated_at) are automatically
     * managed if enabled on the model. Model events (creating, created, etc.)
     * will be fired during the creation process.
     *
     * @param array<string, mixed> $data Associative array of field names and values
     *                                   to populate the new record. Keys must match
     *                                   database column names and be allowed by the
     *                                   model's fillable attributes.
     *
     * @return Model The newly created and persisted model instance with all attributes
     *               including auto-generated fields (id, timestamps, default values, etc.)
     *
     * @throws \Illuminate\Database\QueryException If database constraints are violated
     *                                              (unique, foreign key, etc.)
     * @throws \Illuminate\Validation\ValidationException If validation rules fail (if implemented)
     * @throws \Illuminate\Database\Eloquent\MassAssignmentException If attempting to fill
     *                                                                 non-fillable attributes
     *
     * @see createMany() For creating multiple records at once
     * @see firstOrCreate() For creating only if a record doesn't exist
     * @see insertMany() For bulk insert without model events
     * @see updateOrCreate() For creating or updating based on criteria
     */
    public function create(array $data): Model;

    /**
     * Update an existing record by its identifier.
     *
     * Finds the record by its primary key and updates it with the provided data.
     * Only the fields present in the $data array will be updated; other fields
     * remain unchanged. The updated_at timestamp is automatically updated if
     * timestamps are enabled on the model. Model events (updating, updated, etc.)
     * will be fired during the update process. Mass assignment protection rules apply.
     *
     * @param int|string $id The unique identifier of the record to update. Accepts
     *                       both integer and string IDs to support various primary key types.
     * @param array<string, mixed> $data Associative array of field names and their new values.
     *                                   Keys must match database column names and be allowed
     *                                   by the model's fillable attributes.
     *
     * @return Model The updated model instance with fresh data from the database,
     *               including the new updated_at timestamp
     *
     * @throws ModelNotFoundException If no record with the given ID exists
     * @throws \Illuminate\Database\QueryException If database constraints are violated
     * @throws \Illuminate\Database\Eloquent\MassAssignmentException If attempting to update
     *                                                                 non-fillable attributes
     *
     * @see updateWhere() For updating multiple records matching criteria
     * @see updateOrCreate() For updating or creating based on criteria
     */
    public function update(int|string $id, array $data): Model;

    /**
     * Delete a record by its identifier.
     *
     * Removes the specified record from the database. If the model uses soft deletes,
     * the record will be marked as deleted (deleted_at timestamp set) rather than
     * physically removed from the database. Returns true if the deletion was successful,
     * false if it failed, and null if the record was not found. Model events (deleting,
     * deleted) will be fired if the record exists.
     *
     * @param int|string $id The unique identifier of the record to delete. Accepts
     *                       both integer and string IDs to support various primary key types.
     *
     * @return bool|null True if the record was successfully deleted,
     *                   false if the deletion operation failed,
     *                   null if the record doesn't exist
     *
     * @see deleteWhere() For deleting multiple records matching criteria
     */
    public function delete(int|string $id): ?bool;

    /**
     * Find records matching the given criteria.
     *
     * Retrieves all records where the specified fields match the provided values.
     * This method uses exact matching (WHERE field = value) for all criteria.
     * Multiple criteria are combined with AND logic. Returns an empty collection
     * if no matches are found. This method loads all matching records into memory,
     * so consider using paginateWhere() for large result sets.
     *
     * @param array<string, mixed> $criteria Associative array where keys are field names
     *                                       and values are the values to match. All conditions
     *                                       are combined with AND logic. For exact matching only.
     *
     * @return Collection<int, Model> Collection of matching model instances with all attributes
     *                                 loaded. Returns empty collection if no matches found.
     *
     * @see findWhereFirst() For retrieving only the first matching record
     * @see paginateWhere() For paginated results with criteria
     * @see getTotalRecordsWhere() For counting matches without loading records
     */
    public function findWhere(array $criteria): Collection;

    /**
     * Find the first record matching the given criteria.
     *
     * Similar to findWhere(), but returns only the first matching record instead
     * of a collection. Returns null if no records match the criteria. This is
     * more efficient than findWhere() when you only need one result, as it adds
     * a LIMIT 1 clause to the query. Criteria are combined with AND logic using
     * exact matching.
     *
     * @param array<string, mixed> $criteria Associative array where keys are field names
     *                                       and values are the values to match. All conditions
     *                                       are combined with AND logic.
     *
     * @return Model|null The first matching model instance with all attributes loaded,
     *                    or null if no match found
     *
     * @see findWhere() For retrieving all matching records
     * @see firstOrCreate() For creating a record if none is found
     * @see first() For getting the first record without criteria
     */
    public function findWhereFirst(array $criteria): ?Model;

    /**
     * Retrieve paginated records with optional filtering, relationships, and ordering.
     *
     * This is the most comprehensive query method in the repository, supporting pagination
     * with customizable per-page counts, column selection, eager loading of relationships,
     * WHERE conditions, and custom ordering. Ideal for building data tables, lists, and
     * API endpoints that require server-side pagination.
     *
     * The method returns a LengthAwarePaginator instance which includes:
     * - The current page of items
     * - Total number of items across all pages
     * - Number of items per page
     * - Current page number
     * - Links for pagination navigation (first, last, next, previous)
     * - Methods for generating pagination URLs
     *
     * @param int $perPage Number of records to display per page. Default is 15.
     *                     Use smaller values (10-25) for detailed views, larger values
     *                     (50-100) for compact lists.
     * @param array<int, string> $columns Array of column names to select. Use ['*'] to select
     *                                     all columns (default), or specify exact columns to
     *                                     optimize query performance and reduce memory usage.
     * @param array<int, string> $relations Array of relationship names to eager load using
     *                                       Eloquent's with() method. Prevents N+1 query problems.
     *                                       Supports nested relations with dot notation (e.g.,
     *                                       'posts.comments.author').
     * @param array<string, mixed> $where Associative array of field => value pairs for filtering.
     *                                    All conditions are combined with AND logic using exact
     *                                    matching. Leave empty for no filtering.
     * @param string $orderBy Column name to order results by. Default is 'created_at'.
     *                        Common values include 'id', 'name', 'created_at', 'updated_at'.
     * @param string $orderDir Order direction: 'asc' for ascending (A-Z, 0-9, oldest-newest)
     *                         or 'desc' for descending (Z-A, 9-0, newest-oldest). Default is 'desc'.
     *
     * @return LengthAwarePaginator Paginator instance containing the current page's results
     *                               and complete pagination metadata. Access items via iteration
     *                               or the items() method.
     *
     * @see paginateWhere() For simpler pagination with just criteria
     * @see all() For retrieving all records without pagination
     * @see chunk() For processing records in batches without pagination UI
     */
    public function paginate(
        int $perPage = 15,
        array $columns = ['*'],
        array $relations = [],
        array $where = [],
        string $orderBy = 'created_at',
        string $orderDir = 'desc'
    ): LengthAwarePaginator;

    /**
     * Get the total number of records in the repository.
     *
     * Returns a count of all records without loading them into memory. This is
     * significantly more efficient than calling all()->count() as it performs a
     * COUNT(*) query at the database level. Soft-deleted records are excluded if
     * soft deletes are enabled on the model. Useful for dashboard statistics,
     * analytics, and determining if pagination is necessary.
     *
     * @return int Total count of records in the repository. Returns 0 if the
     *             repository is empty.
     *
     * @see getTotalRecordsWhere() For counting records matching specific criteria
     * @see exists() For checking if any records exist with a specific field value
     */
    public function getTotalRecords(): int;

    /**
     * Get the total number of records matching the given criteria.
     *
     * Returns a count of records that match the specified conditions without
     * loading them into memory. Performs a COUNT(*) query with WHERE clauses at
     * the database level for optimal performance. All criteria are combined with
     * AND logic. Useful for displaying filtered counts, statistics, and
     * implementing "showing X of Y results" functionality.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs to match.
     *                                       All conditions are combined with AND logic using
     *                                       exact matching.
     *
     * @return int Count of records matching the criteria. Returns 0 if no matches found.
     *
     * @see getTotalRecords() For counting all records without criteria
     * @see exists() For checking existence of a single field value
     * @see findWhere() For retrieving the actual matching records
     */
    public function getTotalRecordsWhere(array $criteria): int;

    /**
     * Find multiple records by their identifiers.
     *
     * Retrieves a collection of records matching the provided array of primary keys.
     * This is more efficient than calling find() in a loop as it performs a single
     * query with a WHERE IN clause. Records are returned in the order found in the
     * database (usually by primary key), not necessarily in the order of the provided
     * IDs. If some IDs don't exist, they are silently skipped and not included in the
     * result collection.
     *
     * @param array<int, int|string> $ids Array of unique identifiers (primary keys) to find.
     *                                    Can contain both integer and string IDs depending on
     *                                    the model's primary key type. Duplicate IDs in the
     *                                    input array will not result in duplicate records.
     *
     * @return Collection<int, Model> Collection of found model instances with all attributes loaded.
     *                                 May contain fewer items than IDs provided if some IDs don't
     *                                 exist. Returns empty collection if no IDs match.
     *
     * @see find() For finding a single record
     * @see findWhere() For finding records by field criteria
     */
    public function findMany(array $ids): Collection;

    /**
     * Retrieve paginated records matching the given criteria.
     *
     * Simplified pagination method that filters results based on the provided criteria.
     * Uses the repository's default per-page setting (usually 15) unless explicitly specified.
     * This is a convenience method for common use cases where you need filtered, paginated
     * results without the complexity of the full paginate() method. All criteria are
     * combined with AND logic.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs for filtering.
     *                                       All conditions are combined with AND logic using exact
     *                                       matching. Leave empty to paginate all records.
     * @param int|null $perPage Number of records per page. If null, uses the repository's
     *                          default setting (typically 15). Common values are 10, 15, 20, 25.
     *
     * @return LengthAwarePaginator Paginator instance with matching records and pagination metadata
     *
     * @see paginate() For more advanced pagination options (relations, columns, custom ordering)
     * @see findWhere() For retrieving all matching records without pagination
     * @see getTotalRecordsWhere() For just counting matches
     */
    public function paginateWhere(array $criteria, ?int $perPage = null): LengthAwarePaginator;

    /**
     * Create multiple records in a single operation.
     *
     * Efficiently creates multiple model instances, typically within a database transaction.
     * Each array element represents one record to be created. Unlike insertMany(), this method
     * fires model events (creating, created, etc.) for each record and returns fully hydrated
     * model instances with all timestamps and auto-generated fields populated. Mass assignment
     * protection rules apply to each record.
     *
     * Note: This method creates records one-by-one internally to fire events and populate
     * model instances, so for very large datasets (1000+ records), consider using insertMany()
     * for significantly better performance at the cost of bypassing model events.
     *
     * @param array<int, array<string, mixed>> $data Array of associative arrays, each representing
     *                                               a record to create. Each sub-array must have
     *                                               keys matching database column names that are
     *                                               allowed by the model's fillable attributes.
     *
     * @return Collection<int, Model> Collection of newly created model instances with all
     *                                 attributes including auto-generated IDs and timestamps
     *
     * @throws \Illuminate\Database\QueryException If any database constraints are violated
     * @throws \Illuminate\Database\Eloquent\MassAssignmentException If attempting to fill
     *                                                                 non-fillable attributes
     *
     * @see create() For creating a single record
     * @see insertMany() For bulk insert without model events (faster for large datasets)
     * @see transaction() For wrapping multiple operations in a transaction
     */
    public function createMany(array $data): Collection;

    /**
     * Update records matching the given criteria.
     *
     * Updates all records that match the specified conditions with the provided data.
     * This is a bulk update operation that executes a single UPDATE query with WHERE
     * clauses. Model events (updating, updated) are NOT fired for individual records,
     * and the updated_at timestamp may not be automatically updated depending on the
     * implementation. Use with caution as it bypasses model observers, mutators, and
     * the typical Eloquent update lifecycle.
     *
     * All criteria are combined with AND logic. Only fields specified in $data are updated;
     * other fields remain unchanged. This method does not return the updated records, only
     * a boolean indicating success or failure.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to identify records to update. All conditions
     *                                       are combined with AND logic. Empty array will
     *                                       update all records (use with extreme caution).
     * @param array<string, mixed> $data Associative array of field => value pairs
     *                                   containing the new values to set
     *
     * @return bool True if one or more records were updated successfully,
     *              false if no matching records were found or if the update failed
     *
     * @see update() For updating a single record with full model event firing
     * @see updateOrCreate() For updating or creating based on criteria
     */
    public function updateWhere(array $criteria, array $data): bool;

    /**
     * Delete records matching the given criteria.
     *
     * Removes all records that match the specified conditions. If the model uses soft deletes,
     * records will be marked as deleted (deleted_at timestamp set) rather than physically
     * removed from the database. This is a bulk delete operation that may not fire individual
     * model events (deleting, deleted) depending on the implementation.
     *
     * All criteria are combined with AND logic. Use with extreme caution, especially with
     * empty criteria arrays which would delete all records in the repository.
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to identify records to delete. All conditions
     *                                       are combined with AND logic. Empty array will
     *                                       delete all records (use with extreme caution).
     *
     * @return bool True if one or more records were deleted successfully,
     *              false if no matching records were found or if the deletion failed
     *
     * @see delete() For deleting a single record by ID with model events
     */
    public function deleteWhere(array $criteria): bool;

    /**
     * Set which columns to select in the query.
     *
     * Specifies which columns should be retrieved from the database in subsequent queries.
     * This is useful for optimizing queries by only loading the data you need, reducing
     * memory usage and improving performance, especially for models with many columns or
     * large text/blob fields. This method is chainable and affects the next query executed
     * on this repository instance.
     *
     * Note: The primary key is typically selected automatically even if not specified.
     * Selecting specific columns may affect relationship loading and model functionality
     * that depends on certain fields being present.
     *
     * @param array<int, string> $columns Array of column names to select. Use specific column
     *                                    names like ['id', 'name', 'email'] to optimize queries.
     *                                    Use ['*'] to select all columns (default behavior).
     *
     * @return Model The repository instance for method chaining, allowing subsequent
     *               method calls like where(), orderBy(), or get()
     *
     * @see with() For eager loading relationships
     * @see paginate() Which includes a columns parameter
     */
    public function select(array $columns): Model;

    /**
     * Eager load relationships for the query.
     *
     * Specifies which model relationships should be loaded along with the main query
     * to avoid the N+1 query problem. This method significantly improves performance
     * when accessing related models by loading them in a single additional query per
     * relationship instead of querying for each record individually. Supports dot notation
     * for nested relationships. This method is chainable and affects the next query executed.
     *
     * Eager loading is essential for performance when iterating over a collection and
     * accessing relationships. Without it, each relationship access triggers a new database
     * query, which can quickly become a performance bottleneck.
     *
     * @param array<int, string> $relations Array of relationship names to eager load.
     *                                      Use simple names for direct relationships (e.g., 'posts').
     *                                      Use dot notation for nested relations (e.g., 'posts.comments').
     *                                      Can load multiple relationship trees (e.g., ['posts.comments',
     *                                      'posts.author', 'roles']).
     *
     * @return Model The repository instance for method chaining, allowing subsequent
     *               method calls like where(), orderBy(), or get()
     *
     * @see select() For choosing which columns to load
     * @see paginate() Which includes a relations parameter
     */
    public function with(array $relations): Model;

    /**
     * Check if a record exists with the given field value.
     *
     * Performs an efficient existence check without loading the full model or any of its
     * attributes into memory. Executes a SELECT EXISTS query at the database level, which
     * is optimized and returns immediately upon finding the first match. Returns true if
     * at least one record exists where the specified field matches the given value, false
     * otherwise. This is significantly more performant than retrieving the record and
     * checking for null.
     *
     * Useful for validation (checking if email/username is taken), conditional logic,
     * and preventing duplicate records. Only checks for exact matches.
     *
     * @param string $field The field name to check (e.g., 'email', 'username', 'slug').
     *                      Should be a column that exists in the database table.
     * @param mixed $value The value to search for. Will be matched exactly using the = operator.
     *                     Type should match the database column type for proper comparison.
     *
     * @return bool True if at least one matching record exists, false if no matches found
     *
     * @see find() For retrieving a record by ID if it exists
     * @see findWhereFirst() For checking multiple criteria and potentially retrieving the record
     */
    public function exists(string $field, $value): bool;

    /**
     * Order query results by a specific column.
     *
     * Adds an ORDER BY clause to the query, sorting results by the specified column
     * in ascending or descending order. This method is chainable and can be called
     * multiple times to establish multi-level sorting (first by column A, then by
     * column B, etc.). Must be called before a retrieval method (all(), first(), get())
     * to take effect. Subsequent queries will maintain this ordering until reset.
     *
     * @param string $column The name of the column to order by. Must be a valid column
     *                       name in the database table. Common examples: 'created_at',
     *                       'name', 'price', 'updated_at', 'position'.
     * @param string $direction The sort direction. Use 'asc' for ascending order
     *                          (A-Z, 0-9, oldest-newest, lowest-highest) or 'desc'
     *                          for descending order (Z-A, 9-0, newest-oldest, highest-lowest).
     *                          Default is 'asc'.
     *
     * @return Model The repository instance for method chaining, allowing subsequent
     *               method calls like where(), with(), or get()
     *
     * @see paginate() Which includes orderBy and orderDir parameters
     * @see whereBetweenDates() For date range filtering
     */
    public function orderBy(string $column, string $direction = 'asc'): Model;

    /**
     * Filter records where a date column falls within a date range.
     *
     * Adds a WHERE BETWEEN clause for date filtering, retrieving only records where the
     * specified date column falls within the inclusive range [startDate, endDate]. Both
     * the start and end dates are included in the results. This method is chainable and
     * can be combined with other query methods. Supports various date formats including
     * Y-m-d, Y-m-d H:i:s, timestamps, and Carbon instances.
     *
     * Commonly used for filtering records by creation date, publication date, event dates,
     * or any temporal data. The comparison handles time components properly, so be mindful
     * of whether your dates include time or are just dates.
     *
     * @param string $column The name of the date/datetime column to filter on. Must be
     *                       a valid column in the database table. Common examples:
     *                       'created_at', 'published_at', 'start_date', 'birth_date'.
     * @param string $startDate The start date of the range (inclusive). Can be formatted
     *                          as Y-m-d, Y-m-d H:i:s, or any format parseable by Carbon/PHP.
     *                          For date-only columns, use Y-m-d format.
     * @param string $endDate The end date of the range (inclusive). Can be formatted
     *                        as Y-m-d, Y-m-d H:i:s, or any format parseable by Carbon/PHP.
     *                        For date-only columns, use Y-m-d format.
     *
     * @return Model The repository instance for method chaining, allowing subsequent
     *               method calls like orderBy(), with(), or get()
     *
     * @see orderBy() For sorting date-based results
     * @see paginate() For combining date filtering with pagination
     */
    public function whereBetweenDates(string $column, string $startDate, string $endDate): Model;

    /**
     * Process records in chunks to optimize memory usage.
     *
     * Retrieves and processes records in manageable batches rather than loading all
     * records into memory at once. This is essential for processing large datasets
     * (thousands or millions of records) without exhausting available memory. The
     * provided callback function is executed for each chunk, receiving a Collection
     * of models as its parameter.
     *
     * Processing stops if the callback explicitly returns false (strict comparison).
     * Otherwise, continues through all chunks until all records have been processed.
     * This is ideal for batch operations like sending emails, generating reports,
     * data migrations, or any operation that needs to process all records sequentially.
     *
     * Important: Do not modify the chunked table's records within the callback in a way
     * that affects the ordering or the WHERE conditions, as this may cause records to be
     * skipped or processed multiple times due to the pagination mechanism used internally.
     *
     * @param int $amount Number of records to process in each chunk. Choose based on
     *                    available memory and processing needs. Common values: 100 for
     *                    memory-intensive operations, 500-1000 for typical batch processing,
     *                    up to 5000 for simple, low-memory operations.
     * @param callable $callback Function to execute for each chunk. Receives a Collection
     *                           of models as its parameter. Can optionally return false to
     *                           stop processing early. Signature: function(Collection $models): bool|void
     *
     * @return bool True if all chunks were processed successfully (or callback never returned false),
     *              false if processing was stopped early by the callback returning false explicitly
     *
     * @see all() For loading all records (use only for small datasets)
     * @see paginate() For user-facing pagination with UI
     */
    public function chunk(int $amount, callable $callback): bool;

    /**
     * Insert multiple records efficiently without model events.
     *
     * Performs a bulk insert operation directly at the database level using a single INSERT
     * query, bypassing Eloquent's model layer entirely. This provides maximum performance for
     * inserting large numbers of records but comes with significant tradeoffs: no model events
     * fired (creating, created, saving, saved), no mutators or accessors applied, no automatic
     * timestamp management, and no auto-generated IDs returned in the result.
     *
     * This method is ideal for:
     * - Importing large datasets (thousands to millions of records)
     * - Seeding databases
     * - Batch operations where performance is critical
     * - Cases where model events and timestamps are not needed
     *
     * Do not use this method when:
     * - You need the IDs of inserted records
     * - Model events/observers must execute (audit logging, cache invalidation, etc.)
     * - Automatic timestamp management is required
     * - Model mutators need to process data before insertion
     *
     * Note: All arrays in the $data parameter must have the same keys (columns) to ensure
     * a valid bulk insert. Different keys will cause a database error.
     *
     * @param array<int, array<string, mixed>> $data Array of associative arrays, each representing
     *                                               a record to insert. All arrays must have identical
     *                                               keys matching database column names. Values are
     *                                               inserted as-is without processing.
     *
     * @return bool True if the insert was successful and records were added to the database,
     *              false if the insertion failed
     *
     * @throws \Illuminate\Database\QueryException If database constraints are violated (unique keys,
     *                                              foreign keys, not null constraints, etc.)
     *
     * @see createMany() For smaller datasets where you need model events and returned instances
     * @see create() For inserting a single record with full model lifecycle
     */
    public function insertMany(array $data): bool;

    /**
     * Retrieve the first record matching criteria or create it if it doesn't exist.
     *
     * Attempts to find a record matching the specified criteria. If found, returns that
     * existing record. If not found, creates a new record using both the criteria and the
     * additional data provided, then returns it. This is an atomic "get or create" operation
     * useful for ensuring a record exists before proceeding with business logic.
     *
     * The criteria array serves dual purpose: it's used for the WHERE clause when searching,
     * and its key-value pairs are also included when creating a new record. The additional
     * data array is only used during creation, not for searching.
     *
     * Common use cases:
     * - Ensuring a settings/configuration record exists for each user
     * - Creating default records on first access
     * - Implementing "get or create" patterns in business logic
     * - Preventing duplicate record creation in concurrent scenarios
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to search for. These fields will also be included
     *                                       when creating a new record if none is found.
     * @param array<string, mixed> $data Additional data to include only when creating
     *                                   a new record. Not used in the search query. Can include
     *                                   default values, timestamps, or computed fields.
     *
     * @return Model Either the found existing model instance or the newly created model instance.
     *               Both cases return a fully hydrated model with all attributes.
     *
     * @see findWhereFirst() For just finding without creating
     * @see create() For always creating a new record
     * @see updateOrCreate() For updating existing records or creating if not found
     */
    public function firstOrCreate(array $criteria, array $data): Model;

    /**
     * Create or update a record based on given criteria.
     *
     * Attempts to find a record matching the specified criteria. If found, updates that
     * record with the provided data. If not found, creates a new record using both the
     * criteria and data. This is an atomic "upsert" operation useful for synchronization
     * tasks, idempotent operations, and ensuring data consistency.
     *
     * The criteria array is used only for searching (WHERE clause). When creating a new
     * record, both criteria and data arrays are merged. When updating an existing record,
     * only the data array is applied (criteria values remain unchanged).
     *
     * Common use cases:
     * - Synchronizing data from external sources
     * - Idempotent API endpoints that can be called multiple times safely
     * - Batch updates where records may or may not exist yet
     * - Maintaining reference data that should be kept up-to-date
     *
     * @param array<string, mixed> $criteria Associative array of field => value pairs
     *                                       to search for. Used only for finding the record,
     *                                       not for updating it.
     * @param array<string, mixed> $data Data to update (if record exists) or to include
     *                                   when creating (if record doesn't exist). When creating,
     *                                   this is merged with criteria.
     *
     * @return Model Either the updated existing model or the newly created model.
     *               Both cases return a fully hydrated model with all current attributes.
     *
     * @see firstOrCreate() For creating without updating existing records
     * @see update() For updating a specific record by ID
     * @see updateWhere() For bulk updates without creation
     */
    public function updateOrCreate(array $criteria, array $data): Model;

    /**
     * Perform a database transaction.
     *
     * Executes the provided callback within a database transaction, ensuring atomicity
     * of multiple database operations. If all operations succeed, the transaction is
     * automatically committed. If any exception is thrown within the callback, the
     * transaction is automatically rolled back, and the exception is re-thrown.
     *
     * Transactions are essential for maintaining data consistency when multiple related
     * operations must all succeed or all fail together. This prevents partial updates
     * that could leave the database in an inconsistent state.
     *
     * The callback can return a value which will be returned by this method after a
     * successful commit. If an exception occurs, the database state is rolled back to
     * before the transaction began.
     *
     * Important: Be cautious with long-running operations inside transactions as they
     * hold database locks. Keep transactions focused and efficient.
     *
     * @param callable $callback The function containing database operations to execute
     *                           within the transaction. Receives no parameters. Any
     *                           return value is passed through after successful commit.
     *                           Signature: function(): mixed
     *
     * @return mixed The value returned by the callback after successful transaction commit
     *
     * @throws \Throwable Any exception thrown within the callback. The transaction will be
     *                    rolled back before the exception is re-thrown.
     *
     * @see createMany() For atomic creation of multiple records
     */
    public function transaction(callable $callback): mixed;

    /**
     * Check if the current user is authorized to perform an action.
     *
     * Performs an authorization check using Laravel's Gate and Policy system to determine
     * if the currently authenticated user is authorized to perform a specific ability
     * (action) on a given model or resource. This integrates with Laravel's authorization
     * layer to enforce access control rules defined in policies.
     *
     * Returns true if authorized, false if not. This method does not throw exceptions,
     * making it suitable for conditional rendering and optional features. For enforcement
     * that should halt execution, use Laravel's authorize() method directly which throws
     * authorization exceptions.
     *
     * The authorization logic is determined by:
     * 1. Policy methods defined for the model
     * 2. Gate definitions in AuthServiceProvider
     * 3. Any before/after hooks in policies
     *
     * @param string $ability The ability/action to check authorization for. Common abilities
     *                        include 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'.
     *                        Custom abilities can be defined in policies (e.g., 'publish', 'approve').
     * @param mixed $model The model instance to check authorization against. Can be a specific
     *                     model instance for instance-level checks, a model class string for
     *                     class-level checks, or null for general ability checks.
     *
     * @return bool True if the current user is authorized to perform the ability on the model,
     *              false if not authorized or if no user is authenticated
     *
     * @see getModelForPolicy() For getting the model class used in policy checks
     */
    public function authorize(string $ability, $model = null): bool;

    /**
     * Get the model class name for policy checks.
     *
     * Returns the fully qualified class name of the Eloquent model that this repository
     * manages. This is used by Laravel's authorization system to determine which policy
     * class to use when performing authorization checks. The model class name is typically
     * used for class-level policy checks and for resolving the appropriate policy.
     *
     * This method enables the repository to integrate seamlessly with Laravel's Gate and
     * Policy system by providing the model type information needed for authorization.
     *
     * @return string The fully qualified class name of the model (e.g., 'App\Models\User',
     *                'App\Models\Post'). Should always return the same model class that
     *                the repository is designed to work with.
     *
     * @see authorize() For performing authorization checks using this model class
     */
    public function getModelForPolicy(): string;
}
