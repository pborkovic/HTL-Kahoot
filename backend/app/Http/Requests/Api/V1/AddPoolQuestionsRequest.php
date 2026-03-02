<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class AddPoolQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_ids'   => ['required', 'array', 'min:1'],
            'question_ids.*' => ['required', 'uuid', 'exists:questions,id'],
        ];
    }
}
