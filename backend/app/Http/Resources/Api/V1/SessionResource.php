<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for transforming a Session model into a JSON response.
 *
 * Conditionally includes quiz, host, and participants relations when loaded.
 */
class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'quiz_id'              => $this->quiz_id,
            'host_id'              => $this->host_id,
            'game_pin'             => $this->game_pin,
            'qr_code_url'          => $this->qr_code_url,
            'status'               => $this->status,
            'current_question_idx' => $this->current_question_idx,
            'started_at'           => $this->started_at,
            'finished_at'          => $this->finished_at,
            'created_at'           => $this->created_at,
            'quiz'                 => new QuizResource($this->whenLoaded('quiz')),
            'host'                 => new UserResource($this->whenLoaded('host')),
            'participants'         => UserResource::collection($this->whenLoaded('participants')),
        ];
    }
}
