<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('o_level_results', function (Blueprint $table) {
            if (! Schema::hasColumn('o_level_results', 'school_name')) {
                $table->string('school_name')->nullable()->after('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('o_level_results', function (Blueprint $table) {
            if (Schema::hasColumn('o_level_results', 'school_name')) {
                $table->dropColumn('school_name');
            }
        });
    }
};
