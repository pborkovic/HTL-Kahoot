<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'answer'   => ['present', 'array'],
            'answer.*' => ['required', 'string'],
            'answer_text' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
