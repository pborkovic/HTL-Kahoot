<?php

declare(strict_types=1);

namespace App\Events;

class GameFinished extends BaseSessionEvent
{
    public function broadcastAs(): string
    {
        return 'GameFinished';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'status' => 'finished',
        ];
    }
}
