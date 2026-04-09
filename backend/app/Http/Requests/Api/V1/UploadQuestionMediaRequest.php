<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates an upload of media (image or video) attached to a question.
 *
 * Content-length is explicitly bounded per media type via {@see config('media')}:
 * images are capped at `media.image_max_kb` and videos at `media.video_max_kb`.
 * The application-layer cap must stay below PHP's `upload_max_filesize` /
 * `post_max_size` (configured in the backend Dockerfile).
 *
 * @package App\Http\Requests\Api\V1
 */
class UploadQuestionMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type         = (string) $this->input(key: 'type', default: '');
        $imageMaxKb   = (int) config(key: 'media.image_max_kb');
        $videoMaxKb   = (int) config(key: 'media.video_max_kb');
        $imageMimes   = (array) config(key: 'media.image_mimes');
        $videoMimes   = (array) config(key: 'media.video_mimes');

        if ($type === 'video') {
            $maxKb = $videoMaxKb;
            $mimes = $videoMimes;
        } else {
            $maxKb = $imageMaxKb;
            $mimes = $imageMimes;
        }

        return [
            'type'       => ['required', 'string', Rule::in(values: ['image', 'video', 'code_snippet'])],
            'file'       => [
                'required',
                'file',
                'max:' . $maxKb,
                'mimes:' . implode(separator: ',', array: $mimes),
            ],
            'alt_text'   => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
