<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'email'         => $this->email,
            'username'      => $this->username,
            'display_name'  => $this->display_name,
            'class_name'    => $this->class_name,
            'auth_provider' => $this->auth_provider,
            'is_active'     => $this->is_active,
            'totp_enabled'  => $this->totp_enabled,
            'last_login_at' => $this->last_login_at,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
            'deleted_at'    => $this->deleted_at,
            'roles'         => $this->whenLoaded('roles', fn() => $this->roles->pluck('name')),
        ];
    }
}
