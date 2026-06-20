<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyApplicantEmail extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return (new MailMessage)
            ->subject('Confirm your JOSTUM recruitment account')
            ->view('emails.verify-applicant-email', [
                'user' => $notifiable,
                'verificationUrl' => $verificationUrl,
                'expiresIn' => '60 minutes',
                'loginUrl' => rtrim((string) config('app.frontend_url'), '/').'/login',
                'supportEmail' => config('mail.from.address'),
            ]);
    }
}
