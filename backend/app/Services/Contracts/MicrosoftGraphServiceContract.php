<?php

namespace App\Services\Contracts;

interface MicrosoftGraphServiceContract
{
    /**
     * Fetch the display names of all groups the user is a member of.
     *
     * @param string $accessToken The OAuth2 access token with GroupMember.Read.All scope.
     *
     * @return string[] List of group display names.
     */
    public function getUserGroups(string $accessToken): array;

    /**
     * Download the user's profile photo and store it on the S3 disk.
     *
     * @param string $accessToken The OAuth2 access token with User.Read scope.
     * @param string $userId      The local user UUID, used as the file name.
     *
     * @return string|null The public URL of the stored photo, or null if none exists.
     */
    public function getUserPhoto(string $accessToken, string $userId): ?string;
}
