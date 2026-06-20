<?php

namespace App\Services;

use App\Models\Application as RecruitmentApplication;

class ApplicationPdfService
{
    public function render(RecruitmentApplication $application): string
    {
        $application->loadMissing(['user.profile', 'vacancy.department']);
        $profile = $application->user->profile;
        $name = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;

        $lines = [
            'JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI',
            'BENUE STATE',
            'Application Submission Slip',
            '',
            'Applicant: '.$name,
            'Candidate Number: '.$application->application_number,
            'Vacancy: '.$application->vacancy->title,
            'Role / Grade: '.($application->vacancy->rank_or_grade ?: $application->vacancy->staff_category),
            'Department: '.($application->vacancy->department?->name ?: 'General'),
            'Status: '.$application->status,
            'Submitted: '.($application->submitted_at?->format('M d, Y h:i A') ?: 'Not submitted'),
            '',
            'This slip confirms that the candidate application has been received by the recruitment portal.',
            'Login to the portal to track status updates and recruitment communication.',
        ];

        return $this->pdf($lines);
    }

    public function renderAppointmentLetter(RecruitmentApplication $application): string
    {
        $application->loadMissing(['user.profile', 'vacancy.department', 'staff']);
        $profile = $application->user->profile;
        $vacancy = $application->vacancy;
        $name = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;
        $department = $vacancy->department?->name ?: 'the relevant Department';
        $role = $vacancy->title ?: 'the approved position';
        $grade = $vacancy->rank_or_grade ?: $vacancy->staff_category;
        $date = optional($application->updated_at)->format('M d, Y') ?: now()->format('M d, Y');
        $reference = 'R/OPA/JOSTUM/'.($application->staff?->pf_number ?: $application->application_number);

        $lines = [
            'JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI',
            'BENUE STATE',
            'Office of the Registrar',
            '',
            'MEMORANDUM OF APPOINTMENT',
            '',
            'Reference: '.$reference,
            'Date: '.$date,
            '',
            'Dear '.$name.',',
            '',
            'Congratulations. On behalf of the University, I am pleased to inform you that your application has been approved.',
            '',
            'You are hereby offered appointment as '.$role.' on '.$grade.' in '.$department.', Joseph Sarwuan Tarka University, Makurdi.',
            '',
            'Candidate Number: '.$application->application_number,
            'Department: '.$department,
            'Status: Approved',
            '',
            'The appointment is subject to the provisions of the University Laws, Statutes, Ordinances, and other regulations governing the conditions of appointment of staff as may be approved by the University Council from time to time.',
            '',
            'You will be required to perform your duties diligently, support the mandate of the University, and carry out other assignments as may be assigned by your Head of Department or the University Administration.',
            '',
            'Please login to the recruitment portal for further instructions and to keep a copy of this letter for your records.',
            '',
            'Congratulations once again.',
            '',
            'Registrar',
            'Joseph Sarwuan Tarka University, Makurdi',
        ];

        return $this->pdf($lines);
    }

    private function pdf(array $lines): string
    {
        $content = "BT\n/F1 16 Tf\n72 760 Td\n".$this->text($lines[0])." Tj\n";
        $content .= "0 -22 Td\n/F1 13 Tf\n".$this->text($lines[1])." Tj\n";
        $content .= "0 -28 Td\n/F1 13 Tf\n".$this->text($lines[2])." Tj\n";
        $content .= "0 -36 Td\n/F1 11 Tf\n";

        foreach (array_slice($lines, 3) as $line) {
            foreach ($this->wrap($line, 78) as $wrapped) {
                $content .= $this->text($wrapped)." Tj\n0 -18 Td\n";
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
