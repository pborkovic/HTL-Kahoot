<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\User;
use App\Services\Base\Contracts\BaseServiceContract;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

interface AdminServiceContract extends BaseServiceContract
{
    /**
     * Reject the call unless the user has the 'superadmin' role.
     *
     * @throws AccessDeniedHttpException
     */
    public function ensureSuperadmin(?User $user): void;

    /**
     * Build the system health snapshot returned by GET /v1/admin/system.
     *
     * @return array{app: array<string, mixed>, services: array<string, array<string, mixed>>}
     */
    public function buildSystemReport(): array;

    /**
     * Build the platform metrics returned by GET /v1/admin/metrics.
     *
     * @return array{users: array<string, mixed>, content: array<string, int>, sessions: array<string, int>, feedback: array<string, int>}
     */
    public function buildMetricsReport(): array;
}
