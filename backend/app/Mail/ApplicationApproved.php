<?php

namespace App\Mail;

use App\Models\Application as RecruitmentApplication;
use App\Services\ApplicationPdfService;
use App\Support\NetworkUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public RecruitmentApplication $application)
    {
        $this->application->loadMissing(['user.profile', 'vacancy.department', 'staff']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Congratulations: Appointment approved for {$this->application->vacancy->title}"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-approved',
            with: [
                'application' => $this->application,
                'profile' => $this->application->user->profile,
                'vacancy' => $this->application->vacancy,
                'portalUrl' => NetworkUrl::frontendBase().'/appointment-letter',
            ]
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => app(ApplicationPdfService::class)->renderAppointmentLetter($this->application),
                $this->attachmentFileName()
            )->withMime('application/pdf'),
        ];
    }

    private function attachmentFileName(): string
    {
        $number = preg_replace('/[^A-Za-z0-9._-]+/', '-', $this->application->application_number ?: 'appointment-letter');

        return "{$number}-appointment-letter.pdf";
    }
}
