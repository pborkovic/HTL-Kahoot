<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformFeedback extends Model
{
    use HasUuids;

    protected $table = 'platform_feedback';

    protected $guarded = [];

    protected $casts = [
        'is_constructive' => 'bool',
        'moderation_status' => 'string',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The user who submitted the feedback.
     *
     * @return BelongsTo<User, self>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(
            related: User::class,
            foreignKey: 'user_id'
        );
    }

    /**
     * The admin user who marked the feedback as resolved.
     *
     * @return BelongsTo<User, self>
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(
            related: User::class,
            foreignKey: 'resolved_by'
        );
    }
}
