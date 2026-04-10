<?php

declare(strict_types=1);

namespace App\Services\Contracts;

use App\Models\Question;
use App\Models\User;
use InvalidArgumentException;

interface QuestionImportServiceContract
{
    /**
     * Import questions from file content in the given format.
     *
     * Parses the content (JSON or Moodle GIFT), normalises it into a common
     * structure, and persists each question with its first version and answer
     * options inside a database transaction.
     *
     * @param  string  $content  Raw file content (JSON string or GIFT text).
     * @param  string  $format  The import format: 'json' or 'gift'.
     * @param  User  $user  The authenticated user performing the import.
     * @return array{
     *     imported: int,
     *     failed: int,
     *     errors: array<int, string>,
     *     questions: array<int, Question>
     * }
     *
     * @throws InvalidArgumentException If the format is unsupported.
     */
    public function import(string $content, string $format, User $user): array;
}
