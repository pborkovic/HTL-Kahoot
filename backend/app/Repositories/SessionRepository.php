<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Session;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SessionRepositoryContract;
use Exception;
use Illuminate\Support\Facades\Log;

class SessionRepository extends BaseRepository implements SessionRepositoryContract
{
    public function __construct(Session $model)
    {
        parent::__construct(model: $model);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePin(string $gamePin): ?Session
    {
        try {
            return $this->model
                ->where(column: 'game_pin', operator: '=', value: $gamePin)
                ->first();
        } catch (Exception $e) {
            Log::error(message: "Error finding session by game pin: {$e->getMessage()}", context: [
                'model'    => get_class(object: $this->model),
                'game_pin' => $gamePin,
                'trace'    => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinWithParticipantsOrFail(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->with(relations: 'participants')
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinOrFail(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePinWithQuizQuestions(string $gamePin): Session
    {
        return $this->model
            ->where(column: 'game_pin', operator: '=', value: $gamePin)
            ->with(relations: [
                'quiz.quizQuestions' => fn($q) => $q->orderBy(column: 'sort_order'),
                'quiz.quizQuestions.questionVersion.answerOptions',
            ])
            ->firstOrFail();
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function generateUniqueGamePin(): string
    {
        do {
            $pin = str_pad(
                string: (string) random_int(min: 0, max: 99999999),
                length: 8,
                pad_string: '0',
                pad_type: STR_PAD_LEFT
            );
        } while ($this->exists(field: 'game_pin', value: $pin));

        return $pin;
    }
}
