<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\UserFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\BulkCreateUsersRequest;
use App\Http\Requests\Api\V1\ChangePasswordRequest;
use App\Http\Requests\Api\V1\CreateUserRequest;
use App\Http\Requests\Api\V1\ListUsersRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserCollection;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(ListUsersRequest $request): UserCollection
    {
        $this->authorize('viewAny', User::class);

        $query = User::query()->with('roles');

        if ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        (new UserFilter())->apply($query, $request->validated());

        $perPage = min((int) $request->input('per_page', 25), 100);

        return new UserCollection($query->paginate($perPage));
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        $user->load('roles');

        return new UserResource($user);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $data = $request->validated();
        $role = Role::where('name', $data['role'])->firstOrFail();

        $user = User::create([
            'email'         => $data['email'],
            'username'      => $data['username'] ?? null,
            'display_name'  => $data['display_name'] ?? null,
            'password_hash' => isset($data['password']) ? password_hash($data['password'], PASSWORD_ARGON2ID) : null,
            'auth_provider' => $data['auth_provider'],
            'class_name'    => $data['class_name'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
        ]);

        $user->roles()->attach($role->id, [
            'assigned_at' => now(),
            'assigned_by' => $request->user()->id,
        ]);

        $user->load('roles');

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);

        $authUser = $request->user();
        $isAdmin  = $authUser->hasAnyRole(['admin', 'superadmin']);
        $data     = $request->validated();

        $updateData = [];

        if ($isAdmin) {
            foreach (['email', 'username', 'display_name', 'class_name', 'is_active', 'auth_provider'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (isset($data['role'])) {
                $role = Role::where('name', $data['role'])->firstOrFail();
                $user->roles()->sync([$role->id => ['assigned_at' => now(), 'assigned_by' => $authUser->id]]);
            }

            if (isset($data['is_active']) && !$data['is_active']) {
                $user->tokens()->delete();
            }
        } else {
            foreach (['display_name', 'username'] as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        $user->load('roles');

        return new UserResource($user->fresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself.'], 422);
        }

        if ($user->hasRole('superadmin')) {
            $count = User::whereHas('roles', fn($q) => $q->where('name', 'superadmin'))->count();
            if ($count <= 1) {
                return response()->json(['message' => 'Cannot delete the last superadmin.'], 422);
            }
        }

        $user->delete();

        return response()->json(null, 204);
    }

    public function restore(User $user): UserResource
    {
        $this->authorize('restore', $user);

        $user->restore();
        $user->load('roles');

        return new UserResource($user);
    }

    public function changePassword(ChangePasswordRequest $request, User $user): JsonResponse
    {
        $this->authorize('changePassword', $user);

        if ($user->auth_provider !== 'local') {
            return response()->json(['message' => 'Password change not available for this auth provider.'], 422);
        }

        $data   = $request->validated();
        $isSelf = $request->user()->id === $user->id;

        if ($isSelf && !password_verify($data['current_password'], $user->password_hash)) {
            return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
        }

        $user->update(['password_hash' => password_hash($data['new_password'], PASSWORD_ARGON2ID)]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function classes(): JsonResponse
    {
        $this->authorize('viewClasses', User::class);

        $classes = User::query()
            ->whereHas('roles', fn($q) => $q->where('name', 'student'))
            ->whereNotNull('class_name')
            ->selectRaw('class_name, COUNT(*) as student_count')
            ->groupBy('class_name')
            ->orderBy('class_name')
            ->get();

        return response()->json(['data' => $classes]);
    }

    public function stats(): JsonResponse
    {
        $this->authorize('viewStats', User::class);

        $byRole = Role::withCount('users')->get()->pluck('users_count', 'name');

        $byAuthProvider = User::selectRaw('auth_provider, COUNT(*) as count')
            ->groupBy('auth_provider')
            ->pluck('count', 'auth_provider');

        return response()->json(['data' => [
            'total_users'        => User::count(),
            'active_users'       => User::where('is_active', true)->count(),
            'by_role'            => $byRole,
            'by_auth_provider'   => $byAuthProvider,
            'recent_signups_30d' => User::where('created_at', '>=', now()->subDays(30))->count(),
        ]]);
    }

    public function bulk(BulkCreateUsersRequest $request): JsonResponse
    {
        $this->authorize('bulkCreate', User::class);

        $created         = 0;
        $skipped         = 0;
        $errors          = [];
        $users           = $request->validated()['users'];
        $defaultProvider = $request->input('default_auth_provider', 'local');

        DB::transaction(function () use ($users, $defaultProvider, $request, &$created, &$skipped, &$errors) {
            foreach ($users as $index => $row) {
                $validator = Validator::make($row, [
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

                if (User::where('email', $row['email'])->exists()) {
                    $skipped++;
                    continue;
                }

                $role = Role::where('name', $row['role'])->first();
                $user = User::create([
                    'email'         => $row['email'],
                    'display_name'  => $row['display_name'] ?? null,
                    'class_name'    => $row['class_name'] ?? null,
                    'auth_provider' => $row['auth_provider'] ?? $defaultProvider,
                    'is_active'     => true,
                ]);

                $user->roles()->attach($role->id, [
                    'assigned_at' => now(),
                    'assigned_by' => $request->user()->id,
                ]);

                $created++;
            }
        });

        return response()->json(['created' => $created, 'skipped' => $skipped, 'errors' => $errors]);
    }
}
