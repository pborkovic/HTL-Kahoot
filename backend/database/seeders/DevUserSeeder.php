<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'email'        => 'student@gamquiz.test',
                'username'     => 'student',
                'display_name' => 'Student User',
                'class_name'   => '3b',
                'role'         => 'student',
            ],
            [
                'email'        => 'teacher@gamquiz.test',
                'username'     => 'teacher',
                'display_name' => 'Teacher User',
                'class_name'   => null,
                'role'         => 'teacher',
            ],
            [
                'email'        => 'admin@gamquiz.test',
                'username'     => 'admin',
                'display_name' => 'Admin User',
                'class_name'   => null,
                'role'         => 'admin',
            ],
            [
                'email'        => 'superadmin@gamquiz.test',
                'username'     => 'superadmin',
                'display_name' => 'Super Admin',
                'class_name'   => null,
                'role'         => 'superadmin',
            ],
        ];

        foreach ($users as $data) {
            $role = Role::firstOrCreate(
                ['name' => $data['role']],
                ['description' => $data['role'], 'is_system' => true]
            );

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'username'      => $data['username'],
                    'display_name'  => $data['display_name'],
                    'class_name'    => $data['class_name'],
                    'password_hash' => password_hash('password', PASSWORD_ARGON2ID),
                    'auth_provider' => 'local',
                    'is_active'     => true,
                ]
            );

            $user->roles()->sync([$role->id]);
        }
    }
}
