<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'type'            => $this->type,
            'is_published'    => $this->is_published,
            'created_by'      => $this->created_by,
            'created_at'      => $this->created_at,
            'updated_at'      => $this->updated_at,
            'deleted_at'      => $this->deleted_at,
            'current_version' => new QuestionVersionResource(resource: $this->whenLoaded(relationship: 'currentVersion')),
            'versions'        => QuestionVersionResource::collection(resource: $this->whenLoaded(relationship: 'versions')),
            'media'           => QuestionMediaResource::collection(resource: $this->whenLoaded(relationship: 'media')),
        ];
    }
}
