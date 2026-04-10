<?php

declare(strict_types=1);

namespace App\Events;

class QuestionOpened extends BaseSessionEvent
{
    public function __construct(
        string $gamePin,
        public readonly int $questionIndex,
        public readonly int $totalQuestions,
    ) {
        parent::__construct(gamePin: $gamePin);
    }

    public function broadcastAs(): string
    {
        return 'QuestionOpened';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'question_index' => $this->questionIndex,
            'total_questions' => $this->totalQuestions,
        ];
    }
}
