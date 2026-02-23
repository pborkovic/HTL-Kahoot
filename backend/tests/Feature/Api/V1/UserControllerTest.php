<?php

use App\Models\Role;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

// ─── GET /api/v1/users ──────────────────────────────────────────────────────

it('lists users as admin', function () {
    $admin = createUserWithRole('admin');
    User::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/users');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'email', 'roles']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

it('denies listing users to students', function () {
    $student = createUserWithRole('student');

    $this->actingAs($student)->getJson('/api/v1/users')->assertForbidden();
});

it('allows teachers to list users', function () {
    $teacher = createUserWithRole('teacher');

    $this->actingAs($teacher)->getJson('/api/v1/users')->assertOk();
});

it('filters users by role', function () {
    $admin   = createUserWithRole('admin');
    $student = createUserWithRole('student');
    createUserWithRole('teacher');

    $response = $this->actingAs($admin)->getJson('/api/v1/users?role=student');

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($student->id);
    expect($ids->count())->toBe(1);
});

it('filters users by class', function () {
    $admin = createUserWithRole('admin');
    createUserWithRole('student', ['class_name' => '3b']);
    createUserWithRole('student', ['class_name' => '5AHIT']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?class=3b');

    $response->assertOk();
    expect(collect($response->json('data'))->pluck('class_name')->unique()->values()->all())->toBe(['3b']);
});

it('filters users by class prefix', function () {
    $admin = createUserWithRole('admin');
    createUserWithRole('student', ['class_name' => '3a']);
    createUserWithRole('student', ['class_name' => '3b']);
    createUserWithRole('student', ['class_name' => '5AHIT']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?class_prefix=3');

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(2);
});

it('searches users by email', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['email' => 'mueller@schule.at']);
    User::factory()->create(['email' => 'other@schule.at']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?search=mueller');

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(1);
    expect($response->json('data.0.email'))->toBe('mueller@schule.at');
});

it('searches users by display_name', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['display_name' => 'Max Mueller', 'email' => 'max@test.at']);
    User::factory()->create(['display_name' => 'Anna Berg', 'email' => 'anna@test.at']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?search=mueller');

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(1);
});

it('filters users by is_active', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['is_active' => true]);
    User::factory()->inactive()->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/users?is_active=false');

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(1);
});

it('filters users by auth_provider', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['auth_provider' => 'local']);
    User::factory()->entraId()->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/users?auth_provider=entra_id');

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(1);
});

it('filters by created_after', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['created_at' => now()->subDays(10)]);
    User::factory()->create(['created_at' => now()->subDays(1)]);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?created_after=' . now()->subDays(5)->toDateString());

    $response->assertOk();
    expect($response->json('meta.total'))->toBe(1);
});

it('sorts users ascending by email', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['email' => 'z@test.at']);
    User::factory()->create(['email' => 'a@test.at']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users?sort=email&direction=asc');

    $response->assertOk();
    $emails = collect($response->json('data'))->pluck('email')->values();
    expect($emails->first())->toBe('a@test.at');
});

it('paginates user list', function () {
    $admin = createUserWithRole('admin');
    User::factory()->count(10)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/users?per_page=3&page=1');

    $response->assertOk();
    expect($response->json('meta.per_page'))->toBe(3);
    expect(count($response->json('data')))->toBe(3);
});

it('includes soft-deleted users with with_trashed for admin', function () {
    $admin = createUserWithRole('admin');
    $user  = User::factory()->create();
    $user->delete();

    $response = $this->actingAs($admin)->getJson('/api/v1/users?with_trashed=true');

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($user->id);
});

// ─── GET /api/v1/users/{id} ─────────────────────────────────────────────────

it('shows own profile', function () {
    $user = createUserWithRole('student');

    $response = $this->actingAs($user)->getJson("/api/v1/users/{$user->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $user->id);
});

it('allows admin to view any user', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');

    $response = $this->actingAs($admin)->getJson("/api/v1/users/{$user->id}");

    $response->assertOk();
});

it('denies a student from viewing another user', function () {
    $student = createUserWithRole('student');
    $other   = createUserWithRole('student');

    $this->actingAs($student)->getJson("/api/v1/users/{$other->id}")->assertForbidden();
});

it('does not expose password_hash in response', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');

    $response = $this->actingAs($admin)->getJson("/api/v1/users/{$user->id}");

    $response->assertOk();
    expect($response->json('data'))->not->toHaveKey('password_hash');
    expect($response->json('data'))->not->toHaveKey('totp_secret');
});

// ─── POST /api/v1/users ─────────────────────────────────────────────────────

it('creates a user as admin', function () {
    $admin = createUserWithRole('admin');
    createRole('student');

    $response = $this->actingAs($admin)->postJson('/api/v1/users', [
        'email'         => 'new@schule.at',
        'username'      => 'newuser',
        'display_name'  => 'New User',
        'password'      => 'SecureP@ss1',
        'auth_provider' => 'local',
        'class_name'    => '3b',
        'role'          => 'student',
        'is_active'     => true,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.email', 'new@schule.at')
        ->assertJsonPath('data.class_name', '3b');

    $this->assertDatabaseHas('users', ['email' => 'new@schule.at']);
});

it('validates email uniqueness on create', function () {
    $admin = createUserWithRole('admin');
    User::factory()->create(['email' => 'taken@schule.at']);
    createRole('student');

    $this->actingAs($admin)->postJson('/api/v1/users', [
        'email'         => 'taken@schule.at',
        'auth_provider' => 'local',
        'password'      => 'SecureP@ss1',
        'role'          => 'student',
    ])->assertUnprocessable();
});

it('requires password for local auth provider', function () {
    $admin = createUserWithRole('admin');
    createRole('student');

    $this->actingAs($admin)->postJson('/api/v1/users', [
        'email'         => 'nopw@schule.at',
        'auth_provider' => 'local',
        'role'          => 'student',
    ])->assertUnprocessable();
});

it('denies creating users as student', function () {
    $student = createUserWithRole('student');

    $this->actingAs($student)->postJson('/api/v1/users', [])->assertForbidden();
});

// ─── PUT /api/v1/users/{id} ─────────────────────────────────────────────────

it('allows admin to update any user', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');

    $response = $this->actingAs($admin)->putJson("/api/v1/users/{$user->id}", [
        'display_name' => 'Updated Name',
        'class_name'   => '5AHIT',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.display_name', 'Updated Name')
        ->assertJsonPath('data.class_name', '5AHIT');
});

it('allows a user to update own display_name and username', function () {
    $user = createUserWithRole('student');

    $response = $this->actingAs($user)->putJson("/api/v1/users/{$user->id}", [
        'display_name' => 'My New Name',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.display_name', 'My New Name');
});

it('prevents a user from updating own class_name', function () {
    $user = createUserWithRole('student');

    $response = $this->actingAs($user)->putJson("/api/v1/users/{$user->id}", [
        'class_name' => 'HACKED',
    ]);

    $response->assertOk();
    $this->assertDatabaseMissing('users', ['id' => $user->id, 'class_name' => 'HACKED']);
});

it('denies teacher from updating another user', function () {
    $teacher = createUserWithRole('teacher');
    $user    = createUserWithRole('student');

    $this->actingAs($teacher)->putJson("/api/v1/users/{$user->id}", [
        'display_name' => 'Hacked',
    ])->assertForbidden();
});

it('admin can change user role', function () {
    $admin   = createUserWithRole('admin');
    $user    = createUserWithRole('student');
    createRole('teacher');

    $response = $this->actingAs($admin)->putJson("/api/v1/users/{$user->id}", [
        'role' => 'teacher',
    ]);

    $response->assertOk();
    $user->refresh();
    expect($user->hasRole('teacher'))->toBeTrue();
});

it('invalidates tokens when deactivating user', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');
    $user->createToken('test');

    expect($user->tokens()->count())->toBe(1);

    $this->actingAs($admin)->putJson("/api/v1/users/{$user->id}", ['is_active' => false]);

    expect($user->tokens()->count())->toBe(0);
});

// ─── DELETE /api/v1/users/{id} ──────────────────────────────────────────────

it('soft deletes a user as superadmin', function () {
    $superadmin = createUserWithRole('superadmin');
    $user       = createUserWithRole('student');

    $this->actingAs($superadmin)->deleteJson("/api/v1/users/{$user->id}")->assertNoContent();

    $this->assertSoftDeleted('users', ['id' => $user->id]);
});

it('prevents admin from deleting users', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');

    $this->actingAs($admin)->deleteJson("/api/v1/users/{$user->id}")->assertForbidden();
});

it('prevents superadmin from deleting themselves', function () {
    $superadmin = createUserWithRole('superadmin');

    $this->actingAs($superadmin)->deleteJson("/api/v1/users/{$superadmin->id}")->assertUnprocessable();
});

it('prevents deleting the last superadmin', function () {
    $superadmin = createUserWithRole('superadmin');

    $this->actingAs($superadmin)->deleteJson("/api/v1/users/{$superadmin->id}")->assertUnprocessable();
});

// ─── POST /api/v1/users/{id}/restore ────────────────────────────────────────

it('restores a soft-deleted user', function () {
    $superadmin = createUserWithRole('superadmin');
    $user       = createUserWithRole('student');
    $user->delete();

    $response = $this->actingAs($superadmin)->postJson("/api/v1/users/{$user->id}/restore");

    $response->assertOk()
        ->assertJsonPath('data.id', $user->id);

    $this->assertNotSoftDeleted('users', ['id' => $user->id]);
});

it('denies restore to non-superadmin', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');
    $user->delete();

    $this->actingAs($admin)->postJson("/api/v1/users/{$user->id}/restore")->assertForbidden();
});

// ─── PATCH /api/v1/users/{id}/password ──────────────────────────────────────

it('allows a user to change own password', function () {
    $user = createUserWithRole('student');

    $response = $this->actingAs($user)->patchJson("/api/v1/users/{$user->id}/password", [
        'current_password' => 'password',
        'new_password'     => 'NewSecure@99',
    ]);

    $response->assertOk();
    expect(password_verify('NewSecure@99', $user->fresh()->password_hash))->toBeTrue();
});

it('rejects wrong current password', function () {
    $user = createUserWithRole('student');

    $this->actingAs($user)->patchJson("/api/v1/users/{$user->id}/password", [
        'current_password' => 'wrongpassword',
        'new_password'     => 'NewSecure@99',
    ])->assertUnprocessable();
});

it('allows admin to reset password without current_password', function () {
    $admin = createUserWithRole('admin');
    $user  = createUserWithRole('student');

    $response = $this->actingAs($admin)->patchJson("/api/v1/users/{$user->id}/password", [
        'new_password' => 'AdminReset@1',
    ]);

    $response->assertOk();
});

it('denies password change for non-local auth provider', function () {
    $user = createUserWithRole('student', ['auth_provider' => 'entra_id', 'password_hash' => null]);

    $this->actingAs($user)->patchJson("/api/v1/users/{$user->id}/password", [
        'current_password' => 'password',
        'new_password'     => 'NewSecure@99',
    ])->assertUnprocessable();
});

it('invalidates tokens after password change', function () {
    $user = createUserWithRole('student');
    $user->createToken('old_token');

    expect($user->tokens()->count())->toBe(1);

    $this->actingAs($user)->patchJson("/api/v1/users/{$user->id}/password", [
        'current_password' => 'password',
        'new_password'     => 'NewSecure@99',
    ]);

    expect($user->tokens()->count())->toBe(0);
});

// ─── GET /api/v1/users/classes ──────────────────────────────────────────────

it('returns class list with counts for admin', function () {
    $admin = createUserWithRole('admin');
    createUserWithRole('student', ['class_name' => '3a']);
    createUserWithRole('student', ['class_name' => '3a']);
    createUserWithRole('student', ['class_name' => '3b']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users/classes');

    $response->assertOk()
        ->assertJsonStructure(['data' => [['class_name', 'student_count']]]);

    $data = collect($response->json('data'));
    expect($data->firstWhere('class_name', '3a')['student_count'])->toBe(2);
    expect($data->firstWhere('class_name', '3b')['student_count'])->toBe(1);
});

it('returns class list for teacher', function () {
    $teacher = createUserWithRole('teacher');

    $this->actingAs($teacher)->getJson('/api/v1/users/classes')->assertOk();
});

it('denies class list to students', function () {
    $student = createUserWithRole('student');

    $this->actingAs($student)->getJson('/api/v1/users/classes')->assertForbidden();
});

it('excludes users without class_name from classes endpoint', function () {
    $admin = createUserWithRole('admin');
    createUserWithRole('student', ['class_name' => null]);
    createUserWithRole('student', ['class_name' => '3a']);

    $response = $this->actingAs($admin)->getJson('/api/v1/users/classes');

    $response->assertOk();
    $classNames = collect($response->json('data'))->pluck('class_name');
    expect($classNames)->not->toContain(null);
});

// ─── GET /api/v1/users/stats ────────────────────────────────────────────────

it('returns stats for admin', function () {
    $admin = createUserWithRole('admin');
    createUserWithRole('student');
    createUserWithRole('teacher');

    $response = $this->actingAs($admin)->getJson('/api/v1/users/stats');

    $response->assertOk()
        ->assertJsonStructure(['data' => [
            'total_users',
            'active_users',
            'by_role',
            'by_auth_provider',
            'recent_signups_30d',
        ]]);
});

it('denies stats to teacher', function () {
    $teacher = createUserWithRole('teacher');

    $this->actingAs($teacher)->getJson('/api/v1/users/stats')->assertForbidden();
});

// ─── POST /api/v1/users/bulk ────────────────────────────────────────────────

it('bulk imports users', function () {
    $admin = createUserWithRole('admin');
    createRole('student');

    $response = $this->actingAs($admin)->postJson('/api/v1/users/bulk', [
        'users' => [
            ['email' => 'alice@schule.at', 'display_name' => 'Alice A', 'class_name' => '3b', 'role' => 'student'],
            ['email' => 'bob@schule.at', 'display_name' => 'Bob B', 'class_name' => '3b', 'role' => 'student'],
        ],
        'default_auth_provider' => 'entra_id',
        'send_welcome_email'    => false,
    ]);

    $response->assertOk()
        ->assertJsonPath('created', 2)
        ->assertJsonPath('skipped', 0);

    $this->assertDatabaseHas('users', ['email' => 'alice@schule.at']);
    $this->assertDatabaseHas('users', ['email' => 'bob@schule.at']);
});

it('skips duplicate emails in bulk import', function () {
    $admin = createUserWithRole('admin');
    createRole('student');
    User::factory()->create(['email' => 'existing@schule.at']);

    $response = $this->actingAs($admin)->postJson('/api/v1/users/bulk', [
        'users' => [
            ['email' => 'existing@schule.at', 'role' => 'student'],
            ['email' => 'new@schule.at', 'role' => 'student'],
        ],
        'default_auth_provider' => 'entra_id',
    ]);

    $response->assertOk()
        ->assertJsonPath('created', 1)
        ->assertJsonPath('skipped', 1);
});

it('reports validation errors per row in bulk import', function () {
    $admin = createUserWithRole('admin');
    createRole('student');

    $response = $this->actingAs($admin)->postJson('/api/v1/users/bulk', [
        'users' => [
            ['email' => 'not-an-email', 'role' => 'student'],
            ['email' => 'valid@schule.at', 'role' => 'student'],
        ],
        'default_auth_provider' => 'entra_id',
    ]);

    $response->assertOk();
    expect($response->json('errors'))->toHaveCount(1);
    expect($response->json('errors.0.row'))->toBe(1);
    expect($response->json('created'))->toBe(1);
});

it('denies bulk import to students', function () {
    $student = createUserWithRole('student');

    $this->actingAs($student)->postJson('/api/v1/users/bulk', [
        'users' => [],
    ])->assertForbidden();
});

it('requires authentication for all endpoints', function () {
    $this->getJson('/api/v1/users')->assertUnauthorized();
    $this->getJson('/api/v1/users/classes')->assertUnauthorized();
    $this->getJson('/api/v1/users/stats')->assertUnauthorized();
});
