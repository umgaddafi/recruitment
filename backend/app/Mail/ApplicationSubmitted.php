<?php

namespace App\Mail;

use App\Models\Application as RecruitmentApplication;
use App\Support\NetworkUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public RecruitmentApplication $application)
    {
        $this->application->loadMissing(['user.profile', 'vacancy.department']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Application submitted: {$this->application->vacancy->title}"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-submitted',
            with: [
                'application' => $this->application,
                'profile' => $this->application->user->profile,
                'vacancy' => $this->application->vacancy,
                'trackingUrl' => NetworkUrl::frontendBase().'/tracking',
            ]
        );
    }
}
