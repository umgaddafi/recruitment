<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->unsignedTinyInteger('application_wizard_step')->default(0)->after('passport_path');
            $table->json('application_wizard_payload')->nullable()->after('application_wizard_step');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropColumn(['application_wizard_step', 'application_wizard_payload']);
        });
    }
};
