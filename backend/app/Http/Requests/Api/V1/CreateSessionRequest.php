<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the game session creation request.
 *
 * Rules:
 * - quiz_id: required, uuid, must exist in quizzes table.
 */
class CreateSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quiz_id' => ['required', 'uuid', 'exists:quizzes,id'],
        ];
    }
}
