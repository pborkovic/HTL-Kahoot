<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['sometimes', 'string', 'max:255'],
            'description'         => ['sometimes', 'nullable', 'string'],
            'pool_id'             => ['sometimes', 'nullable', 'uuid', 'exists:question_pools,id'],
            'time_mode'           => ['sometimes', 'string', 'in:per_question,total'],
            'total_time_limit'    => ['sometimes', 'nullable', 'integer', 'min:1'],
            'speed_scoring'       => ['sometimes', 'boolean'],
            'speed_factor_min'    => ['sometimes', 'numeric', 'min:0', 'max:1'],
            'speed_factor_max'    => ['sometimes', 'numeric', 'min:0', 'max:1'],
            'gamble_uses'         => ['sometimes', 'integer', 'min:0'],
            'randomize_questions' => ['sometimes', 'boolean'],
            'random_mode'         => ['sometimes', 'nullable', 'string', 'max:20'],
            'random_count'        => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }
}
