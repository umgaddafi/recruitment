<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\InterviewSchedule;
use App\Models\Staff;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = RecruitmentApplication::query();
        
        if ($request->has('department_id') && $request->department_id) {
            $query->whereHas('vacancy', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }
        
        if ($request->has('vacancy_id') && $request->vacancy_id) {
            $query->where('vacancy_id', $request->vacancy_id);
        }

        $allApplications = $query->with(['user.profile', 'vacancy.department'])->get();
        
        $applicantsByStatus = $allApplications->groupBy('status')->map->count()->map(function($count, $status) {
            return ['status' => $status, 'total' => $count];
        })->values();

        $applicantsByDepartment = $allApplications->groupBy(function ($app) {
            return $app->vacancy?->department?->name ?? 'Unknown';
        })->map->count()->map(function($count, $dept) {
            return ['department' => $dept, 'total' => $count];
        })->values();

        return response()->json([
            'total_applications' => $allApplications->count(),
            'total_approved' => $allApplications->where('status', 'Approved')->count(),
            'total_shortlisted' => $allApplications->where('status', 'Shortlisted')->count(),
            'total_rejected' => $allApplications->where('status', 'Rejected')->count(),
            'applicants_by_status' => $applicantsByStatus,
            'applicants_by_department' => $applicantsByDepartment,
            'recent_applications' => $allApplications->sortByDesc('created_at')->take(50)->values(),
            'interview_schedule' => InterviewSchedule::with(['vacancy', 'applications.user.profile'])->latest()->take(10)->get(),
        ]);
    }

    public function successfulList()
    {
        return response()->json(Staff::with(['application.vacancy.department', 'user'])
            ->orderBy('pf_number')
            ->get());
    }

    public function successfulListPdf()
    {
        $staff = Staff::with(['application.vacancy.department', 'user'])
            ->orderBy('pf_number')
            ->get();

        $pdf = Pdf::setOption(['isRemoteEnabled' => true])
            ->loadView('pdf.successful-list', compact('staff'));

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="successful-list.pdf"',
        ]);
    }

    public function export(Request $request, string $type)
    {
        $query = RecruitmentApplication::with(['user.profile', 'vacancy.department']);
        
        if ($request->has('department_id') && $request->department_id) {
            $query->whereHas('vacancy', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }
        
        if ($request->has('vacancy_id') && $request->vacancy_id) {
            $query->where('vacancy_id', $request->vacancy_id);
        }

        $query = match ($type) {
            'shortlisted' => $query->where('status', 'Shortlisted'),
            'approved' => $query->where('status', 'Approved'),
            'rejected' => $query->where('status', 'Rejected'),
            default => $query,
        };

        $rows = $query->get();

        $csv = "Application Number,Applicant,Vacancy,Department,Status,Submitted At\n";
        foreach ($rows as $row) {
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                $row->application_number,
                $row->user?->name ?? 'N/A',
                $row->vacancy?->title ?? 'N/A',
                $row->vacancy?->department?->name ?? 'N/A',
                $row->status,
                $row->submitted_at
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$type}-applications.csv\"",
        ]);
    }

    private function pdf(array $lines): string
    {
        $content = "BT\n/F1 15 Tf\n72 760 Td\n".$this->text($lines[0])." Tj\n";
        $content .= "0 -20 Td\n/F1 12 Tf\n".$this->text($lines[1])." Tj\n";
        $content .= "0 -28 Td\n/F1 12 Tf\n".$this->text($lines[2])." Tj\n";
        $content .= "0 -34 Td\n/F1 9 Tf\n";

        foreach (array_slice($lines, 3) as $line) {
            foreach ($this->wrap($line, 95) as $wrapped) {
                $content .= $this->text($wrapped)." Tj\n0 -14 Td\n";
            }
        }

        $content .= "ET";
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($content)." >>\nstream\n{$content}\nendstream",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n{$object}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }
        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $pdf;
    }

    private function text(string $value): string
    {
        return '('.str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value).')';
    }

    private function wrap(string $value, int $length): array
    {
        if ($value === '') {
            return [''];
        }

        return explode("\n", wordwrap($value, $length, "\n", true));
    }
}
