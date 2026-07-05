<?php

namespace App\Services;

use App\Models\Application as RecruitmentApplication;
use Barryvdh\DomPDF\Facade\Pdf;

class ApplicationPdfService
{
    public function render(RecruitmentApplication $application): string
    {
        $application->loadMissing(['user.profile', 'vacancy.department']);
        $profile = $application->user->profile;
        $name = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;

        $candidateNumber = $application->application_number ?: 'N/A';
        $vacancy = $application->vacancy->title ?: 'N/A';
        $role = $application->vacancy->rank_or_grade ?: $application->vacancy->staff_category ?: 'N/A';
        $department = $application->vacancy->department?->name ?: 'General';
        $status = ucfirst($application->status);
        $submittedAt = $application->submitted_at?->format('M d, Y h:i A') ?: 'Not submitted';

        $education = \App\Models\EducationalQualification::where('user_id', $application->user_id)->get();
        $olevels = \App\Models\OLevelResult::where('user_id', $application->user_id)->get();
        $experience = \App\Models\WorkExperience::where('user_id', $application->user_id)->get();
        $certifications = \App\Models\Certification::where('user_id', $application->user_id)->get();
        $referees = $profile?->application_wizard_payload['referees'] ?? [];

        $data = compact(
            'name',
            'candidateNumber',
            'vacancy',
            'role',
            'department',
            'status',
            'submittedAt',
            'profile',
            'education',
            'olevels',
            'experience',
            'certifications',
            'referees'
        );

        return Pdf::setOption(['isRemoteEnabled' => true])->loadView('pdf.application-slip', $data)->output();
    }

    public function renderAppointmentLetter(RecruitmentApplication $application): string
    {
        $application->loadMissing(['user.profile', 'vacancy.department', 'staff']);
        $profile = $application->user->profile;
        $vacancy = $application->vacancy;
        $name = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;
        $firstName = $profile?->first_name ?: (explode(' ', $application->user->name)[0] ?? 'Applicant');
        $department = $vacancy->department?->name ?: 'the relevant Department';
        $role = $vacancy->title ?: 'the approved position';
        $grade = $vacancy->rank_or_grade ?: $vacancy->staff_category;
        $date = optional($application->updated_at)->format('jS F, Y') ?: now()->format('jS F, Y');
        $reference = 'R/OPA/JOSTUM/PF/'.($application->staff?->pf_number ?: str_pad($application->id, 4, '0', STR_PAD_LEFT));

        $address_line_1 = $profile?->address ?: '12 University Road,';
        $address_line_2 = $profile?->state ? ($profile->city ? $profile->city . ', ' . $profile->state . '.' : $profile->state . '.') : 'Makurdi, Benue State.';

        $data = compact(
            'name',
            'firstName',
            'department',
            'role',
            'grade',
            'date',
            'reference',
            'address_line_1',
            'address_line_2'
        );

        return Pdf::setOption(['isRemoteEnabled' => true])->loadView('pdf.appointment-letter', $data)->output();
    }


}
