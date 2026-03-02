<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class CreateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'               => ['required', 'string', 'max:50'],
            'title'              => ['required', 'string', 'max:1000'],
            'explanation'        => ['nullable', 'string'],
            'difficulty'         => ['nullable', 'integer', 'min:1', 'max:5'],
            'default_points'     => ['nullable', 'integer', 'min:0'],
            'default_time_limit' => ['nullable', 'integer', 'min:1'],
            'randomize_options'  => ['nullable', 'boolean'],
            'config'             => ['nullable', 'array'],
            'answer_options'     => ['nullable', 'array'],
            'answer_options.*.text'       => ['required_with:answer_options', 'string'],
            'answer_options.*.is_correct' => ['nullable', 'boolean'],
            'answer_options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
