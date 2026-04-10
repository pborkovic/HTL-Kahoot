<?php

namespace App\Services\Contracts;

interface MicrosoftGraphServiceContract
{
    /**
     * Fetch the display names of all groups the user is a member of.
     *
     * @param  string  $accessToken  The OAuth2 access token with GroupMember.Read.All scope.
     * @return string[] List of group display names.
     */
    public function getUserGroups(string $accessToken): array;

    /**
     * Download the user's profile photo and store it on the S3 disk.
     *
     * Tries several thumbnail sizes first and falls back to the raw full-size
     * photo. Requires the delegated User.Read scope.
     *
     * @param  string  $accessToken  The OAuth2 access token.
     * @param  string  $userId  The local user UUID, used as the file name.
     * @return string|null The public URL of the stored photo, or null if none exists.
     */
    public function getUserPhoto(string $accessToken, string $userId): ?string;

    /**
     * Fetch the signed-in user's extended profile from /me.
     *
     * Returns a normalized snake_case array of common fields. Requires the
     * delegated User.Read scope.
     *
     * @param  string  $accessToken  The OAuth2 access token.
     * @return array{
     *     id: string|null,
     *     display_name: string|null,
     *     given_name: string|null,
     *     surname: string|null,
     *     mail: string|null,
     *     user_principal_name: string|null,
     *     job_title: string|null,
     *     department: string|null,
     *     office_location: string|null,
     *     preferred_language: string|null,
     *     mobile_phone: string|null,
     *     business_phones: array<int, string>
     * }|null
     */
    public function getUserProfile(string $accessToken): ?array;
}
