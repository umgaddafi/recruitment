<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApplicantProfile;
use App\Models\ApplicationDocument;
use App\Models\RecruitmentNotification;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\SystemSetting;

class AuthController extends Controller
{
    public function register(Request $request, AuditService $audit)
    {
        // Build password rules from system settings when available
        $pwPolicy = SystemSetting::firstWhere('key', 'iam.password_policy')?->value ?? [];
        $min = isset($pwPolicy['min_length']) ? (int) $pwPolicy['min_length'] : 8;
        $passwordRules = ['required', 'confirmed', 'min:'.$min];

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'middle_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:255'],
            'password' => $passwordRules,
        ]);

        $user = User::where('email', $data['email'])->first();

        if ($user && $user->hasVerifiedEmail() && $user->status === 'active') {
            throw ValidationException::withMessages([
                'email' => ['An account already exists for this email address. Please login or use forgot password.'],
            ]);
        }

        $fullName = collect([$data['first_name'], $data['middle_name'] ?? null, $data['last_name']])
            ->filter()
            ->implode(' ');

        if (! $user) {
            $user = User::create([
                'name' => $fullName,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'status' => 'pending_verification',
            ]);
        } else {
            $user->forceFill([
                'name' => $fullName,
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'status' => 'pending_verification',
                'email_verified_at' => null,
                'remember_token' => Str::random(60),
            ])->save();
        }

        $user->assignRole('applicant');
        ApplicantProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
            ]
        );
        $user->sendEmailVerificationNotification();
        RecruitmentNotification::create([
            'user_id' => $user->id,
            'title' => 'Verify your email address',
            'message' => 'Your applicant account registration has started. Confirm your email address to activate your account.',
        ]);
        $audit->log('user_registration_started', "Applicant {$user->email} started registration.", [], $request);

        return response()->json([
            'message' => 'Account details saved. Check your email and click the confirmation link to complete account creation.',
            'email' => $user->email,
            'requires_verification' => true,
        ], 201);
    }

    public function login(Request $request, AuditService $audit)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $data['email'])->with('roles')->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['The provided credentials are invalid or inactive.']]);
        }

        if (! $user->hasVerifiedEmail() || $user->status === 'pending_verification') {
            throw ValidationException::withMessages(['email' => ['Confirm your email address before logging in. Check your inbox for the verification link.']]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages(['email' => ['The provided credentials are invalid or inactive.']]);
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $audit->log('user_login', "User {$user->email} logged in.", [], $request);

        return response()->json($this->tokenPayload($user, 'Recruitment portal login'));
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'If the email exists, a password reset link has been sent.']);
    }

    public function resendVerification(Request $request, AuditService $audit)
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $user = User::where('email', $data['email'])->first();

        if ($user && (! $user->hasVerifiedEmail() || $user->status === 'pending_verification')) {
            $user->sendEmailVerificationNotification();
            $audit->log('verification_email_resent', "Verification email resent to {$user->email}.", ['user_id' => $user->id], $request);
        }

        return response()->json(['message' => 'If the account is awaiting verification, a new confirmation email has been sent.']);
    }

    public function resetPassword(Request $request)
    {
        $pwPolicy = SystemSetting::firstWhere('key', 'iam.password_policy')?->value ?? [];
        $min = isset($pwPolicy['min_length']) ? (int) $pwPolicy['min_length'] : 8;
        $passwordRules = ['required', 'confirmed', 'min:'.$min];

        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => $passwordRules,
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();

            $user->tokens()->delete();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return response()->json(['message' => 'Password reset successfully. You can now login.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('roles', 'profile');
        if ($user->hasRole('applicant') && ! $user->profile?->passport_path) {
            $passport = ApplicationDocument::query()
                ->whereHas('application', fn ($query) => $query->where('user_id', $user->id))
                ->where('mime_type', 'like', 'image/%')
                ->where(function ($query) {
                    $query->where('label', 'like', '%passport%')
                        ->orWhere('original_name', 'like', '%passport%')
                        ->orWhereHas('documentType', fn ($typeQuery) => $typeQuery
                            ->where('name', 'like', '%passport%')
                            ->orWhere('slug', 'like', '%passport%'));
                })
                ->latest()
                ->first();

            if ($passport) {
                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['passport_path' => "/api/documents/{$passport->id}?disposition=inline"]
                );
                $user->load('profile');
            }
        }

        return response()->json($user);
    }

    public function logout(Request $request, AuditService $audit)
    {
        $request->user()->currentAccessToken()?->delete();
        $audit->log('user_logout', 'User logged out.', [], $request);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function sendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email sent.']);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        if ($user->status === 'pending_verification') {
            $user->forceFill(['status' => 'active'])->save();
            $user->assignRole('applicant');
            ApplicantProfile::firstOrCreate(['user_id' => $user->id]);
            RecruitmentNotification::create([
                'user_id' => $user->id,
                'title' => 'Account created successfully',
                'message' => 'Your email has been verified and your applicant account is now active.',
            ]);
        }

        return redirect(rtrim(config('app.frontend_url'), '/').'/email-verified?created=1');
    }

    private function tokenPayload(User $user, string $tokenName): array
    {
        $user->load('roles', 'profile');

        return [
            'token' => $user->createToken($tokenName)->plainTextToken,
            'user' => $user,
            'roles' => $user->roles->pluck('name')->values(),
        ];
    }
}
