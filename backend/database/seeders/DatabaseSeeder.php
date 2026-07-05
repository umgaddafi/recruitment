<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\ApplicantProfile;
use App\Models\College;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\EducationalQualification;
use App\Models\FinalApproval;
use App\Models\InterviewPanelMember;
use App\Models\InterviewSchedule;
use App\Models\Permission;
use App\Models\RecruitmentNotification;
use App\Models\Review;
use App\Models\Role;
use App\Models\Shortlist;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage_users', 'manage_vacancies', 'review_applications', 'manage_shortlists',
            'manage_interviews', 'score_interviews', 'approve_final_candidates',
            'view_reports', 'manage_settings', 'view_audit_logs', 'submit_applications',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission], ['label' => str($permission)->replace('_', ' ')->headline()]);
        }

        $rolePermissions = [
            'super_admin' => $permissions,
            'hr_admin' => ['manage_vacancies', 'manage_shortlists', 'manage_interviews', 'view_reports'],
            'reviewer' => ['review_applications'],
            'panel_member' => ['score_interviews'],
            'applicant' => ['submit_applications'],
            'registrar' => ['approve_final_candidates', 'view_reports'],
        ];

        $roles = [
            'super_admin' => 'Super Admin',
            'hr_admin' => 'HR/Admin Officer',
            'reviewer' => 'Department/College Reviewer',
            'panel_member' => 'Interview Panel Member',
            'applicant' => 'Applicant',
            'registrar' => 'Registrar/Final Approval Officer',
        ];

        foreach ($roles as $name => $label) {
            $role = Role::firstOrCreate(['name' => $name], ['label' => $label]);
            $role->permissions()->sync(Permission::whereIn('name', $rolePermissions[$name])->pluck('id'));
        }

        $users = [
            ['Super Admin', 'superadmin@uam.edu.ng', 'super_admin'],
            ['HR Officer', 'hr@uam.edu.ng', 'hr_admin'],
            ['College Reviewer', 'reviewer@uam.edu.ng', 'reviewer'],
            ['Panel Member', 'panel@uam.edu.ng', 'panel_member'],
            ['Registrar', 'registrar@uam.edu.ng', 'registrar'],
            ['Ada Applicant', 'applicant@gmail.com', 'applicant'],
        ];

        foreach ($users as [$name, $email, $role]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => '+2348000000000',
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );
            $user->roles()->syncWithoutDetaching(Role::where('name', $role)->value('id'));
        }

        $science = College::firstOrCreate(['code' => 'SCI'], ['name' => 'College of Science', 'description' => 'Academic departments in pure and applied sciences.']);
        $admin = College::firstOrCreate(['code' => 'ADM'], ['name' => 'Administration', 'description' => 'Central administrative and registry operations.']);
        $cs = Department::firstOrCreate(['code' => 'CSC'], ['college_id' => $science->id, 'name' => 'Computer Science', 'type' => 'academic']);
        $registry = Department::firstOrCreate(['code' => 'REG'], ['college_id' => $admin->id, 'name' => 'Registry', 'type' => 'non-academic']);

        $documentTypes = [
            ['Passport Photograph', 'passport_photograph', true],
            ['CV', 'cv', true],
            ['Degree Certificates', 'degree_certificates', true],
            ['O-Level Certificate', 'o_level_certificate', true],
            ['NYSC Certificate or Exemption Letter', 'nysc_certificate', true],
            ['Professional Certificates', 'professional_certificates', false],
            ['Birth Certificate or Declaration of Age', 'birth_certificate', true],
            ['Local Government/State of Origin Certificate', 'state_origin_certificate', true],
            ['Cover Letter', 'cover_letter', false],
        ];

        foreach ($documentTypes as [$name, $slug, $required]) {
            DocumentType::firstOrCreate(['slug' => $slug], ['name' => $name, 'is_required_by_default' => $required]);
        }

        $lecturer = Vacancy::firstOrCreate(
            ['title' => 'Lecturer II - Software Engineering'],
            [
                'college_id' => $science->id,
                'department_id' => $cs->id,
                'employment_type' => 'Full-time',
                'staff_category' => 'Academic',
                'rank_or_grade' => 'Lecturer II',
                'vacant_positions' => 3,
                'minimum_qualification' => 'PhD or MSc with strong research evidence',
                'required_documents' => ['CV', 'Degree Certificates', 'NYSC Certificate or Exemption Letter'],
                'requirements' => ['Evidence of teaching competence', 'Research publications or demonstrable research promise', 'NYSC certificate or valid exemption letter'],
                'job_description' => 'Teach undergraduate and postgraduate software engineering courses, supervise projects, publish research, and support departmental service.',
                'eligibility_criteria' => 'Candidates must demonstrate teaching competence, research promise, and professional integrity.',
                'start_date' => now()->subDays(7),
                'deadline' => now()->addDays(45),
                'status' => 'published',
                'created_by' => User::where('email', 'hr@uam.edu.ng')->value('id'),
            ]
        );

        Vacancy::firstOrCreate(
            ['title' => 'Assistant Registrar - Admissions'],
            [
                'college_id' => $admin->id,
                'department_id' => $registry->id,
                'employment_type' => 'Full-time',
                'staff_category' => 'Non-Academic',
                'rank_or_grade' => 'Administrative Staff',
                'vacant_positions' => 2,
                'minimum_qualification' => 'Bachelor degree with relevant administrative experience',
                'required_documents' => ['CV', 'Degree Certificates', 'NYSC Certificate or Exemption Letter'],
                'requirements' => ['Strong written communication', 'Records management experience', 'University administration experience is an advantage'],
                'job_description' => 'Coordinate admissions documentation, records, applicant correspondence, and compliance reporting.',
                'eligibility_criteria' => 'Strong writing, records management, and university administration experience required.',
                'start_date' => now()->subDays(3),
                'deadline' => now()->addDays(30),
                'status' => 'published',
                'created_by' => User::where('email', 'hr@uam.edu.ng')->value('id'),
            ]
        );

        $applicant = User::where('email', 'applicant@gmail.com')->first();
        ApplicantProfile::updateOrCreate(
            ['user_id' => $applicant->id],
            [
                'first_name' => 'Ada',
                'last_name' => 'Applicant',
                'gender' => 'Female',
                'date_of_birth' => '1994-04-12',
                'nationality' => 'Nigerian',
                'state_of_origin' => 'Lagos',
                'local_government' => 'Ikeja',
                'address' => '12 University Road',
                'country' => 'Nigeria',
                'highest_qualification' => 'MSc Computer Science',
                'current_employer' => 'Tech Institute',
            ]
        );
        EducationalQualification::firstOrCreate(
            ['user_id' => $applicant->id, 'institution' => 'University of Lagos', 'qualification' => 'MSc Computer Science'],
            ['field_of_study' => 'Software Engineering', 'grade' => 'Distinction', 'start_year' => 2018, 'end_year' => 2020]
        );

        $application = Application::firstOrCreate(
            ['user_id' => $applicant->id, 'vacancy_id' => $lecturer->id],
            [
                'application_number' => 'UNI-REC-'.now()->year.'-000123',
                'status' => 'Recommended',
                'cover_letter' => 'I am interested in contributing to teaching, research, and departmental innovation.',
                'submitted_at' => now()->subDays(2),
                'locked_at' => now()->subDays(2),
                'snapshot' => ['profile' => ['highest_qualification' => 'MSc Computer Science']],
            ]
        );

        Review::updateOrCreate(
            ['application_id' => $application->id, 'reviewer_id' => User::where('email', 'reviewer@uam.edu.ng')->value('id')],
            ['qualification_score' => 22, 'experience_score' => 18, 'publication_score' => 15, 'fit_score' => 20, 'total_score' => 75, 'decision' => 'recommended', 'comments' => 'Strong applicant for teaching and research potential.']
        );
        Shortlist::firstOrCreate(['application_id' => $application->id], ['shortlisted_by' => User::where('email', 'hr@uam.edu.ng')->value('id'), 'method' => 'manual']);
        $schedule = InterviewSchedule::firstOrCreate(
            ['vacancy_id' => $lecturer->id, 'title' => 'Academic Staff Interview Batch A'],
            ['batch_name' => 'Batch A', 'interview_date' => now()->addDays(14), 'interview_time' => '10:00', 'venue' => 'Senate Chamber', 'mode' => 'physical']
        );
        $schedule->applications()->syncWithoutDetaching([$application->id]);
        InterviewPanelMember::firstOrCreate(['interview_schedule_id' => $schedule->id, 'user_id' => User::where('email', 'panel@uam.edu.ng')->value('id')]);
        FinalApproval::updateOrCreate(['application_id' => $application->id], ['approved_by' => User::where('email', 'registrar@uam.edu.ng')->value('id'), 'decision' => 'pending', 'reason' => 'Awaiting council ratification.']);

        $defaults = [
            'portal_name' => 'University Staff Recruitment Portal',
            'application_prefix' => 'UNI-REC',
            'max_upload_kb' => 4096,
            'iam.password_policy' => [
                'min_length' => 12,
                'require_uppercase' => true,
                'require_numeric' => true,
                'require_special' => true,
            ],
            'iam.session_lifetime_minutes' => 60,
            'iam.mfa_required_roles' => ['super_admin', 'registrar', 'hr_admin'],
            'recruitment.minimum_score' => ['default' => 60],
            'application.numbering' => ['prefix' => 'UNI-REC', 'next_sequence' => 124, 'reset_yearly' => true, 'padding' => 6],
            'branding' => ['university_name' => 'Joseph Sarwuan Tarka University', 'portal_name' => 'University Staff Recruitment Portal', 'contact_email' => 'recruitment@university.edu'],
            'documents.policy' => ['max_upload_kb' => 4096, 'allowed_mime_types' => ['application/pdf', 'image/jpeg', 'image/png'], 'malware_scan_enabled' => false],
            'system.maintenance_mode' => ['enabled' => false, 'mode' => 'maintenance'],
        ];

        foreach ($defaults as $key => $value) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'system']);
        }

        RecruitmentNotification::firstOrCreate(
            ['user_id' => $applicant->id, 'title' => 'Welcome to the recruitment portal'],
            ['message' => 'Complete your profile and apply for open vacancies.', 'channel' => 'in-app']
        );
    }
}
