<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\AdminRepositoryContract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Repository housing infrastructure probes used by the admin dashboard.
 *
 * No domain aggregation lives here — those queries are owned by the
 * respective per-model repositories and composed in AdminService.
 * The `User` model is passed to BaseRepository only to satisfy its
 * constructor; it is not used by any method in this class.
 */
class AdminRepository extends BaseRepository implements AdminRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function pingDatabase(): array
    {
        $start = microtime(as_float: true);
        try {
            DB::select(query: 'SELECT 1');

            return [
                'status' => 'up',
                'latency_ms' => round(num: (microtime(as_float: true) - $start) * 1000, precision: 2),
                'driver' => (string) config(key: 'database.default'),
            ];
        } catch (Throwable $e) {
            return ['status' => 'down', 'error' => $e->getMessage()];
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function pingRedis(): array
    {
        $start = microtime(as_float: true);
        try {
            $pong = Redis::connection()->ping();

            return [
                'status' => $pong ? 'up' : 'down',
                'latency_ms' => round(num: (microtime(as_float: true) - $start) * 1000, precision: 2),
            ];
        } catch (Throwable $e) {
            return ['status' => 'down', 'error' => $e->getMessage()];
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function inspectQueue(): array
    {
        try {
            $pending = (int) Redis::connection()->llen(key: 'queues:default');
            $failed = (int) DB::table(table: 'failed_jobs')->count();

            return [
                'status' => 'up',
                'driver' => (string) config(key: 'queue.default'),
                'pending' => $pending,
                'failed' => $failed,
            ];
        } catch (Throwable $e) {
            return ['status' => 'down', 'error' => $e->getMessage()];
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function inspectStorage(): array
    {
        try {
            $disk = (string) config(key: 'filesystems.default');
            Storage::disk(name: $disk)->files(directory: '/');

            return [
                'status' => 'up',
                'disk' => $disk,
            ];
        } catch (Throwable $e) {
            return ['status' => 'down', 'error' => $e->getMessage()];
        }
    }
}
