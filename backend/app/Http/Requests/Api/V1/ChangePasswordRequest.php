<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $authUser   = $this->user();
        $targetUser = $this->route('user');
        $isSelf     = $authUser && $targetUser && $authUser->id === $targetUser->id;

        return [
            'current_password' => [$isSelf ? 'required' : 'nullable', 'string'],
            'new_password'     => ['required', 'string', Password::min(8)->mixedCase()->numbers()],
        ];
    }
}
