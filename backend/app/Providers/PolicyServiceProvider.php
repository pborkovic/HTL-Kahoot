<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Permission;
use App\Models\PlatformFeedback;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\Quiz;
use App\Models\Role;
use App\Models\Session;
use App\Models\User;
use App\Policies\PermissionPolicy;
use App\Policies\PlatformFeedbackPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\QuestionPoolPolicy;
use App\Policies\QuizPolicy;
use App\Policies\RolePolicy;
use App\Policies\SessionPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Registers all model-to-policy mappings used for authorisation gates.
 */
class PolicyServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        User::class => UserPolicy::class,
        Question::class => QuestionPolicy::class,
        Quiz::class => QuizPolicy::class,
        QuestionPool::class => QuestionPoolPolicy::class,
        Session::class => SessionPolicy::class,
        Role::class => RolePolicy::class,
        Permission::class => PermissionPolicy::class,
        PlatformFeedback::class => PlatformFeedbackPolicy::class,
    ];

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy(class: $model, policy: $policy);
        }
    }
}
