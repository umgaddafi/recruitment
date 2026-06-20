<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVacancyRequest;
use App\Models\Vacancy;
use App\Services\AuditService;
use Illuminate\Http\Request;

class VacancyController extends Controller
{
    public function index(Request $request)
    {
        $query = Vacancy::with(['faculty', 'department'])->withCount('applications');

        if (! $request->user()?->hasRole(['super_admin', 'hr_admin'])) {
            $query->where('status', 'published')->whereDate('start_date', '<=', now())->whereDate('deadline', '>=', now());
        }

        foreach (['staff_category', 'department_id', 'status'] as $filter) {
            $query->when($request->filled($filter), fn ($q) => $q->where($filter, $request->$filter));
        }

        $query->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->search.'%'));

        return response()->json($query->latest()->paginate($request->integer('per_page', 12)));
    }

    public function show(Vacancy $vacancy)
    {
        return response()->json($vacancy->load(['faculty', 'department'])->loadCount('applications'));
    }

    public function store(StoreVacancyRequest $request, AuditService $audit)
    {
        $vacancy = Vacancy::create($request->validated() + ['created_by' => $request->user()->id]);
        $audit->log('vacancy_created', "Created vacancy {$vacancy->title}.", ['vacancy_id' => $vacancy->id], $request);

        return response()->json($vacancy->load(['faculty', 'department']), 201);
    }

    public function update(StoreVacancyRequest $request, Vacancy $vacancy, AuditService $audit)
    {
        $vacancy->update($request->validated());
        $audit->log('vacancy_updated', "Updated vacancy {$vacancy->title}.", ['vacancy_id' => $vacancy->id], $request);

        return response()->json($vacancy->fresh(['faculty', 'department']));
    }

    public function destroy(Request $request, Vacancy $vacancy, AuditService $audit)
    {
        $vacancy->delete();
        $audit->log('vacancy_deleted', "Deleted vacancy {$vacancy->title}.", ['vacancy_id' => $vacancy->id], $request);

        return response()->json(['message' => 'Vacancy deleted without removing existing applications.']);
    }

    public function close(Request $request, Vacancy $vacancy, AuditService $audit)
    {
        $vacancy->update(['status' => 'closed']);
        $audit->log('vacancy_closed', "Closed vacancy {$vacancy->title}.", ['vacancy_id' => $vacancy->id], $request);

        return response()->json($vacancy);
    }
}
