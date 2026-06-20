<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\Shortlist;
use App\Models\SystemSetting;
use App\Services\ApplicationStatusService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class ShortlistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Shortlist::with(['application.user.profile', 'application.vacancy.department'])->latest()->paginate($request->integer('per_page', 15)));
    }

    public function store(Request $request, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validate([
            'application_id' => ['required', 'exists:applications,id'],
            'method' => ['nullable', 'in:manual,auto'],
            'notes' => ['nullable', 'string'],
        ]);

        $application = RecruitmentApplication::findOrFail($data['application_id']);
        $shortlist = Shortlist::updateOrCreate(
            ['application_id' => $application->id],
            ['shortlisted_by' => $request->user()->id, 'method' => $data['method'] ?? 'manual', 'notes' => $data['notes'] ?? null]
        );
        $statuses->change($application, 'Shortlisted', "Your application {$application->application_number} has been shortlisted for the next stage.");
        $audit->log('candidate_shortlisted', "Shortlisted {$application->application_number}.", ['application_id' => $application->id], $request);

        return response()->json($shortlist->load('application'));
    }

    public function auto(Request $request, AuditService $audit, ApplicationStatusService $statuses)
    {
        $data = $request->validate(['vacancy_id' => ['required', 'exists:vacancies,id'], 'minimum_score' => ['nullable', 'integer', 'between:0,100']]);
        // If minimum_score not provided, read recruitment minimum from system settings
        $minimum = $data['minimum_score'] ?? 60;
        $setting = SystemSetting::firstWhere('key', 'recruitment.minimum_score');
        if (! $data['minimum_score'] && $setting) {
            $value = $setting->value;
            if (is_array($value) && isset($value['default'])) {
                $minimum = (int) $value['default'];
            } elseif (is_numeric($value)) {
                $minimum = (int) $value;
            }
        }
        $applications = RecruitmentApplication::where('vacancy_id', $data['vacancy_id'])
            ->whereHas('reviews', fn ($q) => $q->where('decision', 'recommended')->where('total_score', '>=', $minimum))
            ->get();

        foreach ($applications as $application) {
            Shortlist::updateOrCreate(['application_id' => $application->id], ['shortlisted_by' => $request->user()->id, 'method' => 'auto']);
            $statuses->change($application, 'Shortlisted', "Your application {$application->application_number} has been shortlisted for the next stage.");
        }
        $audit->log('shortlist_generated', 'Generated auto shortlist.', ['vacancy_id' => $data['vacancy_id'], 'count' => $applications->count()], $request);

        return response()->json(['message' => 'Auto shortlist generated.', 'count' => $applications->count()]);
    }
}
