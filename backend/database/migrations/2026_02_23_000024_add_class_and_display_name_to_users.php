<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name', 255)->nullable()->after('username');
            $table->string('class_name', 20)->nullable()->after('display_name');
            $table->index('class_name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['class_name']);
            $table->dropColumn(['display_name', 'class_name']);
        });
    }
};
