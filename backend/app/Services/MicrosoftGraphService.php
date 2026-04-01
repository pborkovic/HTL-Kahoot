<?php

namespace App\Services;

use App\Services\Contracts\MicrosoftGraphServiceContract;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class MicrosoftGraphService implements MicrosoftGraphServiceContract
{
    private const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function getUserGroups(string $accessToken): array
    {
        try {
            $response = Http::withToken(token: $accessToken)
                ->get(url: self::GRAPH_BASE . '/me/memberOf');

            if (! $response->successful()) {
                Log::warning(message: 'Graph API /me/memberOf failed', context: [
                    'status' => $response->status(),
                    'body'   => $response->body(),
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
            $response = Http::withToken(token: $accessToken)
                ->get(url: self::GRAPH_BASE . '/me/photo/$value');

            if (! $response->successful()) {
                return null;
            }

            $contentType = $response->header(header: 'Content-Type');
            $extension = str_contains(haystack: $contentType, needle: 'png') ? 'png' : 'jpg';
            $path = "avatars/{$userId}.{$extension}";

            Storage::disk(name: 's3')->put(
                path: $path,
                contents: $response->body(),
            );

            return "/media/{$path}";
        } catch (Throwable $e) {
            Log::warning(message: "Graph API photo fetch failed: {$e->getMessage()}");

            return null;
        }
    }
}
