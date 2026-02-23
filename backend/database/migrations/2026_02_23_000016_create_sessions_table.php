<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quiz_id');
            $table->uuid('host_id');
            $table->string('game_pin', 8)->unique();
            $table->text('qr_code_url')->nullable();
            $table->string('status', 20)->default('lobby');
            $table->smallInteger('current_question_idx')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('finished_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();
            $table->foreign('host_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index('game_pin');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
