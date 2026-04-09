<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_feedback', function (Blueprint $table) {
            $table->string('moderation_status', 16)
                ->default('pending')
                ->after('is_constructive');
            $table->index('moderation_status');
        });
    }

    public function down(): void
    {
        Schema::table('platform_feedback', function (Blueprint $table) {
            $table->dropIndex(['moderation_status']);
            $table->dropColumn('moderation_status');
        });
    }
};
