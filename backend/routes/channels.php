<?php

declare(strict_types=1);

use App\Broadcasting\SessionChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    channel: 'session.{gamePin}',
    callback: SessionChannel::class
);
