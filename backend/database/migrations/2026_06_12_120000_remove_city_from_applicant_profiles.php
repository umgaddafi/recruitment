<?php

use App\Models\Application;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1) Purge `city` from existing application snapshots
        Application::cursor()->each(function (Application $application) {
            $snapshot = $application->snapshot;
            if (! is_array($snapshot) && ! $snapshot) return;
            $snapshot = (array) $snapshot;
            if (isset($snapshot['profile']) && is_array($snapshot['profile']) && array_key_exists('city', $snapshot['profile'])) {
                unset($snapshot['profile']['city']);
                $application->snapshot = $snapshot;
                $application->save();
            }
        });

        // 2) Drop the city column from applicant_profiles
        try {
            Schema::table('applicant_profiles', function (Blueprint $table) {
                $table->dropColumn('city');
            });
        } catch (\Exception $e) {
            // Fallback for SQLite or DBs that cannot drop column directly: recreate table without the column.
            $driver = DB::getDriverName();
            if ($driver === 'sqlite') {
                DB::beginTransaction();
                try {
                    // create a new table from select (this loses indexes/constraints; acceptable for migration fallback)
                    DB::statement('CREATE TABLE applicant_profiles_new AS SELECT id, user_id, application_number, first_name, middle_name, last_name, gender, date_of_birth, nationality, state_of_origin, local_government, address, country, highest_qualification, current_employer, passport_path, created_at, updated_at FROM applicant_profiles');
                    DB::statement('DROP TABLE applicant_profiles');
                    DB::statement('ALTER TABLE applicant_profiles_new RENAME TO applicant_profiles');
                    DB::commit();
                } catch (\Exception $ex) {
                    DB::rollBack();
                    throw $ex;
                }
            } else {
                // rethrow for unknown drivers
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->string('city')->nullable()->after('address');
        });
    }
};
