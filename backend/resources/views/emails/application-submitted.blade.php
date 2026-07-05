@php
    $applicantName = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Application Submitted</title>
</head>
<body style="margin:0;background:#f3f6fa;color:#162033;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fa;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe5ee;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="padding:30px 34px;background:#006837;color:#ffffff;text-align:center;">
                            <img src="https://files.catbox.moe/hgxmy7.png" alt="JOSTUM Logo" style="height:64px; margin-bottom:16px; display:inline-block;">
                            <div style="font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#b9d3f4;">JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE</div>
                            <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">Application Submitted Successfully</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 34px;">
                            <p style="margin:0 0 18px;font-size:16px;line-height:1.65;">Dear {{ $applicantName }},</p>
                            <p style="margin:0 0 22px;font-size:16px;line-height:1.65;">Your application for <strong>{{ $vacancy->title }}</strong>{{ $vacancy->rank_or_grade ? ' ('.$vacancy->rank_or_grade.')' : '' }} has been submitted and locked for review.</p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border:1px solid #dfe5ee;border-radius:10px;overflow:hidden;">
                                <tr>
                                    <td style="padding:14px 16px;background:#f8fafc;color:#647084;font-size:13px;font-weight:800;">Application Number</td>
                                    <td style="padding:14px 16px;background:#f8fafc;font-weight:800;">{{ $application->application_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;color:#647084;font-size:13px;font-weight:800;">Role</td>
                                    <td style="padding:14px 16px;font-weight:800;">{{ $vacancy->title }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;background:#f8fafc;color:#647084;font-size:13px;font-weight:800;">Department</td>
                                    <td style="padding:14px 16px;background:#f8fafc;font-weight:800;">{{ $vacancy->department?->name ?? 'General' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;color:#647084;font-size:13px;font-weight:800;">Submitted On</td>
                                    <td style="padding:14px 16px;font-weight:800;">{{ optional($application->submitted_at)->format('M d, Y h:i A') }}</td>
                                </tr>
                            </table>

                            <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#647084;">You can login anytime to track the application status and view recruitment updates from your applicant dashboard.</p>
                            <a href="{{ $trackingUrl }}" style="display:inline-block;padding:13px 18px;background:#006837;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:800;">Login and Track Application</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 34px;background:#f8fafc;color:#647084;font-size:13px;line-height:1.6;">
                            This is an automated confirmation from the JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE Recruitment Portal. Please keep this email for your records.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
