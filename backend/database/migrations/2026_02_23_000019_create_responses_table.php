<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_question_id');
            $table->uuid('participant_id');
            $table->jsonb('answer');
            $table->boolean('is_correct')->nullable();
            $table->integer('score_awarded')->default(0);
            $table->integer('time_taken_ms')->nullable();
            $table->decimal('gamble_multiplier', 3, 2)->default(1.00);
            $table->timestampTz('submitted_at');

            $table->foreign('session_question_id')->references('id')->on('session_questions')->cascadeOnDelete();
            $table->foreign('participant_id')->references('id')->on('session_participants')->cascadeOnDelete();

            $table->unique(['session_question_id', 'participant_id']);
        });

        DB::statement('CREATE INDEX responses_answer_gin_index ON responses USING gin (answer)');
    }

    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};
