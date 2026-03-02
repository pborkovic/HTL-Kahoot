<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class CreateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'               => ['required', 'string', 'max:255'],
            'description'         => ['nullable', 'string'],
            'pool_id'             => ['nullable', 'uuid', 'exists:question_pools,id'],
            'time_mode'           => ['nullable', 'string', 'in:per_question,total'],
            'total_time_limit'    => ['nullable', 'integer', 'min:1'],
            'speed_scoring'       => ['nullable', 'boolean'],
            'speed_factor_min'    => ['nullable', 'numeric', 'min:0', 'max:1'],
            'speed_factor_max'    => ['nullable', 'numeric', 'min:0', 'max:1'],
            'gamble_uses'         => ['nullable', 'integer', 'min:0'],
            'randomize_questions' => ['nullable', 'boolean'],
            'random_mode'         => ['nullable', 'string', 'max:20'],
            'random_count'        => ['nullable', 'integer', 'min:1'],
        ];
    }
}
