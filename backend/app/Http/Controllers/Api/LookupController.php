<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\College;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Role;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class LookupController extends Controller
{
    private string $locationApiBase = 'https://countriesnow.space/api/v0.1/countries';

    public function index()
    {
        return response()->json([
            'staff_categories' => \App\Models\StaffCategory::all(),
            'ranks' => \App\Models\Rank::all(),
            'academic_ranks' => \App\Models\Rank::where('staff_category_id', 1)->pluck('name'),
            'non_academic_categories' => ['Administrative Staff', 'Technical Staff', 'Registry Staff', 'Library Staff', 'ICT Staff', 'Laboratory Staff', 'Security Staff', 'Works and Maintenance Staff'],
            'application_statuses' => ['Draft', 'Submitted', 'Under Review', 'Shortlisted', 'Not Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Recommended', 'Approved', 'Rejected'],
            'colleges' => College::with('departments')->orderBy('name')->get(),
            'departments' => Department::with('college')->orderBy('name')->get(),
            'units' => Unit::orderBy('name')->get(),
            'document_types' => DocumentType::orderBy('name')->get(),
            'roles' => Role::orderBy('label')->get(),
        ]);
    }

    public function countries()
    {
        $countries = Cache::remember('locations.countries', now()->addDay(), function () {
            $response = Http::timeout(12)->acceptJson()->get("{$this->locationApiBase}/positions");

            if (! $response->ok() || $response->json('error')) {
                return [];
            }

            return collect($response->json('data', []))
                ->pluck('name')
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all();
        });

        return response()->json($countries);
    }

    public function states(Request $request)
    {
        $data = $request->validate([
            'country' => ['required', 'string', 'max:120'],
        ]);

        $country = trim($data['country']);
        $states = Cache::remember('locations.states.'.md5($country), now()->addDay(), function () use ($country) {
            $response = Http::timeout(12)->acceptJson()->get("{$this->locationApiBase}/states/q", [
                'country' => $country,
            ]);

            if (! $response->ok() || $response->json('error')) {
                return [];
            }

            return collect($response->json('data.states', []))
                ->pluck('name')
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all();
        });

        return response()->json($states);
    }

    public function localGovernments(Request $request)
    {
        $data = $request->validate([
            'country' => ['required', 'string', 'max:120'],
            'state' => ['required', 'string', 'max:120'],
        ]);

        $country = trim($data['country']);
        $state = trim($data['state']);
        $areas = Cache::remember('locations.areas.'.md5($country.'|'.$state), now()->addDay(), function () use ($country, $state) {
            $response = Http::timeout(12)->acceptJson()->get("{$this->locationApiBase}/state/cities/q", [
                'country' => $country,
                'state' => $state,
            ]);

            if (! $response->ok() || $response->json('error')) {
                return [];
            }

            return collect($response->json('data', []))
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all();
        });

        return response()->json($areas);
    }
}
