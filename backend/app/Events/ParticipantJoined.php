<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantJoined implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        private readonly string $gamePin,
        public readonly string $participantId,
        public readonly string $nickname,
        public readonly string $joinedAt,
    ) {}

    /**
     * @return array<int, PresenceChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel(name: 'session.' . $this->gamePin),
        ];
    }

    /**
     * @return array<string, mixed>
     */
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
