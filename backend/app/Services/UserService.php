<?php

namespace App\Services;

use App\Http\Resources\Api\V1\UserCollection;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\RoleServiceContract;
use App\Services\Contracts\UserServiceContract;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class UserService extends BaseService implements UserServiceContract
{
    protected UserRepositoryContract $repository;

    public function __construct(
        UserRepositoryContract $repository,
        private readonly RoleServiceContract $roleService,
    ) {
        $this->repository = $repository;
    }

    public function getModelForPolicy(): string
    {
        return User::class;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function listUsers(array $filters, int $perPage, bool $withTrashed = false): ResourceCollection
    {
        $paginator = $this->repository->getFilteredUsers(
            filters: $filters,
            perPage: $perPage,
            withTrashed: $withTrashed,
        );

        return new UserCollection($paginator);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getClasses(): Collection
    {
        return $this->repository->getClassesWithStudentCounts();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getStats(): array
    {
        $userStats = $this->repository->getUserStats();
        $byRole = $this->roleService->getUserCountsByRole();

        return array_merge($userStats, ['by_role' => $byRole]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function bulkImport(array $users, string $defaultProvider, string $assignedBy): array
    {
        $created = 0;
        $skipped = 0;
        $errors  = [];

        $this->repository->wrapInTransaction(callback: function () use ($users, $defaultProvider, $assignedBy, &$created, &$skipped, &$errors) {
            foreach ($users as $index => $row) {
                $validator = Validator::make(data: $row, rules: [
                    'email'        => 'required|email',
                    'display_name' => 'nullable|string|max:255',
                    'class_name'   => 'nullable|string|max:20',
                    'role'         => 'required|string|exists:roles,name',
                ]);

                if ($validator->fails()) {
                    $errors[] = [
                        'row'    => $index + 1,
                        'email'  => $row['email'] ?? null,
                        'errors' => $validator->errors()->all(),
                    ];
                    continue;
                }

                if ($this->repository->emailExists(email: $row['email'])) {
                    $skipped++;
                    continue;
                }

                $role = $this->roleService->findWhereFirst(criteria: ['name' => $row['role']]);

                $user = $this->repository->createUser(data: [
                    'email'         => $row['email'],
                    'display_name'  => $row['display_name'] ?? null,
                    'class_name'    => $row['class_name'] ?? null,
                    'auth_provider' => $row['auth_provider'] ?? $defaultProvider,
                    'is_active'     => true,
                ]);

                $this->repository->attachRole(
                    user: $user,
                    roleId: $role->id,
                    assignedBy: $assignedBy,
                );

                $created++;
            }
        });

        return [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createUser(array $data, string $assignedBy): User
    {
        $role = $this->roleService->findWhereFirst(criteria: ['name' => $data['role']]);

        $userData = [
            'email'         => $data['email'],
            'username'      => $data['username'] ?? null,
            'display_name'  => $data['display_name'] ?? null,
            'password_hash' => isset($data['password']) ? password_hash(password: $data['password'], algo: PASSWORD_ARGON2ID) : null,
            'auth_provider' => $data['auth_provider'],
            'class_name'    => $data['class_name'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
        ];

        return $this->repository->createWithRole(
            userData: $userData,
            roleId: $role->id,
            assignedBy: $assignedBy,
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getUser(string $userId): User
    {
        return $this->repository->findWithRoles(userId: $userId);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateUser(User $user, array $data, User $authUser): User
    {
        $isAdmin = $authUser->hasAnyRole(roles: ['admin', 'superadmin']);
        $updateData = [];

        if ($isAdmin) {
            foreach (['email', 'username', 'display_name', 'class_name', 'is_active', 'auth_provider'] as $field) {
                if (array_key_exists(key: $field, array: $data)) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (isset($data['role'])) {
                $role = $this->roleService->findWhereFirst(criteria: ['name' => $data['role']]);

                $this->repository->syncRole(
                    user: $user,
                    roleId: $role->id,
                    assignedBy: $authUser->id,
                );
            }

            if (isset($data['is_active']) && !$data['is_active']) {
                $this->repository->deleteTokens(user: $user);
            }
        } else {
            foreach (['display_name', 'username'] as $field) {
                if (array_key_exists(key: $field, array: $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
        }

        return $this->repository->updateUser(
            user: $user,
            data: $updateData
        );
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function deleteUser(User $user, User $authUser): void
    {
        if ($user->id === $authUser->id) {
            throw new RuntimeException(message: 'Cannot delete yourself.');
        }
        if ($user->hasRole(role: 'superadmin')) {
            if ($this->repository->countSuperadmins() <= 1) {
                throw new RuntimeException(message: 'Cannot delete the last superadmin.');
            }
        }

        $this->repository->softDelete(user: $user);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function restoreUser(User $user): User
    {
        return $this->repository->restoreUser(user: $user);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function changePassword(User $user, array $data, bool $isSelf): void
    {
        if ($user->auth_provider !== 'local') {
            throw new RuntimeException(message: 'Password change not available for this auth provider.');
        }
        if ($isSelf && !password_verify(password: $data['current_password'], hash: $user->password_hash)) {
            throw new RuntimeException(message: 'Current password is incorrect.');
        }

        $this->repository->updatePasswordHash(
            user: $user,
            passwordHash: password_hash(password: $data['new_password'], algo: PASSWORD_ARGON2ID),
        );

        $this->repository->deleteTokens(user: $user);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getCompletedQuizzesCount(string $userId): array
    {
        return [
            'completed_quizzes' => $this->repository->countFinishedParticipations(userId: $userId),
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getAnswerDistribution(string $userId): array
    {
        $participants = $this->repository->getFinishedParticipationsWithResponses(userId: $userId);

        $totalCorrect = 0;
        $totalWrong = 0;
        $totalUnanswered = 0;

        foreach ($participants as $participant) {
            $questionCount = $participant->session->sessionQuestions->count();
            $responses = $participant->responses;

            $totalCorrect += $responses->where(key: 'is_correct', operator: '=', value: true)->count();
            $totalWrong += $responses->where(key: 'is_correct', operator: '=', value: false)->count();
            $totalUnanswered += $questionCount - $responses->count();
        }

        $totalAnswered = $totalCorrect + $totalWrong;
        $correctPercentage = $totalAnswered > 0
            ? round(num: ($totalCorrect / $totalAnswered) * 100, precision: 1)
            : 0;

        return [
            'total_correct'      => $totalCorrect,
            'total_wrong'        => $totalWrong,
            'total_unanswered'   => $totalUnanswered,
            'correct_percentage' => $correctPercentage,
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getQuizHistory(string $userId): array
    {
        $participants = $this->repository->getFinishedParticipationsWithResponses(userId: $userId);

        return $participants->map(callback: function (SessionParticipant $participant) {
            $session = $participant->session;
            $questionCount = $session->sessionQuestions->count();
            $responses = $participant->responses;

            return [
                'session_id'      => $session->id,
                'quiz_id'         => $session->quiz->id,
                'quiz_title'      => $session->quiz->title,
                'total_questions'  => $questionCount,
                'correct_answers'  => $responses->where(key: 'is_correct', operator: '=', value: true)->count(),
                'wrong_answers'    => $responses->where(key: 'is_correct', operator: '=', value: false)->count(),
                'unanswered'       => $questionCount - $responses->count(),
                'total_score'      => $participant->total_score,
                'finished_at'      => $session->finished_at,
            ];
        })->all();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getPreferences(User $user): array
    {
        return $this->repository->getPreferences(user: $user);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updatePreferences(User $user, array $data): array
    {
        return $this->repository->updatePreferences(
            user: $user,
            data: $data
        );
    }
}
