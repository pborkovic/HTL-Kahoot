<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Concerns;

trait QuestionRules
{
    /**
     * Get the shared validation rules for question fields.
     *
     * @param  string  $presence  'required' for creation, 'sometimes' for updates.
     * @return array<string, array<int, string>>
     *
     * @author Philipp Borkovic
     */
    protected function questionRules(string $presence = 'required'): array
    {
        return [
            'type' => [$presence, 'string', 'max:50'],
            'title' => [$presence, 'string', 'max:1000'],
            'explanation' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'string'],
            'difficulty' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
            'default_points' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'integer', 'min:0'],
            'default_time_limit' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'integer', 'min:1'],
            'randomize_options' => [$presence === 'required' ? 'nullable' : 'sometimes', 'boolean'],
            'config' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'array'],
            'answer_options' => [$presence === 'required' ? 'nullable' : 'sometimes', 'nullable', 'array'],
            'answer_options.*.text' => ['required_with:answer_options', 'string'],
            'answer_options.*.is_correct' => ['nullable', 'boolean'],
            'answer_options.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
