<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\ApplicationDocument;
use App\Models\DocumentType;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(Request $request, RecruitmentApplication $application, AuditService $audit)
    {
        if ($request->user()->hasRole('applicant') && $application->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($application->submitted_at) {
            abort(422, 'Submitted application documents cannot be changed.');
        }

        $data = $request->validate([
            'document_type_id' => ['nullable', 'exists:document_types,id'],
            'label' => ['required', 'string', 'max:180'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:4096'],
        ]);

        $path = $request->file('file')->store("applications/{$application->application_number}", 'local');
        $type = $data['document_type_id'] ? DocumentType::find($data['document_type_id']) : null;

        $document = ApplicationDocument::create([
            'application_id' => $application->id,
            'document_type_id' => $type?->id,
            'label' => $data['label'],
            'file_path' => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
            'mime_type' => $request->file('file')->getMimeType(),
            'size' => $request->file('file')->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        if ($this->isPassportDocument($document, $type)) {
            $request->user()->profile()->updateOrCreate(
                ['user_id' => $request->user()->id],
                ['passport_path' => "/api/documents/{$document->id}?disposition=inline"]
            );
        }

        $audit->log('document_uploaded', "Uploaded {$document->label}.", ['application_id' => $application->id], $request);

        return response()->json($document, 201);
    }

    public function show(Request $request, ApplicationDocument $document)
    {
        $document->load('application');
        if ($request->user()->hasRole('applicant') && $document->application->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($request->query('disposition') === 'inline') {
            return response()->file(Storage::disk('local')->path($document->file_path), [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'inline; filename="'.$document->original_name.'"',
            ]);
        }

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    private function isPassportDocument(ApplicationDocument $document, ?DocumentType $type): bool
    {
        $haystack = strtolower(implode(' ', array_filter([
            $type?->slug,
            $type?->name,
            $document->label,
            $document->original_name,
        ])));

        return str_contains($haystack, 'passport') && str_starts_with((string) $document->mime_type, 'image/');
    }
}
