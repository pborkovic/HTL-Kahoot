<?php

namespace App\Repositories;

use App\Models\Session;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SessionRepositoryContract;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SessionRepository extends BaseRepository implements SessionRepositoryContract
{
    public function __construct(Session $model)
    {
        parent::__construct(model: $model);
    }

    public function findByGamePin(string $gamePin): ?Session
    {
        try {
            return $this->model
                ->where(column: 'game_pin', operator: '=', value: $gamePin)
                ->first();
        } catch (Exception $e) {
            Log::error("Error finding session by game pin: {$e->getMessage()}", [
                'model' => get_class($this->model),
                'game_pin' => $gamePin,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    public function generateUniqueGamePin(): string
    {
        do {
            $pin = str_pad(
                string: (string) random_int(0, 99999999),
                length: 8,
                pad_string: '0',
                pad_type: STR_PAD_LEFT
            );
        } while ($this->exists(field: 'game_pin', value: $pin));

        return $pin;
    }
}
