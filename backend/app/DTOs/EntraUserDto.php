<?php

namespace App\DTOs;

use Laravel\Socialite\Contracts\User as SocialiteUser;

readonly class EntraUserDto
{
    public function __construct(
        public string $externalId,
        public string $email,
        public string $displayName,
    ) {}

    public static function fromSocialite(SocialiteUser $socialiteUser): self
    {
        return new self(
            externalId: $socialiteUser->getId(),
            email: $socialiteUser->getEmail(),
            displayName: $socialiteUser->getName(),
        );
    }

    public function toArray(): array
    {
        return [
            'external_id' => $this->externalId,
            'email' => $this->email,
            'username' => $this->displayName,
        ];
    }
}
