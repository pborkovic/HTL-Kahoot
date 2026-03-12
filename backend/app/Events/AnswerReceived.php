<?php

declare(strict_types=1);

namespace App\Events;

class AnswerReceived extends BaseSessionEvent
{
    public function __construct(
        string $gamePin,
        public readonly int $totalResponses,
        public readonly int $totalParticipants,
    ) {
        parent::__construct(gamePin: $gamePin);
    }

    public function broadcastAs(): string
    {
        return 'AnswerReceived';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'total_responses'    => $this->totalResponses,
            'total_participants' => $this->totalParticipants,
        ];
    }
}
