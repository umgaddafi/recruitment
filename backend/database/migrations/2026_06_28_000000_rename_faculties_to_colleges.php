<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign keys before renaming
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['faculty_id']);
        });

        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropForeign(['faculty_id']);
        });

        // Rename the faculties table to colleges
        Schema::rename('faculties', 'colleges');

        // Rename faculty_id → college_id in departments and recreate the FK
        Schema::table('departments', function (Blueprint $table) {
            $table->renameColumn('faculty_id', 'college_id');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('college_id')->references('id')->on('colleges')->nullOnDelete();
        });

        // Rename faculty_id → college_id in vacancies and recreate the FK
        Schema::table('vacancies', function (Blueprint $table) {
            $table->renameColumn('faculty_id', 'college_id');
        });

        Schema::table('vacancies', function (Blueprint $table) {
            $table->foreign('college_id')->references('id')->on('colleges')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['college_id']);
        });

        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropForeign(['college_id']);
        });

        Schema::rename('colleges', 'faculties');

        Schema::table('departments', function (Blueprint $table) {
            $table->renameColumn('college_id', 'faculty_id');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('faculty_id')->references('id')->on('faculties')->nullOnDelete();
        });

        Schema::table('vacancies', function (Blueprint $table) {
            $table->renameColumn('college_id', 'faculty_id');
        });

        Schema::table('vacancies', function (Blueprint $table) {
            $table->foreign('faculty_id')->references('id')->on('faculties')->nullOnDelete();
        });
    }
};
