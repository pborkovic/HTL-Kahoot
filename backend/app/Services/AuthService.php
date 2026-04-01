<?php

namespace App\Services;

use App\DTOs\EntraUserDto;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryContract;
use App\Services\Contracts\AuthServiceContract;
use App\Services\Contracts\MicrosoftGraphServiceContract;
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
        private readonly UserRepositoryContract $userRepository,
        private readonly MicrosoftGraphServiceContract $graphService,
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
            ->scopes(scopes: ['User.Read'])
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

        $accessToken = $socialiteUser->token;

        $groups = $this->graphService->getUserGroups(accessToken: $accessToken);

        $existingUser = $this->userRepository->findByExternalId(
            externalId: $entraDto->externalId
        );

        $avatarUrl = $this->graphService->getUserPhoto(
            accessToken: $accessToken,
            userId: $existingUser?->id ?? $entraDto->externalId,
        );

        $enrichedDto = $entraDto->withGraphData(groups: $groups, avatarUrl: $avatarUrl);

        if ($existingUser) {
            return $this->userRepository->updateFromEntra(
                user: $existingUser,
                entraDto: $enrichedDto
            );
        }

        $newUser = $this->userRepository->createFromEntra(entraDto: $enrichedDto);

        if ($avatarUrl === null) {
            return $newUser;
        }

        $realAvatarUrl = $this->graphService->getUserPhoto(
            accessToken: $accessToken,
            userId: $newUser->id,
        );

        if ($realAvatarUrl) {
            $newUser->update(attributes: ['avatar_url' => $realAvatarUrl]);

            return $newUser->fresh();
        }

        return $newUser;
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
