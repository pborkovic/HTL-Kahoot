<?php

namespace App\Services\Contracts;

use App\Models\User;
use Laravel\Socialite\Contracts\User as SocialiteUser;

interface AuthServiceContract
{
    public function getRedirectUrl(): string;

    public function handleCallback(string $code): SocialiteUser;

    public function findOrCreateUser(SocialiteUser $socialiteUser): User;

    public function createToken(User $user): string;

    public function logout(User $user): void;
}
