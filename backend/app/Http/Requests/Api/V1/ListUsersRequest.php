<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ListUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role'           => ['nullable', 'string', 'max:50'],
            'class'          => ['nullable', 'string', 'max:20'],
            'class_prefix'   => ['nullable', 'string', 'max:20'],
            'search'         => ['nullable', 'string', 'max:100'],
            'is_active'      => ['nullable', 'boolean'],
            'auth_provider'  => ['nullable', 'string', 'in:local,entra_id'],
            'created_after'  => ['nullable', 'date'],
            'created_before' => ['nullable', 'date'],
            'sort'           => ['nullable', 'string', 'in:email,created_at,display_name,class_name,last_login_at'],
            'direction'      => ['nullable', 'string', 'in:asc,desc'],
            'per_page'       => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'           => ['nullable', 'integer', 'min:1'],
            'with_trashed'   => ['nullable', 'boolean'],
        ];
    }
}
