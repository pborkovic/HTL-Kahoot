<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'username'      => ['nullable', 'string', 'max:100', 'unique:users,username'],
            'display_name'  => ['nullable', 'string', 'max:255'],
            'password'      => [
                'required_if:auth_provider,local',
                'nullable',
                'string',
                Password::min(8)->mixedCase()->numbers(),
            ],
            'auth_provider' => ['required', 'string', 'in:local,entra_id'],
            'class_name'    => ['nullable', 'string', 'max:20'],
            'role'          => ['required', 'string', 'exists:roles,name'],
            'is_active'     => ['nullable', 'boolean'],
        ];
    }
}
