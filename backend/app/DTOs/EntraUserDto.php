<?php

namespace App\DTOs;

use Laravel\Socialite\Contracts\User as SocialiteUser;

readonly class EntraUserDto
{
    /**
     * @param string        $externalId  Azure AD object ID.
     * @param string        $email       User principal name / email.
     * @param string        $displayName Cleaned display name (without class suffix).
     * @param string|null   $className   Class parsed from display name (e.g. 3AHITN).
     * @param string[]      $groups      Azure AD group display names the user belongs to.
     * @param string|null   $avatarUrl   URL to the stored profile photo, set after upload.
     */
    public function __construct(
        public string  $externalId,
        public string  $email,
        public string  $displayName,
        public ?string $className,
        public array   $groups = [],
        public ?string $avatarUrl = null,
    ) {}

    /**
     * Build an EntraUserDto from a Socialite user returned by the Azure driver.
     *
     * Parses the raw Entra display name into the cleaned display name and
     * optional class suffix; group and avatar data are filled in later via
     * {@see self::withGraphData()}.
     *
     * @param SocialiteUser $socialiteUser The Socialite user from the Azure callback.
     *
     * @return self
     */
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
     * Return a new instance with group and avatar data merged in.
     *
     * @param string[] $groups   Azure AD group display names.
     * @param string|null $avatarUrl Stored avatar URL.
     *
     * @return self
     */
    public function withGraphData(array $groups, ?string $avatarUrl): self
    {
        $className = self::resolveClassFromGroups(groups: $groups) ?? $this->className;

        return new self(
            externalId: $this->externalId,
            email: $this->email,
            displayName: $this->displayName,
            className: $className,
            groups: $groups,
            avatarUrl: $avatarUrl,
        );
    }

    /**
     * Try to find a class name from the user's Azure AD group memberships.
     *
     * Matches group names like "3AHITN", "5BHITM", "1AHINF" — a 1-2 digit
     * year followed by 2+ uppercase letters.
     *
     * @param string[] $groups Group display names.
     *
     * @return string|null The first matching class name, or null.
     */
    private static function resolveClassFromGroups(array $groups): ?string
    {
        foreach ($groups as $group) {
            $trimmed = trim(string: $group);
            if (preg_match(pattern: '/^\d{1,2}[A-Z]{2,}$/', subject: $trimmed)) {
                return $trimmed;
            }
        }

        return null;
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
