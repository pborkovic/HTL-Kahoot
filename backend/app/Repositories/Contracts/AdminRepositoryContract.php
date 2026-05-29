<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

/**
 * Contract for the admin infrastructure probes.
 *
 * Cross-domain metric aggregation is composed in AdminService from the
 * per-domain services — this repository only owns the things that are
 * genuinely admin-scoped: liveness checks against backing services.
 */
interface AdminRepositoryContract extends BaseRepositoryContract
{
    /**
     * Run a lightweight query against the default DB connection.
     *
     * @return array{status: 'up'|'down', latency_ms?: float, driver?: string, error?: string}
     */
    public function pingDatabase(): array;

    /**
     * @return array{status: 'up'|'down', latency_ms?: float, error?: string}
     */
    public function pingRedis(): array;

    /**
     * @return array{status: 'up'|'down', driver?: string, pending?: int, failed?: int, error?: string}
     */
    public function inspectQueue(): array;

    /**
     * @return array{status: 'up'|'down', disk?: string, error?: string}
     */
    public function inspectStorage(): array;
}
