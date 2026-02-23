<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gamble_uses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('participant_id');
            $table->uuid('session_question_id');
            $table->decimal('multiplier', 3, 2);
            $table->timestampTz('used_at');

            $table->foreign('participant_id')->references('id')->on('session_participants')->cascadeOnDelete();
            $table->foreign('session_question_id')->references('id')->on('session_questions')->cascadeOnDelete();

            $table->unique(['participant_id', 'session_question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gamble_uses');
    }
};
