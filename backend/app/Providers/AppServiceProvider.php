<?php

namespace App\Providers;

use App\Models\Permission;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\Quiz;
use App\Models\Role;
use App\Models\Session;
use App\Models\User;
use App\Policies\PermissionPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\QuestionPoolPolicy;
use App\Policies\QuizPolicy;
use App\Policies\RolePolicy;
use App\Policies\SessionPolicy;
use App\Policies\UserPolicy;
use App\Repositories\Contracts\PermissionRepositoryContract;
use App\Repositories\Contracts\QuestionRepositoryContract;
use App\Repositories\Contracts\RoleRepositoryContract;
use App\Repositories\Contracts\ResponseRepositoryContract;
use App\Repositories\Contracts\SessionParticipantRepositoryContract;
use App\Repositories\Contracts\SessionQuestionRepositoryContract;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Repositories\PermissionRepository;
use App\Repositories\QuestionRepository;
use App\Repositories\ResponseRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SessionParticipantRepository;
use App\Repositories\SessionQuestionRepository;
use App\Repositories\SessionRepository;
use App\Repositories\UserRepository;
use App\Services\AnswerEvaluationService;
use App\Services\AuthService;
use App\Services\Contracts\AnswerEvaluationServiceContract;
use App\Services\Contracts\AuthServiceContract;
use App\Services\Contracts\PermissionServiceContract;
use App\Services\Contracts\RoleServiceContract;
use App\Services\Contracts\SessionServiceContract;
use App\Services\Contracts\MediaServiceContract;
use App\Services\Contracts\MicrosoftGraphServiceContract;
use App\Services\Contracts\QuestionImportServiceContract;
use App\Services\Contracts\QuestionServiceContract;
use App\Services\Contracts\ResponseServiceContract;
use App\Services\Contracts\SessionParticipantServiceContract;
use App\Services\Contracts\SessionQuestionServiceContract;
use App\Services\Contracts\UserServiceContract;
use App\Services\MediaService;
use App\Services\MicrosoftGraphService;
use App\Services\PermissionService;
use App\Services\QuestionImportService;
use App\Services\QuestionService;
use App\Services\ResponseService;
use App\Services\RoleService;
use App\Services\SessionParticipantService;
use App\Services\SessionQuestionService;
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
        $this->app->bind(
            abstract: QuestionServiceContract::class,
            concrete: QuestionService::class
        );
        $this->app->bind(
            abstract: QuestionImportServiceContract::class,
            concrete: QuestionImportService::class
        );
        $this->app->bind(
            abstract: MediaServiceContract::class,
            concrete: MediaService::class
        );
        $this->app->bind(
            abstract: MicrosoftGraphServiceContract::class,
            concrete: MicrosoftGraphService::class
        );
        $this->app->bind(
            abstract: ResponseServiceContract::class,
            concrete: ResponseService::class
        );
        $this->app->bind(
            abstract: SessionParticipantServiceContract::class,
            concrete: SessionParticipantService::class
        );
        $this->app->bind(
            abstract: SessionQuestionServiceContract::class,
            concrete: SessionQuestionService::class
        );
        $this->app->bind(
            abstract: AnswerEvaluationServiceContract::class,
            concrete: AnswerEvaluationService::class
        );
    }

    public function boot(): void
    {
        Event::listen(
            events: SocialiteWasCalled::class,
            listener: AzureExtendSocialite::class . '@handle'
        );

        Gate::policy(
            class: User::class,
            policy: UserPolicy::class
        );
        Gate::policy(
            class: Question::class,
            policy: QuestionPolicy::class
        );
        Gate::policy(
            class: Quiz::class,
            policy: QuizPolicy::class
        );
        Gate::policy(
            class: QuestionPool::class,
            policy: QuestionPoolPolicy::class
        );
        Gate::policy(
            class: Session::class,
            policy: SessionPolicy::class
        );
        Gate::policy(
            class: Role::class,
            policy: RolePolicy::class
        );
        Gate::policy(
            class: Permission::class,
            policy: PermissionPolicy::class
        );
    }
}
