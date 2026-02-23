<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->uuid('created_by');
            $table->uuid('pool_id')->nullable();
            $table->string('time_mode', 20)->default('per_question');
            $table->integer('total_time_limit')->nullable();
            $table->boolean('speed_scoring')->default(true);
            $table->decimal('speed_factor_min', 3, 2)->default(0.80);
            $table->decimal('speed_factor_max', 3, 2)->default(1.00);
            $table->smallInteger('gamble_uses')->default(0);
            $table->boolean('randomize_questions')->default(false);
            $table->string('random_mode', 20)->nullable();
            $table->integer('random_count')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('pool_id')->references('id')->on('question_pools')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
