<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class AddQuizQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_version_id'  => ['required', 'uuid', 'exists:question_versions,id'],
            'sort_order'           => ['required', 'integer', 'min:0'],
            'points_override'      => ['nullable', 'integer', 'min:0'],
            'time_limit_override'  => ['nullable', 'integer', 'min:1'],
            'weight'               => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
