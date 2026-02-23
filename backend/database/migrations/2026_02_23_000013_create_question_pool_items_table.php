<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_pool_items', function (Blueprint $table) {
            $table->uuid('pool_id');
            $table->uuid('question_id');
            $table->timestampTz('added_at')->useCurrent();

            $table->primary(['pool_id', 'question_id']);

            $table->foreign('pool_id')->references('id')->on('question_pools')->cascadeOnDelete();
            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_pool_items');
    }
};
