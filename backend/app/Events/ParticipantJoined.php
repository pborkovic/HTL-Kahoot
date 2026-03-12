<?php

declare(strict_types=1);

namespace App\Events;

class ParticipantJoined extends BaseSessionEvent
{
    public function __construct(
        string $gamePin,
        public readonly string $participantId,
        public readonly string $nickname,
        public readonly string $joinedAt,
    ) {
        parent::__construct(gamePin: $gamePin);
    }

    public function broadcastAs(): string
    {
        return 'ParticipantJoined';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'participant_id' => $this->participantId,
            'nickname'       => $this->nickname,
            'is_connected'   => true,
            'joined_at'      => $this->joinedAt,
        ];
    }
}
