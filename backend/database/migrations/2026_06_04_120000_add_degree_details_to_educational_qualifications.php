<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('educational_qualifications', function (Blueprint $table) {
            if (! Schema::hasColumn('educational_qualifications', 'scale')) {
                $table->string('scale')->nullable()->after('grade');
            }

            if (! Schema::hasColumn('educational_qualifications', 'cgpa')) {
                $table->decimal('cgpa', 4, 2)->nullable()->after('scale');
            }

            if (! Schema::hasColumn('educational_qualifications', 'class_of_degree')) {
                $table->string('class_of_degree')->nullable()->after('cgpa');
            }
        });
    }

    public function down(): void
    {
        Schema::table('educational_qualifications', function (Blueprint $table) {
            foreach (['class_of_degree', 'cgpa', 'scale'] as $column) {
                if (Schema::hasColumn('educational_qualifications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
