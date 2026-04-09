<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Contracts\MediaServiceContract;
use Illuminate\Support\Facades\Storage;

class MediaService implements MediaServiceContract
{
    private const DISK = 's3';
    private const PUBLIC_PREFIX = '/media';

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function storeBinary(string $path, string $contents): string
    {
        Storage::disk(name: self::DISK)->put(
            path: $path,
            contents: $contents,
        );

        return $this->publicUrl(path: $path);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function storeFileContents(string $path, string $contents): string
    {
        return $this->storeBinary(path: $path, contents: $contents);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function delete(string $path): void
    {
        Storage::disk(name: self::DISK)->delete(paths: $path);
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function publicUrl(string $path): string
    {
        return self::PUBLIC_PREFIX . '/' . ltrim(string: $path, characters: '/');
    }
}
