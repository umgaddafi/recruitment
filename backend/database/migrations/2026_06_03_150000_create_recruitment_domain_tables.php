<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('status')->default('active')->index()->after('password');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->softDeletes();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('type')->default('academic')->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->boolean('is_required_by_default')->default(false);
            $table->string('allowed_mimes')->default('pdf,jpg,jpeg,png');
            $table->unsignedInteger('max_size_kb')->default(4096);
            $table->timestamps();
        });

        Schema::create('vacancies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employment_type')->default('Full-time')->index();
            $table->string('staff_category')->index();
            $table->string('rank_or_grade')->nullable()->index();
            $table->unsignedSmallInteger('vacant_positions')->default(1);
            $table->string('minimum_qualification');
            $table->json('required_documents')->nullable();
            $table->json('requirements')->nullable();
            $table->longText('job_description');
            $table->longText('eligibility_criteria')->nullable();
            $table->date('start_date')->index();
            $table->date('deadline')->index();
            $table->string('status')->default('draft')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('application_number')->nullable()->unique();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('gender')->nullable()->index();
            $table->date('date_of_birth')->nullable();
            $table->string('nationality')->nullable();
            $table->string('state_of_origin')->nullable();
            $table->string('local_government')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('highest_qualification')->nullable()->index();
            $table->string('current_employer')->nullable();
            $table->string('passport_path')->nullable();
            $table->timestamps();
        });

        Schema::create('educational_qualifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('institution');
            $table->string('qualification');
            $table->string('field_of_study')->nullable();
            $table->string('grade')->nullable();
            $table->string('scale')->nullable();
            $table->decimal('cgpa', 4, 2)->nullable();
            $table->string('class_of_degree')->nullable();
            $table->year('start_year')->nullable();
            $table->year('end_year')->nullable();
            $table->timestamps();
        });

        Schema::create('work_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('organization');
            $table->string('position');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('responsibilities')->nullable();
            $table->timestamps();
        });

        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('issuer')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vacancy_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('Draft')->index();
            $table->longText('cover_letter')->nullable();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->timestamp('locked_at')->nullable();
            $table->json('snapshot')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'vacancy_id']);
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('label');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('qualification_score')->default(0);
            $table->unsignedTinyInteger('experience_score')->default(0);
            $table->unsignedTinyInteger('publication_score')->default(0);
            $table->unsignedTinyInteger('fit_score')->default(0);
            $table->unsignedSmallInteger('total_score')->default(0);
            $table->string('decision')->default('pending')->index();
            $table->text('comments')->nullable();
            $table->timestamps();
        });

        Schema::create('shortlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('shortlisted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('method')->default('manual');
            $table->text('notes')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('interview_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('batch_name')->nullable();
            $table->date('interview_date')->index();
            $table->time('interview_time')->nullable();
            $table->string('venue')->nullable();
            $table->string('mode')->default('physical');
            $table->string('meeting_link')->nullable();
            $table->timestamps();
        });

        Schema::create('interview_applicant', function (Blueprint $table) {
            $table->foreignId('interview_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->timestamp('notified_at')->nullable();
            $table->primary(['interview_schedule_id', 'application_id']);
        });

        Schema::create('interview_panel_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('Panel Member');
            $table->timestamps();
            $table->unique(['interview_schedule_id', 'user_id']);
        });

        Schema::create('interview_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('panel_member_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('technical_score')->default(0);
            $table->unsignedTinyInteger('communication_score')->default(0);
            $table->unsignedTinyInteger('leadership_score')->default(0);
            $table->unsignedSmallInteger('total_score')->default(0);
            $table->string('decision')->default('pending')->index();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['interview_schedule_id', 'application_id', 'panel_member_id'], 'unique_interview_score');
        });

        Schema::create('final_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('decision')->index();
            $table->text('reason')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('channel')->default('in-app');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action')->index();
            $table->string('ip_address')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->string('group')->default('general')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('recruitment_notifications');
        Schema::dropIfExists('final_approvals');
        Schema::dropIfExists('interview_scores');
        Schema::dropIfExists('interview_panel_members');
        Schema::dropIfExists('interview_applicant');
        Schema::dropIfExists('interview_schedules');
        Schema::dropIfExists('shortlists');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('work_experiences');
        Schema::dropIfExists('educational_qualifications');
        Schema::dropIfExists('applicant_profiles');
        Schema::dropIfExists('vacancies');
        Schema::dropIfExists('document_types');
        Schema::dropIfExists('units');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('faculties');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'status', 'last_login_at', 'deleted_at']);
        });
    }
};
