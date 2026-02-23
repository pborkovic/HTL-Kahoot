<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quiz_id');
            $table->uuid('question_version_id');
            $table->smallInteger('sort_order');
            $table->integer('points_override')->nullable();
            $table->integer('time_limit_override')->nullable();
            $table->decimal('weight', 5, 2)->default(1.00);

            $table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();
            $table->foreign('question_version_id')->references('id')->on('question_versions')->cascadeOnDelete();

            $table->unique(['quiz_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
