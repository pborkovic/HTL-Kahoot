<?php

declare(strict_types=1);

namespace App\Events;

class GameStarted extends BaseSessionEvent
{
    public function broadcastAs(): string
    {
        return 'GameStarted';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'status' => 'active',
        ];
    }
}
