<?php

namespace App\Services;

use App\Services\Contracts\MediaServiceContract;
use App\Services\Contracts\MicrosoftGraphServiceContract;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class MicrosoftGraphService implements MicrosoftGraphServiceContract
{
    private const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

    private const PHOTO_SIZES = ['240x240', '120x120', '96x96'];

    private const PROFILE_SELECT = 'id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,preferredLanguage,mobilePhone,businessPhones';

    public function __construct(
        private readonly MediaServiceContract $mediaService,
    ) {
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getUserGroups(string $accessToken): array
    {
        try {
            $response = Http::withToken(token: $accessToken)
                ->get(url: self::GRAPH_BASE.'/me/memberOf');

            if (! $response->successful()) {
                Log::warning(message: 'Graph API /me/memberOf failed', context: [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            }

            $groups = [];

            foreach ($response->json(key: 'value', default: []) as $entry) {
                $type = $entry['@odata.type'] ?? '';

                if ($type === '#microsoft.graph.group' && ! empty($entry['displayName'])) {
                    $groups[] = $entry['displayName'];
                }
            }

            return $groups;
        } catch (Throwable $e) {
            Log::error(message: "Graph API group fetch failed: {$e->getMessage()}");

            return [];
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getUserPhoto(string $accessToken, string $userId): ?string
    {
        try {
            $response = null;

            foreach (self::PHOTO_SIZES as $size) {
                $sized = Http::withToken(token: $accessToken)
                    ->get(url: self::GRAPH_BASE."/me/photos/{$size}/\$value");

                if ($sized->successful()) {
                    $response = $sized;

                    break;
                }

                if ($sized->status() !== 404) {
                    Log::info(message: 'Graph API sized photo unavailable', context: [
                        'size' => $size,
                        'status' => $sized->status(),
                    ]);
                }
            }

            if ($response === null) {
                $fallback = Http::withToken(token: $accessToken)
                    ->get(url: self::GRAPH_BASE.'/me/photo/$value');

                if (! $fallback->successful()) {
                    if ($fallback->status() !== 404) {
                        Log::warning(message: 'Graph API /me/photo failed', context: [
                            'status' => $fallback->status(),
                            'body' => $fallback->body(),
                        ]);
                    }

                    return null;
                }

                $response = $fallback;
            }

            $contentType = $response->header(header: 'Content-Type');
            $extension = match (true) {
                str_contains(haystack: $contentType, needle: 'png') => 'png',
                str_contains(haystack: $contentType, needle: 'gif') => 'gif',
                str_contains(haystack: $contentType, needle: 'webp') => 'webp',
                default => 'jpg',
            };
            $path = "avatars/{$userId}.{$extension}";

            return $this->mediaService->storeBinary(
                path: $path,
                contents: $response->body(),
            );
        } catch (Throwable $e) {
            Log::warning(message: "Graph API photo fetch failed: {$e->getMessage()}");

            return null;
        }
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getUserProfile(string $accessToken): ?array
    {
        try {
            $response = Http::withToken(token: $accessToken)
                ->get(url: self::GRAPH_BASE.'/me', query: [
                    '$select' => self::PROFILE_SELECT,
                ]);

            if (! $response->successful()) {
                Log::warning(message: 'Graph API /me failed', context: [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json() ?? [];

            return [
                'id' => $data['id'] ?? null,
                'display_name' => $data['displayName'] ?? null,
                'given_name' => $data['givenName'] ?? null,
                'surname' => $data['surname'] ?? null,
                'mail' => $data['mail'] ?? null,
                'user_principal_name' => $data['userPrincipalName'] ?? null,
                'job_title' => $data['jobTitle'] ?? null,
                'department' => $data['department'] ?? null,
                'office_location' => $data['officeLocation'] ?? null,
                'preferred_language' => $data['preferredLanguage'] ?? null,
                'mobile_phone' => $data['mobilePhone'] ?? null,
                'business_phones' => $data['businessPhones'] ?? [],
            ];
        } catch (Throwable $e) {
            Log::warning(message: "Graph API profile fetch failed: {$e->getMessage()}");

            return null;
        }
    }
}
