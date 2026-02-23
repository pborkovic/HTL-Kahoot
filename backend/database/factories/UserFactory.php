<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email'         => fake()->unique()->safeEmail(),
            'username'      => fake()->unique()->userName(),
            'display_name'  => fake()->name(),
            'password_hash' => password_hash('password', PASSWORD_ARGON2ID),
            'auth_provider' => 'local',
            'is_active'     => true,
            'class_name'    => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn() => ['is_active' => false]);
    }

    public function entraId(): static
    {
        return $this->state(fn() => [
            'auth_provider' => 'entra_id',
            'password_hash' => null,
        ]);
    }

    public function withClass(string $className): static
    {
        return $this->state(fn() => ['class_name' => $className]);
    }
}
