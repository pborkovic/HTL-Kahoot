<?php

namespace App\Repositories;

use App\DTOs\EntraUserDto;
use App\Filters\UserFilter;
use App\Models\Role;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserRepository extends BaseRepository implements UserRepositoryContract
{
    public function __construct(User $model)
    {
        parent::__construct(model: $model);
    }

    public function findByExternalId(string $externalId): ?User
    {
        return $this->model
            ->where(column: 'external_id', operator: '=', value: $externalId)
            ->first();
    }

    public function updateFromEntra(User $user, EntraUserDto $entraDto): User
    {
        $user->update(attributes: [
            'email'         => $entraDto->email,
            'username'      => $entraDto->displayName,
            'last_login_at' => now(),
        ]);

        return $user->fresh();
    }

    public function createFromEntra(EntraUserDto $entraDto): User
    {
        return $this->model->create(attributes: [
            'external_id'   => $entraDto->externalId,
            'email'         => $entraDto->email,
            'username'      => $entraDto->displayName,
            'auth_provider' => 'azure',
            'last_login_at' => now(),
        ]);
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
        $byRole = Role::withCount(relations: 'users')
            ->get()
            ->pluck(value: 'users_count', key: 'name');

        $byAuthProvider = $this->model
            ->selectRaw(expression: 'auth_provider, COUNT(*) as count')
            ->groupBy(groups: 'auth_provider')
            ->pluck(value: 'count', key: 'auth_provider');

        return [
            'total_users'        => $this->model->count(),
            'active_users'       => $this->model->where(column: 'is_active', operator: '=', value: true)->count(),
            'by_role'            => $byRole,
            'by_auth_provider'   => $byAuthProvider,
            'recent_signups_30d' => $this->model->where(column: 'created_at', operator: '>=', value: now()->subDays(value: 30))->count(),
        ];
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createWithRole(array $userData, string $roleName, string $assignedBy): User
    {
        $role = Role::where(column: 'name', operator: '=', value: $roleName)->firstOrFail();

        $user = $this->model->create(attributes: $userData);

        $user->roles()->attach(id: $role->id, attributes: [
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
    public function bulkCreateWithRoles(array $users, string $defaultProvider, string $assignedBy): array
    {
        $created = 0;
        $skipped = 0;
        $errors  = [];

        DB::transaction(callback: function () use ($users, $defaultProvider, $assignedBy, &$created, &$skipped, &$errors) {
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

                if ($this->model->where(column: 'email', operator: '=', value: $row['email'])->exists()) {
                    $skipped++;
                    continue;
                }

                $role = Role::where(column: 'name', operator: '=', value: $row['role'])->first();
                $user = $this->model->create(attributes: [
                    'email'         => $row['email'],
                    'display_name'  => $row['display_name'] ?? null,
                    'class_name'    => $row['class_name'] ?? null,
                    'auth_provider' => $row['auth_provider'] ?? $defaultProvider,
                    'is_active'     => true,
                ]);

                $user->roles()->attach(id: $role->id, attributes: [
                    'assigned_at' => now(),
                    'assigned_by' => $assignedBy,
                ]);

                $created++;
            }
        });

        return ['created' => $created, 'skipped' => $skipped, 'errors' => $errors];
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
    public function syncRole(User $user, string $roleName, string $assignedBy): void
    {
        $role = Role::where(column: 'name', operator: '=', value: $roleName)->firstOrFail();

        $user->roles()->sync(ids: [$role->id => [
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
}
