<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'version'            => $this->version,
            'title'              => $this->title,
            'explanation'        => $this->explanation,
            'difficulty'         => $this->difficulty,
            'default_points'     => $this->default_points,
            'default_time_limit' => $this->default_time_limit,
            'randomize_options'  => $this->randomize_options,
            'config'             => $this->config,
            'created_at'         => $this->created_at,
            'answer_options'     => AnswerOptionResource::collection($this->whenLoaded('answerOptions')),
        ];
    }
}
