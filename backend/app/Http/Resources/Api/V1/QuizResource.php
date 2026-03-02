<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'title'                => $this->title,
            'description'          => $this->description,
            'created_by'           => $this->created_by,
            'pool_id'              => $this->pool_id,
            'time_mode'            => $this->time_mode,
            'total_time_limit'     => $this->total_time_limit,
            'speed_scoring'        => $this->speed_scoring,
            'speed_factor_min'     => $this->speed_factor_min,
            'speed_factor_max'     => $this->speed_factor_max,
            'gamble_uses'          => $this->gamble_uses,
            'randomize_questions'  => $this->randomize_questions,
            'random_mode'          => $this->random_mode,
            'random_count'         => $this->random_count,
            'is_published'         => $this->is_published,
            'created_at'           => $this->created_at,
            'updated_at'           => $this->updated_at,
            'deleted_at'           => $this->deleted_at,
            'pool'                 => new QuestionPoolResource($this->whenLoaded('pool')),
            'quiz_questions'       => QuizQuestionResource::collection($this->whenLoaded('quizQuestions')),
        ];
    }
}
