<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InterviewScoreRequest;
use App\Models\Application as RecruitmentApplication;
use App\Models\InterviewPanelMember;
use App\Models\InterviewSchedule;
use App\Models\InterviewScore;
use App\Models\User;
use App\Services\ApplicationStatusService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $query = InterviewSchedule::with(['vacancy.department', 'applications.user.profile', 'panelMembers.user', 'scores.panelMember']);

        if ($request->user()->hasRole('panel_member')) {
            $query->whereHas('panelMembers', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        return response()->json($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function panelMembers()
    {
        return response()->json(User::whereHas('roles', fn ($query) => $query->where('name', 'panel_member'))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']));
    }

    public function store(Request $request, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validate([
            'vacancy_id' => ['required', 'exists:vacancies,id'],
            'title' => ['required', 'string', 'max:255'],
            'batch_name' => ['nullable', 'string', 'max:120'],
            'interview_date' => ['required', 'date'],
            'interview_time' => ['nullable', 'date_format:H:i'],
            'venue' => ['nullable', 'string', 'max:255'],
            'mode' => ['required', 'in:physical,online'],
            'meeting_link' => ['nullable', 'url'],
            'application_ids' => ['array'],
            'application_ids.*' => ['exists:applications,id'],
            'panel_member_ids' => ['array'],
            'panel_member_ids.*' => ['exists:users,id'],
        ]);

        $schedule = DB::transaction(function () use ($data) {
            $schedule = InterviewSchedule::create(collect($data)->except(['application_ids', 'panel_member_ids'])->all());
            $schedule->applications()->sync($data['application_ids'] ?? []);
            foreach ($data['panel_member_ids'] ?? [] as $userId) {
                InterviewPanelMember::firstOrCreate(['interview_schedule_id' => $schedule->id, 'user_id' => $userId]);
            }

            return $schedule;
        });

        foreach ($schedule->applications as $application) {
            $message = "Your interview for {$schedule->vacancy->title} has been scheduled for {$schedule->interview_date->toFormattedDateString()}.";
            $statuses->change($application, 'Interview Scheduled', $message);
        }
        $audit->log('interview_scheduled', "Created interview schedule {$schedule->title}.", ['schedule_id' => $schedule->id], $request);

        return response()->json($schedule->load(['vacancy.department', 'applications.user.profile', 'panelMembers.user', 'scores.panelMember']), 201);
    }

    public function score(InterviewScoreRequest $request, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validated();
        $data['panel_member_id'] = $request->user()->id;
        $data['total_score'] = $data['technical_score'] + $data['communication_score'] + $data['leadership_score'];

        $score = InterviewScore::updateOrCreate(
            [
                'interview_schedule_id' => $data['interview_schedule_id'],
                'application_id' => $data['application_id'],
                'panel_member_id' => $request->user()->id,
            ],
            $data
        );

        $application = RecruitmentApplication::findOrFail($data['application_id']);
        $status = $data['decision'] === 'recommended' ? 'Recommended' : 'Interview Completed';
        $statuses->change($application, $status, $status === 'Recommended'
            ? 'Your interview has been completed and your application has been recommended for final consideration.'
            : 'Your interview has been completed. Please continue tracking your application for final updates.'
        );
        $audit->log('interview_scored', "Scored interview for {$application->application_number}.", ['application_id' => $application->id], $request);

        return response()->json($score);
    }
}
