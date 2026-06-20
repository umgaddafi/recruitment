<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitApplicationRequest;
use App\Mail\ApplicationSubmitted;
use App\Models\Application as RecruitmentApplication;
use App\Models\RecruitmentNotification;
use App\Models\Vacancy;
use App\Services\ApplicationNumberService;
use App\Services\ApplicationPdfService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = RecruitmentApplication::with(['vacancy.department', 'user.profile', 'documents', 'reviews', 'staff']);

        if ($request->user()->hasRole('applicant')) {
            $query->where('user_id', $request->user()->id);
        }

        foreach (['vacancy_id', 'status'] as $filter) {
            $query->when($request->filled($filter), fn ($q) => $q->where($filter, $request->$filter));
        }

        if ($request->user()->hasRole('applicant')) {
            return response()->json($query->latest()->limit(1)->get());
        }

        return response()->json($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function show(Request $request, RecruitmentApplication $application)
    {
        $this->authorizeApplicationAccess($request, $application);

        return response()->json($application->load(['vacancy.department.faculty', 'user.profile', 'documents', 'reviews', 'finalApproval']));
    }

    public function store(SubmitApplicationRequest $request, ApplicationNumberService $numbers, AuditService $audit)
    {
        $vacancy = Vacancy::where('status', 'published')->findOrFail($request->vacancy_id);

        if (now()->toDateString() > $vacancy->deadline->toDateString()) {
            abort(422, 'Applications for this vacancy have closed.');
        }

        $submit = (bool) $request->boolean('submit');
        $status = $submit ? 'Submitted' : 'Draft';

        if ($submit && ! $request->boolean('declaration_accepted')) {
            abort(422, 'You must accept the applicant declaration before submitting.');
        }

        if (RecruitmentApplication::where('user_id', $request->user()->id)->whereNotNull('submitted_at')->exists()) {
            abort(422, 'You already have a submitted application. Applicants can only submit one application.');
        }

        if ($submit) {
            $this->verifyRecaptcha($request);
        }

        $application = RecruitmentApplication::where('user_id', $request->user()->id)->latest()->first();

        if ($application) {
            $alreadySubmitted = (bool) $application->submitted_at;

            if ($alreadySubmitted) {
                abort(422, 'Submitted applications cannot be edited.');
            }

            $application->update([
                'vacancy_id' => $vacancy->id,
                'cover_letter' => $request->cover_letter,
                'status' => $submit ? 'Submitted' : $application->status,
                'submitted_at' => $submit ? ($application->submitted_at ?? now()) : $application->submitted_at,
                'locked_at' => $submit ? now() : $application->locked_at,
                'snapshot' => [
                    'profile' => $request->user()->profile,
                    'vacancy' => $vacancy->only(['title', 'staff_category', 'rank_or_grade']),
                    'wizard_step' => $request->integer('wizard_step', 0),
                    'declaration_accepted' => $request->boolean('declaration_accepted'),
                ],
            ]);
        } else {
            $application = RecruitmentApplication::create([
                'application_number' => $numbers->generate(),
                'user_id' => $request->user()->id,
                'vacancy_id' => $vacancy->id,
                'cover_letter' => $request->cover_letter,
                'status' => $status,
                'submitted_at' => $submit ? now() : null,
                'locked_at' => $submit ? now() : null,
                'snapshot' => [
                    'profile' => $request->user()->profile,
                    'vacancy' => $vacancy->only(['title', 'staff_category', 'rank_or_grade']),
                    'wizard_step' => $request->integer('wizard_step', 0),
                    'declaration_accepted' => $request->boolean('declaration_accepted'),
                ],
            ]);
            $alreadySubmitted = false;
        }

        RecruitmentNotification::create([
            'user_id' => $request->user()->id,
            'title' => $submit ? 'Application submitted' : 'Application draft saved',
            'message' => "Application {$application->application_number} for {$vacancy->title} is {$status}.",
        ]);
        $audit->log('application_created', "Application {$application->application_number} created.", ['application_id' => $application->id], $request);

        if ($submit && ! $alreadySubmitted) {
            Mail::to($request->user())->send(new ApplicationSubmitted($application->fresh(['user.profile', 'vacancy.department'])));
        }

        return response()->json($application->load('vacancy'), 201);
    }

    public function update(SubmitApplicationRequest $request, RecruitmentApplication $application, AuditService $audit)
    {
        $this->authorizeApplicationAccess($request, $application);

        if ($application->submitted_at) {
            abort(422, 'Submitted applications cannot be edited.');
        }

        if ($request->boolean('submit') && ! $request->boolean('declaration_accepted')) {
            abort(422, 'You must accept the applicant declaration before submitting.');
        }

        if ($request->boolean('submit')) {
            $this->verifyRecaptcha($request);
        }

        $application->update([
            'cover_letter' => $request->cover_letter,
            'status' => $request->boolean('submit') ? 'Submitted' : $application->status,
            'submitted_at' => $request->boolean('submit') ? ($application->submitted_at ?? now()) : $application->submitted_at,
            'locked_at' => $request->boolean('submit') ? now() : $application->locked_at,
        ]);
        $audit->log('application_updated', "Application {$application->application_number} updated.", ['application_id' => $application->id], $request);

        if ($request->boolean('submit')) {
            Mail::to($request->user())->send(new ApplicationSubmitted($application->fresh(['user.profile', 'vacancy.department'])));
        }

        return response()->json($application->fresh('vacancy'));
    }

    public function slip(Request $request, RecruitmentApplication $application, ApplicationPdfService $pdfs)
    {
        $this->authorizeApplicationAccess($request, $application);
        $filename = preg_replace('/[^A-Za-z0-9._-]+/', '-', $application->application_number).'.pdf';
        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';

        return response($pdfs->render($application), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }

    public function appointmentLetter(Request $request, RecruitmentApplication $application, ApplicationPdfService $pdfs)
    {
        $this->authorizeApplicationAccess($request, $application);

        if ($application->status !== 'Approved') {
            abort(403, 'Appointment letter is only available after approval.');
        }

        $filename = preg_replace('/[^A-Za-z0-9._-]+/', '-', $application->application_number).'-appointment-letter.pdf';
        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';

        return response($pdfs->renderAppointmentLetter($application), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }

    private function authorizeApplicationAccess(Request $request, RecruitmentApplication $application): void
    {
        if ($request->user()->hasRole('applicant') && $application->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    private function verifyRecaptcha(Request $request): void
    {
        if (! config('services.recaptcha.enabled')) {
            return;
        }

        $token = (string) $request->input('g_recaptcha_response', '');

        if ($token === '') {
            abort(422, 'Complete the captcha verification before submitting.');
        }

        $secretKey = config('services.recaptcha.secret_key');

        if (! $secretKey) {
            abort(500, 'Captcha verification is not configured.');
        }

        $response = Http::asForm()
            ->timeout(10)
            ->post(config('services.recaptcha.siteverify_url'), [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]);

        if (! $response->ok() || ! $response->json('success')) {
            abort(422, 'Captcha verification failed. Please refresh the challenge and try again.');
        }
    }
}
