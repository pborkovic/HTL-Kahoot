<?php

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use App\Repositories\Contracts\SessionRepositoryContract;
use App\Services\Base\BaseService;
use App\Services\Contracts\SessionServiceContract;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SessionService extends BaseService implements SessionServiceContract
{
    protected SessionRepositoryContract $repository;

    public function __construct(SessionRepositoryContract $repository)
    {
        $this->repository = $repository;
    }

    /**
     * {@inheritDoc}
     *
     * @author Philipp Borkovic
     */
    public function createGame(string $quizId, User $host): Session
    {
        $gamePin = $this->repository->generateUniqueGamePin();

        $qrCodeDataUri = $this->generateQrCodeDataUri(gamePin: $gamePin);

        $session = $this->repository->create(data: [
            'quiz_id' => $quizId,
            'host_id' => $host->id,
            'game_pin' => $gamePin,
            'qr_code_url' => $qrCodeDataUri,
            'status' => 'lobby',
        ]);

        return $session->load(relations: ['quiz', 'host']);
    }

    /**
     * {@inheritDoc}
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
