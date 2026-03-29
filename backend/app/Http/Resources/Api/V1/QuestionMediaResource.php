<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'question_id' => $this->question_id,
            'type'        => $this->type,
            'url'         => $this->url,
            'alt_text'    => $this->alt_text,
            'sort_order'  => $this->sort_order,
            'created_at'  => $this->created_at,
        ];
    }
}
