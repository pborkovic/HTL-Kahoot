<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\AnswerEvaluationService;
use App\Services\AuthService;
use App\Services\Contracts\AnswerEvaluationServiceContract;
use App\Services\Contracts\AuthServiceContract;
use App\Services\Contracts\FeedbackModerationServiceContract;
use App\Services\Contracts\MediaServiceContract;
use App\Services\Contracts\MicrosoftGraphServiceContract;
use App\Services\Contracts\PermissionServiceContract;
use App\Services\Contracts\PlatformFeedbackServiceContract;
use App\Services\Contracts\QuestionImportServiceContract;
use App\Services\Contracts\QuestionServiceContract;
use App\Services\Contracts\ResponseServiceContract;
use App\Services\Contracts\RoleServiceContract;
use App\Services\Contracts\SessionParticipantServiceContract;
use App\Services\Contracts\SessionQuestionServiceContract;
use App\Services\Contracts\SessionServiceContract;
use App\Services\Contracts\UserServiceContract;
use App\Services\FeedbackModerationService;
use App\Services\MediaService;
use App\Services\MicrosoftGraphService;
use App\Services\PermissionService;
use App\Services\PlatformFeedbackService;
use App\Services\QuestionImportService;
use App\Services\QuestionService;
use App\Services\ResponseService;
use App\Services\RoleService;
use App\Services\SessionParticipantService;
use App\Services\SessionQuestionService;
use App\Services\SessionService;
use App\Services\UserService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Azure\AzureExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

/**
 * Binds every service contract to its concrete implementation and wires up
 * application-wide event listeners.
 *
 * Repository bindings live in {@see RepositoryServiceProvider} and policy
 * gates in {@see PolicyServiceProvider}.
 */
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
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
        $this->app->bind(
            abstract: FeedbackModerationServiceContract::class,
            concrete: FeedbackModerationService::class
        );
        $this->app->bind(
            abstract: PlatformFeedbackServiceContract::class,
            concrete: PlatformFeedbackService::class
        );
    }

    public function boot(): void
    {
        Event::listen(
            events: SocialiteWasCalled::class,
            listener: AzureExtendSocialite::class.'@handle'
        );
    }
}
