<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('o_level_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('school_name')->nullable();
            $table->string('exam_number');
            $table->unsignedSmallInteger('exam_year');
            $table->string('exam_type', 20);
            $table->json('subjects');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('o_level_results');
    }
};
