<?php

declare(strict_types=1);

namespace App\Events;

class QuestionClosed extends BaseSessionEvent
{
    public function __construct(
        string $gamePin,
        public readonly int $questionIndex,
    ) {
        parent::__construct(gamePin: $gamePin);
    }

    public function broadcastAs(): string
    {
        return 'QuestionClosed';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'question_index' => $this->questionIndex,
        ];
    }
}
