<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class BulkCreateUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'users'                  => ['required', 'array', 'min:1'],
            'users.*.email'          => ['required', 'email'],
            'default_auth_provider'  => ['nullable', 'string', 'in:local,entra_id'],
            'send_welcome_email'     => ['nullable', 'boolean'],
        ];
    }
}
