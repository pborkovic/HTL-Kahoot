<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('user_id')->nullable();
            $table->string('nickname', 50);
            $table->integer('total_score')->default(0);
            $table->boolean('is_connected')->default(true);
            $table->timestampTz('joined_at');
            $table->timestampTz('left_at')->nullable();

            $table->foreign('session_id')->references('id')->on('sessions')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->index('session_id');
        });

        DB::statement(
            'CREATE UNIQUE INDEX session_participants_session_user_unique '
            . 'ON session_participants (session_id, user_id) WHERE user_id IS NOT NULL'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('session_participants');
    }
};
