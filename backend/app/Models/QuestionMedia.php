<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionMedia extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    protected function url(): Attribute
    {
        return Attribute::get(get: function (string $value): string {
            if (str_starts_with(haystack: $value, needle: 'http') || str_starts_with(haystack: $value, needle: '/')) {
                return $value;
            }

            return '/media/'.$value;
        });
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(related: Question::class);
    }
}
