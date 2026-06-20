<?php

namespace App\Mail;

use App\Models\Application as RecruitmentApplication;
use App\Support\NetworkUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public RecruitmentApplication $application,
        public string $previousStatus,
        public string $messageText = ''
    ) {
        $this->application->loadMissing(['user.profile', 'vacancy.department']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Application status updated: {$this->application->status}"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-changed',
            with: [
                'application' => $this->application,
                'profile' => $this->application->user->profile,
                'vacancy' => $this->application->vacancy,
                'previousStatus' => $this->previousStatus,
                'messageText' => $this->messageText,
                'trackingUrl' => NetworkUrl::frontendBase().'/tracking',
            ]
        );
    }
}
