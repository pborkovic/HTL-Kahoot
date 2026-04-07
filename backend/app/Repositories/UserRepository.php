<?php

namespace App\Repositories;

use App\DTOs\EntraUserDto;
use App\Filters\UserFilter;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->where(column: 'email', operator: '=', value: $email)
            ->first();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByExternalId(string $externalId): ?User
    {
        return $this->model
            ->where(column: 'external_id', operator: '=', value: $externalId)
            ->first();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateFromEntra(User $user, EntraUserDto $entraDto): User
    {
        $attributes = [
            'email'         => $entraDto->email,
            'username'      => $entraDto->displayName,
            'display_name'  => $entraDto->displayName,
            'class_name'    => $entraDto->className,
            'last_login_at' => now(),
        ];

        if ($entraDto->avatarUrl !== null) {
            $attributes['avatar_url'] = $entraDto->avatarUrl;
        }

        $user->update(attributes: $attributes);

        return $user->fresh();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createFromEntra(EntraUserDto $entraDto): User
    {
        $attributes = [
            'external_id'   => $entraDto->externalId,
            'email'         => $entraDto->email,
            'username'      => $entraDto->displayName,
            'display_name'  => $entraDto->displayName,
            'class_name'    => $entraDto->className,
            'auth_provider' => 'azure',
            'last_login_at' => now(),
        ];

        if ($entraDto->avatarUrl !== null) {
            $attributes['avatar_url'] = $entraDto->avatarUrl;
        }

        return $this->model->create(attributes: $attributes);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getFilteredUsers(array $filters, int $perPage, bool $withTrashed = false): LengthAwarePaginator
    {
        $query = $this->model->query()->with(relations: 'roles');

        if ($withTrashed) {
            $query->withTrashed();
        }

        (new UserFilter())->apply(query: $query, filters: $filters);

        return $query->paginate(perPage: $perPage);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getClassesWithStudentCounts(): Collection
    {
        return $this->model->query()
            ->whereHas(relation: 'roles', callback: fn($q) => $q->where(column: 'name', operator: '=', value: 'student'))
            ->whereNotNull(columns: 'class_name')
            ->selectRaw(expression: 'class_name, COUNT(*) as student_count')
            ->groupBy(groups: 'class_name')
            ->orderBy(column: 'class_name')
            ->get();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getUserStats(): array
    {
        $byAuthProvider = $this->model
            ->selectRaw(expression: 'auth_provider, COUNT(*) as count')
            ->groupBy(groups: 'auth_provider')
            ->pluck(value: 'count', key: 'auth_provider');

        return [
            'total_users'        => $this->model->count(),
            'active_users'       => $this->model->where(column: 'is_active', operator: '=', value: true)->count(),
            'by_auth_provider'   => $byAuthProvider,
            'recent_signups_30d' => $this->model->where(column: 'created_at', operator: '>=', value: now()->subDays(value: 30))->count(),
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createWithRole(array $userData, string $roleId, string $assignedBy): User
    {
        $user = $this->model->create(attributes: $userData);

        $user->roles()->attach(id: $roleId, attributes: [
            'assigned_at' => now(),
            'assigned_by' => $assignedBy,
        ]);

        $user->load(relations: 'roles');

        return $user;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createUser(array $data): User
    {
        return $this->model->create(attributes: $data);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function attachRole(User $user, string $roleId, string $assignedBy): void
    {
        $user->roles()->attach(ids: $roleId, attributes: [
            'assigned_at' => now(),
            'assigned_by' => $assignedBy,
        ]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function emailExists(string $email): bool
    {
        return $this->model->where(column: 'email', operator: '=', value: $email)
            ->exists();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function wrapInTransaction(callable $callback): mixed
    {
        return DB::transaction(callback: $callback);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updateUser(User $user, array $data): User
    {
        if (!empty($data)) {
            $user->update(attributes: $data);
        }

        return $user->fresh()->load(relations: 'roles');
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function syncRole(User $user, string $roleId, string $assignedBy): void
    {
        $user->roles()->sync(ids: [$roleId => [
            'assigned_at' => now(),
            'assigned_by' => $assignedBy,
        ]]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function deleteTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function softDelete(User $user): void
    {
        $user->delete();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function restoreUser(User $user): User
    {
        $user->restore();
        $user->load(relations: 'roles');

        return $user;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countSuperadmins(): int
    {
        return $this->model
            ->whereHas(relation: 'roles', callback: fn($q) => $q->where(column: 'name', operator: '=', value: 'superadmin'))
            ->count();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updatePasswordHash(User $user, string $passwordHash): void
    {
        $user->update(attributes: ['password_hash' => $passwordHash]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findWithRoles(string $userId): User
    {
        return $this->model->with(relations: 'roles')
            ->findOrFail(id: $userId);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function countFinishedParticipations(string $userId): int
    {
        return SessionParticipant::where(column: 'user_id', operator: '=', value: $userId)
            ->whereHas(relation: 'session', callback: fn($q) => $q->where(column: 'status', operator: '=', value: 'finished'))
            ->count();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getFinishedParticipationsWithResponses(string $userId): Collection
    {
        return SessionParticipant::where(column: 'user_id', operator: '=', value: $userId)
            ->whereHas(relation: 'session', callback: fn($q) => $q->where(column: 'status', operator: '=', value: 'finished'))
            ->with(relations: [
                'session.quiz',
                'session.sessionQuestions',
                'responses',
            ])
            ->get();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function getPreferences(User $user): array
    {
        return $user->preferences ?? [];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function updatePreferences(User $user, array $data): array
    {
        $merged = array_merge($user->preferences ?? [], $data);

        $user->update(attributes: ['preferences' => $merged]);

        return $user->fresh()->preferences;
    }
}
