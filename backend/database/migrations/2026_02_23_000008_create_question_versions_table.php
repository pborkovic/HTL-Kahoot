<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('question_id');
            $table->integer('version');
            $table->text('title');
            $table->text('explanation')->nullable();
            $table->smallInteger('difficulty')->nullable();
            $table->integer('default_points')->default(1000);
            $table->integer('default_time_limit')->nullable();
            $table->boolean('randomize_options')->default(true);
            $table->jsonb('config')->default('{}');
            $table->uuid('created_by');
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();

            $table->unique(['question_id', 'version']);
        });

        DB::statement('CREATE INDEX question_versions_config_gin_index ON question_versions USING gin (config)');

        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('question_versions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });

        Schema::dropIfExists('question_versions');
    }
};
