<?php

namespace App\DTOs;

use Laravel\Socialite\Contracts\User as SocialiteUser;

readonly class EntraUserDto
{
    public function __construct(
        public string  $externalId,
        public string  $email,
        public string  $displayName,
        public ?string $className,
    ) {}

    public static function fromSocialite(SocialiteUser $socialiteUser): self
    {
        $rawName = $socialiteUser->getName() ?? '';

        [$displayName, $className] = self::parseDisplayName(rawName: $rawName);

        return new self(
            externalId: $socialiteUser->getId(),
            email: $socialiteUser->getEmail(),
            displayName: $displayName,
            className: $className,
        );
    }

    /**
     * Parse an Entra ID display name into the actual name and an optional class.
     *
     * Expected format: "LASTNAME Firstname, 5BHITM"
     * The class segment is a 1-2 digit year followed by uppercase letters (e.g. 5BHITM, 3AHIF, 1AHINF).
     *
     * @param string $rawName The raw display name from Entra ID.
     *
     * @return array{0: string, 1: string|null} [displayName, className]
     */
    private static function parseDisplayName(string $rawName): array
    {
        $trimmed = trim(string: $rawName);

        if ($trimmed === '') {
            return ['', null];
        }

        $lastComma = strrpos(haystack: $trimmed, needle: ',');

        if ($lastComma === false) {
            return [$trimmed, null];
        }

        $candidate = trim(string: substr(string: $trimmed, offset: $lastComma + 1));

        if (preg_match(pattern: '/^\d{1,2}[A-Z]{2,}$/', subject: $candidate)) {
            $displayName = trim(string: substr(string: $trimmed, offset: 0, length: $lastComma));

            return [$displayName, $candidate];
        }

        return [$trimmed, null];
    }
}
