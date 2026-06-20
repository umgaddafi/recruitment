<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\FinalApproval;
use App\Services\ApplicationStatusService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class FinalApprovalController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(RecruitmentApplication::with([
            'user.profile',
            'vacancy.department.faculty',
            'documents.documentType',
            'reviews.reviewer',
            'finalApproval',
            'staff',
        ])
            ->whereIn('status', ['Recommended', 'Approved', 'Rejected'])
            ->latest()
            ->paginate($request->integer('per_page', 15)));
    }

    public function decide(Request $request, RecruitmentApplication $application, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validate([
            'decision' => ['required', 'in:Approved,Rejected'],
            'reason' => ['nullable', 'string'],
        ]);

        $approval = FinalApproval::updateOrCreate(
            ['application_id' => $application->id],
            ['approved_by' => $request->user()->id, 'decision' => $data['decision'], 'reason' => $data['reason'] ?? null, 'decided_at' => now()]
        );
        $message = $data['decision'] === 'Approved'
            ? "Congratulations. Your application {$application->application_number} has been approved for appointment. Your appointment letter has been sent to your email and is available in your applicant dashboard."
            : "Your application {$application->application_number} was not approved at final consideration.";
        $statuses->change($application, $data['decision'], $message);
        $audit->log('final_approval_decided', "{$data['decision']} {$application->application_number}.", ['application_id' => $application->id], $request);

        return response()->json($approval);
    }
}
