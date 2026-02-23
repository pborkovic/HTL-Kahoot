<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'email'         => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'username'      => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('users', 'username')->ignore($userId)],
            'display_name'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'class_name'    => ['sometimes', 'nullable', 'string', 'max:20'],
            'is_active'     => ['sometimes', 'boolean'],
            'auth_provider' => ['sometimes', 'string', 'in:local,entra_id'],
            'role'          => ['sometimes', 'string', 'exists:roles,name'],
        ];
    }
}
