<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

function createRole(string $name): Role
{
    return Role::firstOrCreate(
        ['name' => $name],
        ['description' => ucfirst($name), 'is_system' => true]
    );
}

function createUserWithRole(string $role, array $attributes = []): User
{
    $roleModel = createRole($role);
    $user      = User::factory()->create($attributes);

    $user->roles()->attach($roleModel->id, ['assigned_at' => now()]);

    return $user;
}
