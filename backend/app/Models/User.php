<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'totp_enabled'  => 'boolean',
            'is_active'     => 'boolean',
            'last_login_at' => 'datetime',
            'totp_secret'   => 'encrypted',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash ?? '';
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('assigned_at', 'assigned_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'created_by');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'created_by');
    }

    public function hostedSessions(): HasMany
    {
        return $this->hasMany(Session::class, 'host_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function hasRole(string $role): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', $role);
        }

        return $this->roles()->where('name', $role)->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->whereIn('name', $roles)->isNotEmpty();
        }

        return $this->roles()->whereIn('name', $roles)->exists();
    }
}
