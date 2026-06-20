<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Models\EducationalQualification;
use App\Models\OLevelResult;
use App\Models\WorkExperience;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Application;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($this->payload($request->user()));
    }

    public function uploadPassport(Request $request, AuditService $audit)
    {
        $request->validate([
            'passport' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
        ]);

        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        if ($profile->passport_path && str_starts_with($profile->passport_path, 'profile-passports/')) {
            Storage::disk('local')->delete($profile->passport_path);
        }

        $path = $request->file('passport')->store("profile-passports/{$user->id}", 'local');
        $profile->update(['passport_path' => $path]);

        $audit->log('passport_uploaded', 'Applicant passport photograph uploaded.', [], $request);

        return response()->json($this->payload($user->fresh()));
    }

    public function passport(Request $request)
    {
        $path = $request->user()->profile?->passport_path;

        if (! $path) {
            abort(404);
        }

        if (str_starts_with($path, '/api/documents/')) {
            abort(404, 'Legacy passport document route should be requested directly.');
        }

        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        return response()->file(Storage::disk('local')->path($path));
    }

    public function update(Request $request, AuditService $audit)
    {
        $data = $request->validate([
            'profile' => ['required', 'array'],
            'profile.first_name' => ['nullable', 'string', 'max:120'],
            'profile.middle_name' => ['nullable', 'string', 'max:120'],
            'profile.last_name' => ['nullable', 'string', 'max:120'],
            'profile.gender' => ['nullable', 'string', 'max:40'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.nationality' => ['nullable', 'string', 'max:120'],
            'profile.state_of_origin' => ['nullable', 'string', 'max:120'],
            'profile.local_government' => ['nullable', 'string', 'max:120'],
            'profile.address' => ['nullable', 'string', 'max:255'],
            //'profile.city' removed
            'profile.application_wizard_step' => ['nullable', 'integer', 'between:0,7'],
            'profile.application_wizard_payload' => ['nullable', 'array'],
            'education' => ['array'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.qualification' => ['required_with:education', 'string', 'max:180'],
            'education.*.field_of_study' => ['nullable', 'string', 'max:180'],
            'education.*.grade' => ['nullable', 'string', 'max:80'],
            'education.*.scale' => ['nullable', 'string', 'max:20'],
            'education.*.cgpa' => ['nullable', 'numeric', 'between:0,9.99'],
            'education.*.class_of_degree' => ['nullable', 'string', 'max:80'],
            'education.*.start_year' => ['nullable', 'integer', 'between:1950,2035'],
            'education.*.end_year' => ['nullable', 'integer', 'between:1950,2035'],
            'olevels' => ['array', 'max:2'],
            'olevels.*.school_name' => ['required_with:olevels', 'string', 'max:255'],
            'olevels.*.exam_number' => ['required_with:olevels', 'string', 'max:80'],
            'olevels.*.exam_year' => ['required_with:olevels', 'integer', 'between:1950,2035'],
            'olevels.*.exam_type' => ['required_with:olevels', 'in:WAEC,NECO,NABTEB'],
            'olevels.*.subjects' => ['required_with:olevels', 'array', 'size:9'],
            'olevels.*.subjects.*.subject' => ['required', 'string', 'max:120'],
            'olevels.*.subjects.*.grade' => ['required', 'in:A1,B2,B3,C4,C5,C6,D7,E8,F9'],
            'experience' => ['array'],
            'experience.*.organization' => ['required_with:experience', 'string', 'max:255'],
            'experience.*.position' => ['required_with:experience', 'string', 'max:180'],
            'experience.*.start_date' => ['nullable', 'date'],
            'experience.*.end_date' => ['nullable', 'date'],
            'experience.*.is_current' => ['boolean'],
            'experience.*.responsibilities' => ['nullable', 'string'],
            'certifications' => ['array'],
            'certifications.*.name' => ['required_with:certifications', 'string', 'max:255'],
            'certifications.*.issuer' => ['nullable', 'string', 'max:180'],
            'certifications.*.issued_at' => ['nullable', 'date'],
            'certifications.*.expires_at' => ['nullable', 'date'],
        ]);

        if (($data['profile']['application_wizard_step'] ?? 0) >= 3 && empty($data['olevels'])) {
            abort(422, 'Add at least one O-Level result before continuing.');
        }

        $user = $request->user();
        // Prevent editing profile once any application has been submitted
        if (Application::where('user_id', $user->id)->whereNotNull('submitted_at')->exists()) {
            abort(403, 'Profile cannot be edited after an application has been submitted.');
        }
        if (($data['profile']['application_wizard_step'] ?? 0) >= 1 && ! $user->profile?->passport_path) {
            abort(422, 'Upload your passport photograph before continuing.');
        }

        DB::transaction(function () use ($user, $data) {
            $user->profile()->updateOrCreate(['user_id' => $user->id], $data['profile']);
            EducationalQualification::where('user_id', $user->id)->delete();
            OLevelResult::where('user_id', $user->id)->delete();
            WorkExperience::where('user_id', $user->id)->delete();
            Certification::where('user_id', $user->id)->delete();

            foreach ($data['education'] ?? [] as $item) {
                EducationalQualification::create($item + ['user_id' => $user->id]);
            }
            foreach ($data['olevels'] ?? [] as $item) {
                OLevelResult::create($item + ['user_id' => $user->id]);
            }
            foreach ($data['experience'] ?? [] as $item) {
                WorkExperience::create($item + ['user_id' => $user->id]);
            }
            foreach ($data['certifications'] ?? [] as $item) {
                Certification::create($item + ['user_id' => $user->id]);
            }
        });

        $audit->log('profile_updated', 'Applicant profile updated.', [], $request);

        return response()->json($this->payload($user));
    }

    private function payload($user): array
    {
        return [
            'profile' => $user->profile,
            'education' => EducationalQualification::where('user_id', $user->id)->latest()->get(),
            'olevels' => OLevelResult::where('user_id', $user->id)->latest()->get(),
            'experience' => WorkExperience::where('user_id', $user->id)->latest()->get(),
            'certifications' => Certification::where('user_id', $user->id)->latest()->get(),
        ];
    }
}
