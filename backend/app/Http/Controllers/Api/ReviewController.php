<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewApplicationRequest;
use App\Models\Application as RecruitmentApplication;
use App\Models\Review;
use App\Services\ApplicationStatusService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = RecruitmentApplication::with(['vacancy.department.college', 'user.profile', 'documents.documentType', 'reviews.reviewer'])
            ->whereIn('status', ['Submitted', 'Under Review', 'Shortlisted', 'Not Shortlisted']);

        return response()->json($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(ReviewApplicationRequest $request, RecruitmentApplication $application, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validated();
        $data['total_score'] = collect($data)->only(['qualification_score', 'experience_score', 'publication_score', 'fit_score'])->sum();
        $data['reviewer_id'] = $request->user()->id;

        $review = Review::updateOrCreate(
            ['application_id' => $application->id, 'reviewer_id' => $request->user()->id],
            $data
        );

        $status = $data['decision'] === 'rejected' ? 'Not Shortlisted' : 'Under Review';
        $statuses->change($application, $status, $status === 'Not Shortlisted'
            ? 'Your application has been reviewed and was not shortlisted for the next stage.'
            : 'Your application is now under review by the recruitment team.'
        );
        $audit->log('application_reviewed', "Reviewed {$application->application_number}.", ['application_id' => $application->id], $request);

        return response()->json($review->load('application'));
    }
}
