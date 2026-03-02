<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'               => ['sometimes', 'string', 'max:50'],
            'title'              => ['sometimes', 'string', 'max:1000'],
            'explanation'        => ['sometimes', 'nullable', 'string'],
            'difficulty'         => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
            'default_points'     => ['sometimes', 'nullable', 'integer', 'min:0'],
            'default_time_limit' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'randomize_options'  => ['sometimes', 'boolean'],
            'config'             => ['sometimes', 'nullable', 'array'],
            'answer_options'     => ['sometimes', 'nullable', 'array'],
            'answer_options.*.text'       => ['required_with:answer_options', 'string'],
            'answer_options.*.is_correct' => ['nullable', 'boolean'],
            'answer_options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
