<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('vacancies')) {
            return;
        }

        Schema::table('vacancies', function (Blueprint $table) {
            if (!Schema::hasColumn('vacancies', 'vacant_positions')) {
                $table->unsignedSmallInteger('vacant_positions')->default(1)->after('rank_or_grade');
            }

            if (!Schema::hasColumn('vacancies', 'requirements')) {
                $table->json('requirements')->nullable()->after('required_documents');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('vacancies')) {
            return;
        }

        Schema::table('vacancies', function (Blueprint $table) {
            if (Schema::hasColumn('vacancies', 'vacant_positions')) {
                $table->dropColumn('vacant_positions');
            }

            if (Schema::hasColumn('vacancies', 'requirements')) {
                $table->dropColumn('requirements');
            }
        });
    }
};
