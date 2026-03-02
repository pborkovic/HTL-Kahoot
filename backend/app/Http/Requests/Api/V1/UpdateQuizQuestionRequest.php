<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sort_order'          => ['sometimes', 'integer', 'min:0'],
            'points_override'     => ['sometimes', 'nullable', 'integer', 'min:0'],
            'time_limit_override' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'weight'              => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
