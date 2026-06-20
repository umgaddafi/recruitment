<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'metrics' => [
                'total_applicants' => User::whereHas('roles', fn ($q) => $q->where('name', 'applicant'))->count(),
                'total_vacancies' => Vacancy::count(),
                'active_vacancies' => Vacancy::where('status', 'published')->whereDate('deadline', '>=', now())->count(),
                'closed_vacancies' => Vacancy::where('status', 'closed')->orWhereDate('deadline', '<', now())->count(),
                'shortlisted_applicants' => RecruitmentApplication::where('status', 'Shortlisted')->count(),
                'interviewed_applicants' => RecruitmentApplication::whereIn('status', ['Interview Completed', 'Recommended', 'Approved'])->count(),
                'approved_applicants' => RecruitmentApplication::where('status', 'Approved')->count(),
                'rejected_applicants' => RecruitmentApplication::where('status', 'Rejected')->count(),
            ],
            'recent_applications' => RecruitmentApplication::with(['user.profile', 'vacancy'])->latest()->limit(8)->get(),
            'status_distribution' => RecruitmentApplication::select('status', DB::raw('count(*) as total'))->groupBy('status')->get(),
            'department_applications' => DB::table('applications')
                ->join('vacancies', 'applications.vacancy_id', '=', 'vacancies.id')
                ->leftJoin('departments', 'vacancies.department_id', '=', 'departments.id')
                ->selectRaw('coalesce(departments.name, "General") as department, count(*) as total')
                ->groupBy('departments.name')
                ->get(),
            'vacancy_statistics' => Vacancy::withCount('applications')->latest()->limit(8)->get(),
            'audit_tail' => AuditLog::latest()->limit(8)->get(),
        ]);
    }
}
