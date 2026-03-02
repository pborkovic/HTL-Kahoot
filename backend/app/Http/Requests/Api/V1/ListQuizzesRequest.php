<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ListQuizzesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_published' => ['nullable', 'boolean'],
            'search'       => ['nullable', 'string', 'max:100'],
            'created_by'   => ['nullable', 'uuid', 'exists:users,id'],
            'pool_id'      => ['nullable', 'uuid', 'exists:question_pools,id'],
            'sort'         => ['nullable', 'string', 'in:created_at,title,is_published'],
            'direction'    => ['nullable', 'string', 'in:asc,desc'],
            'per_page'     => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'         => ['nullable', 'integer', 'min:1'],
            'with_trashed' => ['nullable', 'boolean'],
        ];
    }
}
