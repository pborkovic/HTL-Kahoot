<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('external_id', 255)->unique()->nullable();
            $table->string('email', 255)->unique();
            $table->string('username', 100)->unique()->nullable();
            $table->string('password_hash', 255)->nullable();
            $table->string('auth_provider', 50)->default('local');
            $table->string('totp_secret', 255)->nullable();
            $table->boolean('totp_enabled')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('last_login_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('email');
            $table->index('external_id');
            $table->index('auth_provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
