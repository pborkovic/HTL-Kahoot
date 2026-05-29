<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('question_department', function (Blueprint $table) {
            $table->uuid('question_id');
            $table->uuid('department_id');

            $table->primary(['question_id', 'department_id']);

            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
            $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();

            $table->index('department_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_department');
    }
};
