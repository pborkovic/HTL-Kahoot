<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'permissions' => $this->whenLoaded(relationship: 'permissions', value: fn () => $this->permissions->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->key,
            ])),
        ];
    }
}
