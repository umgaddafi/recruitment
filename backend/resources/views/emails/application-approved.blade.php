@php
    $applicantName = trim(collect([$profile?->first_name, $profile?->middle_name, $profile?->last_name])->filter()->implode(' ')) ?: $application->user->name;
    $department = $vacancy->department?->name ?? 'General';
    $grade = $vacancy->rank_or_grade ?: $vacancy->staff_category;
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appointment Approved</title>
</head>
<body style="margin:0;background:#f3f6fa;color:#162033;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fa;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #dfe5ee;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="padding:32px 36px;background:#006837;color:#ffffff;text-align:center;">
                            <img src="https://files.catbox.moe/hgxmy7.png" alt="JOSTUM Logo" style="height:64px; margin-bottom:16px; display:inline-block;">
                            <div style="font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#b9d3f4;">JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE</div>
                            <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;">Congratulations, Your Appointment Has Been Approved</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 36px;">
                            <p style="margin:0 0 18px;font-size:16px;line-height:1.65;">Dear {{ $applicantName }},</p>
                            <p style="margin:0 0 22px;font-size:16px;line-height:1.65;">Congratulations. We are pleased to inform you that your application for <strong>{{ $vacancy->title }}</strong> has been approved for appointment by the University.</p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border:1px solid #dfe5ee;border-radius:10px;overflow:hidden;">
                                <tr>
                                    <td style="padding:14px 16px;background:#f8fafc;color:#647084;font-size:13px;font-weight:800;">Candidate Number</td>
                                    <td style="padding:14px 16px;background:#f8fafc;font-weight:800;">{{ $application->application_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;color:#647084;font-size:13px;font-weight:800;">Approved Position</td>
                                    <td style="padding:14px 16px;font-weight:800;">{{ $vacancy->title }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;background:#f8fafc;color:#647084;font-size:13px;font-weight:800;">Rank / Grade</td>
                                    <td style="padding:14px 16px;background:#f8fafc;font-weight:800;">{{ $grade ?: 'Not specified' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;color:#647084;font-size:13px;font-weight:800;">Department</td>
                                    <td style="padding:14px 16px;font-weight:800;">{{ $department }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;background:#f8fafc;color:#647084;font-size:13px;font-weight:800;">Approval Date</td>
                                    <td style="padding:14px 16px;background:#f8fafc;font-weight:800;">{{ optional($application->updated_at)->format('M d, Y h:i A') }}</td>
                                </tr>
                            </table>

                            <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#647084;">Your appointment letter is attached to this email as a PDF. You can download it directly from this email, and you can also login to the recruitment portal to view or download it from your applicant dashboard.</p>
                            <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#647084;">Please keep this message and the attached letter for your records. Further instructions, where applicable, will be communicated through the portal or by the Recruitment Office.</p>

                            <a href="{{ $portalUrl }}" style="display:inline-block;padding:13px 18px;background:#006837;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:800;">Open Appointment Letter</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 36px;background:#f8fafc;color:#647084;font-size:13px;line-height:1.6;">
                            This automated email was sent because your recruitment application has reached Approved status. The attached PDF is your appointment letter copy.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
