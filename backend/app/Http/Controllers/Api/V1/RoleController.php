<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'data' => $roles->map(fn(Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->map(fn($p) => [
                    'id'   => $p->id,
                    'name' => $p->name,
                ]),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name',
        ]);

        $role = Role::create(['name' => $data['name']]);

        return response()->json([
            'data' => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => [],
            ],
        ], 201);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->permissions()->detach();
        $role->users()->detach();
        $role->delete();

        return response()->json(null, 204);
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role_id' => 'required|string|exists:roles,id',
        ]);

        if ($user->roles()->where('roles.id', $data['role_id'])->exists()) {
            return response()->json(['message' => 'User already has this role.'], 422);
        }

        $user->roles()->attach($data['role_id'], [
            'assigned_at' => now(),
            'assigned_by' => $request->user()->id,
        ]);

        $user->load('roles');

        return response()->json([
            'data' => [
                'id'    => $user->id,
                'roles' => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name]),
            ],
        ]);
    }

    public function removeRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'role_id' => 'required|string|exists:roles,id',
        ]);

        $user->roles()->detach($data['role_id']);
        $user->load('roles');

        return response()->json([
            'data' => [
                'id'    => $user->id,
                'roles' => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name]),
            ],
        ]);
    }

    public function addPermission(Role $role, Request $request): JsonResponse
    {
        $data = $request->validate([
            'permission_id' => 'required|string|exists:permissions,id',
        ]);

        if ($role->permissions()->where('permissions.id', $data['permission_id'])->exists()) {
            return response()->json(['message' => 'Role already has this permission.'], 422);
        }

        $role->permissions()->attach($data['permission_id']);
        $role->load('permissions');

        return response()->json([
            'data' => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->map(fn($p) => ['id' => $p->id, 'name' => $p->name]),
            ],
        ]);
    }

    public function removePermission(Role $role, Request $request): JsonResponse
    {
        $data = $request->validate([
            'permission_id' => 'required|string|exists:permissions,id',
        ]);

        $role->permissions()->detach($data['permission_id']);
        $role->load('permissions');

        return response()->json([
            'data' => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->map(fn($p) => ['id' => $p->id, 'name' => $p->name]),
            ],
        ]);
    }
}
