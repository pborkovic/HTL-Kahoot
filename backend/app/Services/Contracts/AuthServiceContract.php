<?php

namespace App\Services\Contracts;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Laravel\Socialite\Contracts\User as SocialiteUser;

interface AuthServiceContract
{
    /**
     * Authenticate a local user with email and password.
     *
     * Only users with auth_provider 'local' and an admin or superadmin
     * role are permitted to log in via this method.
     *
     * @param string $email    The user's email address.
     * @param string $password The plaintext password to verify.
     *
     * @return User The authenticated user.
     *
     * @throws AuthenticationException If credentials are invalid or the user lacks admin privileges.
     */
    public function loginWithEmail(string $email, string $password): User;

    /**
     * Get the Azure AD OAuth2 authorization URL.
     *
     * @return string The URL the client should redirect to.
     */
    public function getRedirectUrl(): string;

    /**
     * Exchange an Azure AD authorization code for a Socialite user.
     *
     * @param string $code The authorization code received from Azure AD.
     *
     * @return SocialiteUser The authenticated Socialite user.
     */
    public function handleCallback(string $code): SocialiteUser;

    /**
     * Find an existing user by external ID or create one from Socialite data.
     *
     * @param SocialiteUser $socialiteUser The Socialite user returned by the OAuth provider.
     *
     * @return User The found or newly created user.
     */
    public function findOrCreateUser(SocialiteUser $socialiteUser): User;

    /**
     * Issue a new Sanctum API token for the given user.
     *
     * @param User $user The user to create a token for.
     *
     * @return string The plaintext token value.
     */
    public function createToken(User $user): string;

    /**
     * Revoke the user's current access token.
     *
     * @param User $user The authenticated user to log out.
     */
    public function logout(User $user): void;
}
