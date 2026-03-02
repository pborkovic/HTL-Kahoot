<?php

namespace App\DTOs;

use App\Http\Requests\Api\V1\CreateSessionRequest;

/**
 * Data transfer object for creating a new game session.
 */
readonly class CreateSessionDto
{
    /**
     * @param string $quizId The UUID of the quiz to create a session for.
     *
     * @author Philipp Borkovic
     */
    public function __construct(
        public string $quizId,
    ) {}

    /**
     * Create a new instance from a validated session creation request.
     *
     * @param CreateSessionRequest $request The validated request.
     *
     * @return self
     *
     * @author Philipp Borkovic
     */
    public static function fromRequest(CreateSessionRequest $request): self
    {
        return new self(
            quizId: $request->validated('quiz_id'),
        );
    }
}
