<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\AdminRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\AdminServiceContract;
use App\Services\Contracts\DepartmentServiceContract;
use App\Services\Contracts\PlatformFeedbackServiceContract;
use App\Services\Contracts\QuestionServiceContract;
use App\Services\Contracts\QuizServiceContract;
use App\Services\Contracts\SessionServiceContract;
use App\Services\Contracts\UserServiceContract;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Orchestrates the superadmin dashboard reports by composing counters
 * from each per-domain service. The admin repository only contributes
 * infrastructure health probes.
 */
class AdminService extends BaseService implements AdminServiceContract
{
    protected AdminRepositoryContract $repository;

    public function __construct(
        private readonly AdminRepositoryContract $repository,
        private readonly UserServiceContract $userService,
        private readonly QuestionServiceContract $questionService,
        private readonly QuizServiceContract $quizService,
        private readonly DepartmentServiceContract $departmentService,
        private readonly SessionServiceContract $sessionService,
        private readonly PlatformFeedbackServiceContract $feedbackService,
    ) {
        $this->repository = $repository;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getModelForPolicy(): string
    {
        return User::class;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function ensureSuperadmin(?User $user): void
    {
        if (! $user || ! $user->hasRole(role: 'superadmin')) {
            throw new AccessDeniedHttpException(message: 'Superadmin role required.');
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function buildSystemReport(): array
    {
        return [
            'app' => [
                'name' => (string) config(key: 'app.name'),
                'env' => (string) config(key: 'app.env'),
                'debug' => (bool) config(key: 'app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'timezone' => (string) config(key: 'app.timezone'),
                'now' => now()->toIso8601String(),
            ],
            'services' => [
                'database' => $this->repository->pingDatabase(),
                'redis' => $this->repository->pingRedis(),
                'queue' => $this->repository->inspectQueue(),
                'storage' => $this->repository->inspectStorage(),
            ],
        ];
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function buildMetricsReport(): array
    {
        return [
            'users' => [
                'total' => $this->userService->countAll(),
                'active' => $this->userService->countActive(),
                'by_role' => $this->userService->countByRole(),
            ],
            'content' => [
                'questions' => $this->questionService->countAll(),
                'questions_published' => $this->questionService->countPublished(),
                'quizzes' => $this->quizService->countAll(),
                'departments' => $this->departmentService->countAll(),
            ],
            'sessions' => [
                'total' => $this->sessionService->countAll(),
                'active' => $this->sessionService->countActive(),
            ],
            'feedback' => [
                'open' => $this->feedbackService->countOpen(),
                'resolved' => $this->feedbackService->countResolved(),
            ],
        ];
    }
}
