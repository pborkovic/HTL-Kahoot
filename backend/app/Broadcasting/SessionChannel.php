<?php

declare(strict_types=1);

namespace App\Broadcasting;

use App\Models\User;
use App\Repositories\Contracts\SessionRepositoryContract;

readonly class SessionChannel
{
    public function __construct(
        private SessionRepositoryContract $repository,
    ) {}

    /**
     * Authorize the user to join the session presence channel.
     *
     * Returns user metadata for presence data if authorized,
     * or false if the user is neither the host nor a participant.
     *
     * @param User   $user    The authenticated user.
     * @param string $gamePin The game pin from the channel name.
     *
     * @return array{id: string, name: string}|false
     *
     * @author Philipp Borkovic
     */
    public function join(User $user, string $gamePin): array|false
    {
        $session = $this->repository->findByGamePin(gamePin: $gamePin);

        if (!$session) {
            return false;
        }

        $isHost = $session->host_id === $user->id;
        $isParticipant = $session->participants()
            ->where(column: 'user_id', operator: '=', value: $user->id)
            ->exists();

        if ($isHost || $isParticipant) {
            return [
                'id'   => $user->id,
                'name' => $user->display_name ?? $user->username ?? $user->email,
            ];
        }

        return false;
    }
}
