<?php

namespace App\Services;

use App\DTOs\EntraUserDto;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Services\Contracts\AuthServiceContract;
use Illuminate\Auth\AuthenticationException;
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


    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function loginWithEmail(string $email, string $password): User
    {
        $user = $this->userRepository->findByEmail(email: $email);

        $credentialsValid = $user
            && $user->auth_provider === 'local'
            && $user->is_active
            && password_verify(password: $password, hash: $user->getAuthPassword());

        if (! $credentialsValid) {
            throw new AuthenticationException(message: 'Invalid credentials.');
        }
        if (! $user->hasAnyRole(roles: ['admin', 'superadmin'])) {
            throw new AuthenticationException(message: 'Email login is only available for administrators.');
        }

        $user->update(attributes: ['last_login_at' => now()]);

        return $user;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getRedirectUrl(): string
    {
        return Socialite::driver('azure')
            ->stateless()
            ->redirect()
            ->getTargetUrl();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function handleCallback(string $code): SocialiteUser
    {
        request()->merge(['code' => $code]);

        return Socialite::driver('azure')
            ->stateless()
            ->user();
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
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

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createToken(User $user): string
    {
        return $user->createToken(name: 'auth_token')->plainTextToken;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
