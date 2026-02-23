<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = $this->createPermissions();
        $roles = $this->createRoles();
        $this->assignPermissions($roles, $permissions);
    }

    private function createPermissions(): array
    {
        $definitions = [
            ['key' => 'question.create',  'group' => 'question', 'description' => 'Create questions'],
            ['key' => 'question.read',    'group' => 'question', 'description' => 'Read questions'],
            ['key' => 'question.update',  'group' => 'question', 'description' => 'Update questions'],
            ['key' => 'question.delete',  'group' => 'question', 'description' => 'Delete questions'],
            ['key' => 'question.publish', 'group' => 'question', 'description' => 'Publish questions'],

            ['key' => 'quiz.create',        'group' => 'quiz', 'description' => 'Create quizzes'],
            ['key' => 'quiz.read',          'group' => 'quiz', 'description' => 'Read quizzes'],
            ['key' => 'quiz.update',        'group' => 'quiz', 'description' => 'Update quizzes'],
            ['key' => 'quiz.delete',        'group' => 'quiz', 'description' => 'Delete quizzes'],
            ['key' => 'quiz.publish',       'group' => 'quiz', 'description' => 'Publish quizzes'],
            ['key' => 'quiz.start_session', 'group' => 'quiz', 'description' => 'Start quiz sessions'],

            ['key' => 'pool.create', 'group' => 'pool', 'description' => 'Create question pools'],
            ['key' => 'pool.read',   'group' => 'pool', 'description' => 'Read question pools'],
            ['key' => 'pool.update', 'group' => 'pool', 'description' => 'Update question pools'],
            ['key' => 'pool.delete', 'group' => 'pool', 'description' => 'Delete question pools'],
            ['key' => 'pool.share',  'group' => 'pool', 'description' => 'Share question pools'],

            ['key' => 'user.read',        'group' => 'user', 'description' => 'Read user profiles'],
            ['key' => 'user.update',      'group' => 'user', 'description' => 'Update user profiles'],
            ['key' => 'user.deactivate',  'group' => 'user', 'description' => 'Deactivate users'],
            ['key' => 'user.assign_role', 'group' => 'user', 'description' => 'Assign roles to users'],

            ['key' => 'system.view_audit_logs',  'group' => 'system', 'description' => 'View audit logs'],
            ['key' => 'system.manage_settings',  'group' => 'system', 'description' => 'Manage system settings'],
            ['key' => 'system.manage_imports',   'group' => 'system', 'description' => 'Manage imports'],
        ];

        $map = [];
        foreach ($definitions as $def) {
            $map[$def['key']] = Permission::firstOrCreate(['key' => $def['key']], [
                'description' => $def['description'],
                'group'       => $def['group'],
            ]);
        }

        return $map;
    }

    private function createRoles(): array
    {
        $definitions = [
            ['name' => 'student',    'description' => 'Student participant'],
            ['name' => 'teacher',    'description' => 'Teacher / quiz creator'],
            ['name' => 'admin',      'description' => 'Platform administrator'],
            ['name' => 'superadmin', 'description' => 'Super administrator with full access'],
        ];

        $map = [];
        foreach ($definitions as $def) {
            $map[$def['name']] = Role::firstOrCreate(['name' => $def['name']], [
                'description' => $def['description'],
                'is_system'   => true,
            ]);
        }

        return $map;
    }

    private function assignPermissions(array $roles, array $permissions): void
    {
        $studentKeys = [
            'question.read',
            'quiz.read',
            'pool.read',
        ];

        $teacherKeys = [
            'question.create', 'question.read', 'question.update', 'question.delete', 'question.publish',
            'quiz.create', 'quiz.read', 'quiz.update', 'quiz.delete', 'quiz.publish', 'quiz.start_session',
            'pool.create', 'pool.read', 'pool.update', 'pool.delete', 'pool.share',
            'user.read',
        ];

        $adminKeys = array_merge($teacherKeys, [
            'user.update', 'user.deactivate', 'user.assign_role',
            'system.view_audit_logs', 'system.manage_imports',
        ]);

        $superadminKeys = array_keys($permissions);

        $this->syncRole($roles['student'],    $studentKeys,    $permissions);
        $this->syncRole($roles['teacher'],    $teacherKeys,    $permissions);
        $this->syncRole($roles['admin'],      $adminKeys,      $permissions);
        $this->syncRole($roles['superadmin'], $superadminKeys, $permissions);
    }

    private function syncRole(Role $role, array $keys, array $permissions): void
    {
        $ids = array_map(fn(string $key) => $permissions[$key]->id, $keys);
        $role->permissions()->sync($ids);
    }
}
