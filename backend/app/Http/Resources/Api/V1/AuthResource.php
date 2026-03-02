<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for the authentication response.
 *
 * Wraps the authenticated user (via UserResource) and the Sanctum token.
 */
class AuthResource extends JsonResource
{
    private string $token;

    /**
     * @param mixed $resource The authenticated User model.
     * @param string $token The plain-text Sanctum API token.
     *
     * @author Philipp Borkovic
     */
    public function __construct($resource, string $token)
    {
        parent::__construct($resource);
        $this->token = $token;
    }

    public function toArray(Request $request): array
    {
        return [
            'user'  => new UserResource($this->resource),
            'token' => $this->token,
        ];
    }
}
