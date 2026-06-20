<?php

namespace App\Services;

use App\Models\Application as RecruitmentApplication;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;

class StaffOnboardingService
{
    public function createFromApprovedApplication(RecruitmentApplication $application): Staff
    {
        $application->loadMissing(['user.profile', 'vacancy.department']);

        return DB::transaction(function () use ($application) {
            $staff = Staff::where('application_id', $application->id)->lockForUpdate()->first();
            $profile = $application->user->profile;
            $nameParts = preg_split('/\s+/', trim((string) $application->user->name)) ?: [];

            if (! $staff) {
                $staff = new Staff([
                    'application_id' => $application->id,
                    'pf_number' => $this->nextPfNumber(),
                ]);
            }

            $staff->fill([
                'user_id' => $application->user_id,
                'first_name' => $profile?->first_name ?: ($nameParts[0] ?? 'Applicant'),
                'surname' => $profile?->last_name ?: (count($nameParts) > 1 ? end($nameParts) : 'Candidate'),
                'other_name' => $profile?->middle_name,
                'phone' => $application->user->phone,
                'email' => $application->user->email,
                'department' => $application->vacancy?->department?->name,
                'rank' => $application->vacancy?->rank_or_grade ?: $application->vacancy?->title,
                'appointed_at' => now(),
            ]);

            $staff->save();

            return $staff;
        });
    }

    private function nextPfNumber(): string
    {
        $highest = Staff::query()
            ->lockForUpdate()
            ->pluck('pf_number')
            ->map(fn (string $number) => (int) preg_replace('/\D+/', '', $number))
            ->max() ?? 0;

        return sprintf('PF/%04d', $highest + 1);
    }
}
