<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UploadQuestionMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file'       => ['required', 'file', 'max:51200', 'mimes:jpeg,png,gif,webp,mp4,webm'],
            'type'       => ['required', 'string', 'in:image,video,code_snippet'],
            'alt_text'   => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
