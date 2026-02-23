<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Response extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'answer'       => 'array',
            'is_correct'   => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function sessionQuestion(): BelongsTo
    {
        return $this->belongsTo(SessionQuestion::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(SessionParticipant::class, 'participant_id');
    }
}
