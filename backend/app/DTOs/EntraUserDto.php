<?php

namespace App\DTOs;

use Laravel\Socialite\Contracts\User as SocialiteUser;

/**
 * Data Transfer Object for Microsoft Entra ID user data.
 *
 * @package App\DTOs
 */
readonly class EntraUserDto
{
    /**
     * @param string      $entraId     The unique Microsoft Entra ID identifier
     * @param string      $email       The user's email address
     * @param string      $displayName The user's display name
     * @param string|null $firstName   The user's first name
     * @param string|null $lastName    The user's last name
     * @param string|null $avatarUrl   The user's avatar URL
     */
    public function __construct(
        public string $entraId,
        public string $email,
        public string $displayName,
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $avatarUrl = null,
    ) {}

    /**
     * Create a new DTO instance from a Socialite user.
     *
     * @param SocialiteUser $socialiteUser The Socialite user instance
     *
     * @return self
     */
    public static function fromSocialite(SocialiteUser $socialiteUser): self
    {
        return new self(
            entraId: $socialiteUser->getId(),
            email: $socialiteUser->getEmail(),
            displayName: $socialiteUser->getName(),
            firstName: $socialiteUser->user['givenName'] ?? null,
            lastName: $socialiteUser->user['surname'] ?? null,
            avatarUrl: $socialiteUser->getAvatar(),
        );
    }

    /**
     * Convert the DTO to an array.
     *
     * @return array<string,mixed>
     */
    public function toArray(): array
    {
        return [
            'entra_id' => $this->entraId,
            'email' => $this->email,
            'display_name' => $this->displayName,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'avatar_url' => $this->avatarUrl,
        ];
    }
}
