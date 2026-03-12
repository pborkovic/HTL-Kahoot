<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Http\Requests\Api\V1\Concerns\QuestionRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    use QuestionRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->questionRules(presence: 'sometimes');
    }
}
