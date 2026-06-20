<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application as RecruitmentApplication;
use App\Models\InterviewSchedule;
use App\Models\Staff;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        return response()->json([
            'applicants_by_status' => RecruitmentApplication::query()->selectRaw('status, count(*) as total')->groupBy('status')->get(),
            'approved_candidates' => RecruitmentApplication::with(['user.profile', 'vacancy'])->where('status', 'Approved')->get(),
            'interview_schedule' => InterviewSchedule::with(['vacancy', 'applications.user.profile'])->latest()->get(),
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

        $lines = [
            'JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI',
            'BENUE STATE',
            'Successful List',
            '',
            'S/N   PF Number     Name                               Role                          Department',
            str_repeat('-', 95),
        ];

        foreach ($staff as $index => $item) {
            $name = trim(collect([$item->first_name, $item->surname, $item->other_name])->filter()->implode(' ')) ?: $item->user?->name ?: 'Staff Member';
            $role = $item->rank ?: ($item->application?->vacancy?->rank_or_grade ?: $item->application?->vacancy?->staff_category ?: 'N/A');
            $department = $item->department ?: ($item->application?->vacancy?->department?->name ?: 'General');
            $lines[] = sprintf(
                '%-4s %-12s %-34s %-28s %-20s',
                $index + 1,
                $item->pf_number ?: 'N/A',
                $name,
                $role,
                $department
            );
        }

        return response($this->pdf($lines), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="successful-list.pdf"',
        ]);
    }

    public function export(Request $request, string $type)
    {
        $rows = match ($type) {
            'shortlisted' => RecruitmentApplication::with(['user.profile', 'vacancy'])->where('status', 'Shortlisted')->get(),
            'approved' => RecruitmentApplication::with(['user.profile', 'vacancy'])->where('status', 'Approved')->get(),
            'rejected' => RecruitmentApplication::with(['user.profile', 'vacancy'])->where('status', 'Rejected')->get(),
            default => RecruitmentApplication::with(['user.profile', 'vacancy'])->get(),
        };

        $csv = "Application Number,Applicant,Vacancy,Status,Submitted At\n";
        foreach ($rows as $row) {
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                $row->application_number,
                $row->user->name,
                $row->vacancy->title,
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
