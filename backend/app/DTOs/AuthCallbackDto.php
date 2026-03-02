<?php

namespace App\DTOs;

use App\Http\Requests\Api\V1\AuthCallbackRequest;

/**
 * Data transfer object for the Azure AD OAuth2 callback.
 */
readonly class AuthCallbackDto
{
    /**
     * @param string $code The authorization code received from Azure AD.
     *
     * @author Philipp Borkovic
     */
    public function __construct(
        public string $code,
    ) {}

    /**
     * Create a new instance from a validated auth callback request.
     *
     * @param AuthCallbackRequest $request The validated request.
     *
     * @return self
     *
     * @author Philipp Borkovic
     */
    public static function fromRequest(AuthCallbackRequest $request): self
    {
        return new self(
            code: $request->validated('code'),
        );
    }
}
