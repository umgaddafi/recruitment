<?php

namespace App\Services;

use App\Mail\ApplicationApproved;
use App\Mail\ApplicationStatusChanged;
use App\Models\Application as RecruitmentApplication;
use App\Models\RecruitmentNotification;
use Illuminate\Support\Facades\Mail;

class ApplicationStatusService
{
    public function __construct(private readonly StaffOnboardingService $staffOnboarding)
    {
    }

    public function change(RecruitmentApplication $application, string $status, string $message = ''): bool
    {
        $previous = $application->status;
        if ($previous === $status) {
            if ($status === 'Approved') {
                $this->staffOnboarding->createFromApprovedApplication($application);
            }

            return false;
        }

        $application->update(['status' => $status]);
        $application->refresh()->loadMissing(['user.profile', 'vacancy.department']);

        if ($status === 'Approved') {
            $this->staffOnboarding->createFromApprovedApplication($application);
        }

        RecruitmentNotification::create([
            'user_id' => $application->user_id,
            'title' => 'Application status updated',
            'message' => $message ?: "Your application {$application->application_number} moved from {$previous} to {$status}.",
        ]);

        Mail::to($application->user)->send($status === 'Approved'
            ? new ApplicationApproved($application)
            : new ApplicationStatusChanged($application, $previous, $message));

        return true;
    }
}
