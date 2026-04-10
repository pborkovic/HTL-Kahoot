<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'created_by' => $this->created_by,
            'pool_id' => $this->pool_id,
            'time_mode' => $this->time_mode,
            'total_time_limit' => $this->total_time_limit,
            'speed_scoring' => $this->speed_scoring,
            'speed_factor_min' => $this->speed_factor_min,
            'speed_factor_max' => $this->speed_factor_max,
            'gamble_uses' => $this->gamble_uses,
            'randomize_questions' => $this->randomize_questions,
            'random_mode' => $this->random_mode,
            'random_count' => $this->random_count,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'quiz_questions_count' => $this->whenCounted('quizQuestions'),
            'sessions_count' => $this->whenCounted('sessions'),
            'latest_session' => $this->whenLoaded('sessions', fn () => $this->sessions->first() ? [
                'id' => $this->sessions->first()->id,
                'game_pin' => $this->sessions->first()->game_pin,
                'status' => $this->sessions->first()->status,
                'started_at' => $this->sessions->first()->started_at,
                'finished_at' => $this->sessions->first()->finished_at,
            ] : null),
            'pool' => new QuestionPoolResource($this->whenLoaded('pool')),
            'quiz_questions' => QuizQuestionResource::collection($this->whenLoaded('quizQuestions')),
            'participants' => $this->whenLoaded('participants', fn () => $this->participants->map(fn ($u) => [
                'id' => $u->id,
                'display_name' => $u->display_name,
                'email' => $u->email,
                'class_name' => $u->class_name,
            ])),
            'participants_count' => $this->whenCounted('participants'),
        ];
    }
}
