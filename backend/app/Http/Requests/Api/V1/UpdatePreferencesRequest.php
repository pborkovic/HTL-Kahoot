<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'theme' => ['sometimes', 'string', 'in:light,dark,high-contrast,dark-high-contrast,colorblind-friendly,dark-colorblind-friendly'],
            'language' => ['sometimes', 'string', 'in:de,en'],
            'font_size' => ['sometimes', 'string', 'in:small,medium,large'],
        ];
    }
}
