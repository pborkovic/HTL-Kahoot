<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\PermissionRepositoryContract;
use App\Repositories\Contracts\PlatformFeedbackRepositoryContract;
use App\Repositories\Contracts\QuestionRepositoryContract;
use App\Repositories\Contracts\ResponseRepositoryContract;
use App\Repositories\Contracts\RoleRepositoryContract;
use App\Repositories\Contracts\SessionParticipantRepositoryContract;
use App\Repositories\Contracts\SessionQuestionRepositoryContract;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Repositories\PermissionRepository;
use App\Repositories\PlatformFeedbackRepository;
use App\Repositories\QuestionRepository;
use App\Repositories\ResponseRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SessionParticipantRepository;
use App\Repositories\SessionQuestionRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds every repository contract to its concrete implementation.
 *
 * @package App\Providers
 */
class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            abstract: UserRepositoryContract::class,
            concrete: UserRepository::class
        );
        $this->app->bind(
            abstract: RoleRepositoryContract::class,
            concrete: RoleRepository::class
        );
        $this->app->bind(
            abstract: PermissionRepositoryContract::class,
            concrete: PermissionRepository::class
        );
        $this->app->bind(
            abstract: SessionRepositoryContract::class,
            concrete: SessionRepository::class
        );
        $this->app->bind(
            abstract: QuestionRepositoryContract::class,
            concrete: QuestionRepository::class
        );
        $this->app->bind(
            abstract: ResponseRepositoryContract::class,
            concrete: ResponseRepository::class
        );
        $this->app->bind(
            abstract: SessionParticipantRepositoryContract::class,
            concrete: SessionParticipantRepository::class
        );
        $this->app->bind(
            abstract: SessionQuestionRepositoryContract::class,
            concrete: SessionQuestionRepository::class
        );
        $this->app->bind(
            abstract: PlatformFeedbackRepositoryContract::class,
            concrete: PlatformFeedbackRepository::class
        );
    }
}
