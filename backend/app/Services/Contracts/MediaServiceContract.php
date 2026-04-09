<?php

declare(strict_types=1);

namespace App\Services\Contracts;

/**
 * Media Service Contract.
 *
 * Abstracts the underlying storage disk and public URL scheme used for
 * user-generated media (question attachments, user avatars, ...), so callers
 * only deal with domain-relative paths.
 *
 * @package App\Services\Contracts
 */
interface MediaServiceContract
{
    /**
     * Store raw binary content on the media disk.
     *
     * @param string $path     The storage path relative to the disk root (e.g. "avatars/abc.jpg").
     * @param string $contents The raw binary contents to store.
     *
     * @return string The public URL that the frontend can use to fetch the media (e.g. "/media/avatars/abc.jpg").
     */
    public function storeBinary(string $path, string $contents): string;

    /**
     * Store an uploaded file's contents on the media disk.
     *
     * @param string $path     The storage path relative to the disk root.
     * @param string $contents The file contents.
     *
     * @return string The public URL that the frontend can use to fetch the media.
     */
    public function storeFileContents(string $path, string $contents): string;

    /**
     * Delete a file from the media disk.
     *
     * @param string $path The storage path relative to the disk root.
     *
     * @return void
     */
    public function delete(string $path): void;

    /**
     * Build the public URL for a stored media path.
     *
     * @param string $path The storage path relative to the disk root.
     *
     * @return string The public URL (e.g. "/media/avatars/abc.jpg").
     */
    public function publicUrl(string $path): string;
}
