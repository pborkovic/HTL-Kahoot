<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'sort_order'           => $this->sort_order,
            'points_override'      => $this->points_override,
            'time_limit_override'  => $this->time_limit_override,
            'weight'               => $this->weight,
            'question_version'     => new QuestionVersionResource($this->whenLoaded('questionVersion')),
        ];
    }
}
