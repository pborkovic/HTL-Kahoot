<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CreateSessionDto;
use App\Models\Session;
use App\Models\SessionParticipant;
use App\Models\User;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\SessionServiceContract;
use InvalidArgumentException;
use RuntimeException;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SessionService extends BaseService implements SessionServiceContract
{
    protected SessionRepositoryContract $repository;

    public function __construct(SessionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function findByGamePin(string $gamePin): Session
    {
        return $this->repository->findByGamePinWithParticipantsOrFail(gamePin: $gamePin);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function createGame(CreateSessionDto $dto, User $host): Session
    {
        $gamePin = $this->repository->generateUniqueGamePin();

        $qrCodeDataUri = $this->generateQrCodeDataUri(gamePin: $gamePin);

        $session = $this->repository->create(data: [
            'quiz_id' => $dto->quizId,
            'host_id' => $host->id,
            'game_pin' => $gamePin,
            'qr_code_url' => $qrCodeDataUri,
            'status' => 'lobby',
        ]);

        return $session->load(relations: ['quiz', 'host']);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function joinSession(string $gamePin, User $user): SessionParticipant
    {
        $session = $this->repository->findByGamePin(gamePin: $gamePin);

        if (!$session) {
            throw new InvalidArgumentException(message: 'Kein Spiel mit diesem Code gefunden.');
        }

        if ($session->status !== 'lobby') {
            throw new RuntimeException(message: 'Dieses Spiel hat bereits begonnen oder ist beendet.');
        }

        $existing = $session->participants()
            ->where(column: 'user_id', operator: '=', value: $user->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        $nickname = $user->display_name ?? $user->username ?? explode(separator: '@', string: $user->email)[0];

        return $session->participants()->create(attributes: [
            'user_id' => $user->id,
            'nickname' => $nickname,
            'total_score' => 0,
            'is_connected' => true,
            'joined_at' => now(),
        ]);
    }

    /**
     * @inheritDoc
     *
     * @author Philipp Borkovic
     */
    public function generateQrCodeDataUri(string $gamePin): string
    {
        $joinUrl = config('app.frontend_url', config('app.url')) . '/join/' . $gamePin;

        $qrCode = QrCode::format('svg')
            ->size(300)
            ->margin(1)
            ->generate($joinUrl);

        return 'data:image/svg+xml;base64,' . base64_encode($qrCode);
    }

    public function getModelForPolicy(): string
    {
        return Session::class;
    }
}
