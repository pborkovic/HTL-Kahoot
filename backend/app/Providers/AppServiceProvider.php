<?php

namespace App\Providers;

use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\Quiz;
use App\Policies\QuestionPolicy;
use App\Policies\QuestionPoolPolicy;
use App\Policies\QuizPolicy;
use App\Repositories\Contracts\PermissionRepositoryContract;
use App\Repositories\Contracts\RoleRepositoryContract;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Repositories\PermissionRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Services\Contracts\AuthServiceContract;
use App\Services\Contracts\PermissionServiceContract;
use App\Services\Contracts\RoleServiceContract;
use App\Services\Contracts\SessionServiceContract;
use App\Services\Contracts\UserServiceContract;
use App\Services\PermissionService;
use App\Services\RoleService;
use App\Services\SessionService;
use App\Services\UserService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Azure\AzureExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repositories
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

        // Services
        $this->app->bind(
            abstract: AuthServiceContract::class,
            concrete: AuthService::class
        );
        $this->app->bind(
            abstract: UserServiceContract::class,
            concrete: UserService::class
        );
        $this->app->bind(
            abstract: RoleServiceContract::class,
            concrete: RoleService::class
        );
        $this->app->bind(
            abstract: PermissionServiceContract::class,
            concrete: PermissionService::class
        );
        $this->app->bind(
            abstract: SessionServiceContract::class,
            concrete: SessionService::class
        );
    }

    public function boot(): void
    {
        Event::listen(
            SocialiteWasCalled::class,
            AzureExtendSocialite::class . '@handle'
        );

        Gate::policy(Question::class, QuestionPolicy::class);
        Gate::policy(Quiz::class, QuizPolicy::class);
        Gate::policy(QuestionPool::class, QuestionPoolPolicy::class);
    }
}
