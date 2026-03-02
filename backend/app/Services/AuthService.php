<?php

namespace App\Services;

use App\DTOs\EntraUserDto;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Services\Contracts\AuthServiceContract;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

/**
 * Authentication Service Implementation
 *
 * @package App\Services
 */
class AuthService implements AuthServiceContract
{
    public function __construct(
        private readonly UserRepositoryContract $userRepository
    ) {}

    public function getRedirectUrl(): string
    {
        return Socialite::driver('azure')
            ->stateless()
            ->redirect()
            ->getTargetUrl();
    }

    public function handleCallback(string $code): SocialiteUser
    {
        request()->merge(['code' => $code]);

        return Socialite::driver('azure')
            ->stateless()
            ->user();
    }

    public function findOrCreateUser(SocialiteUser $socialiteUser): User
    {
        $entraDto = EntraUserDto::fromSocialite(
            socialiteUser: $socialiteUser
        );

        $user = $this->userRepository->findByExternalId(
            externalId: $entraDto->externalId
        );

        if ($user) {
            return $this->userRepository->updateFromEntra(
                user: $user,
                entraDto: $entraDto
            );
        }

        return $this->userRepository->createFromEntra(
            entraDto: $entraDto
        );
    }

    public function createToken(User $user): string
    {
        return $user->createToken(name: 'auth_token')->plainTextToken;
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
