<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('created_by');
            $table->string('type', 50);
            $table->uuid('current_version_id')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();

            $table->index('type');
            $table->index('created_by');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
