<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FinalApprovalController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ShortlistController;
use App\Http\Controllers\Api\VacancyController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware('signed')->name('verification.verify');
Route::get('/lookups', [LookupController::class, 'index']);
Route::get('/config', [App\Http\Controllers\Api\ConfigController::class, 'index']);
Route::get('/locations/countries', [LookupController::class, 'countries']);
Route::get('/locations/states', [LookupController::class, 'states']);
Route::get('/locations/local-governments', [LookupController::class, 'localGovernments']);
Route::get('/vacancies', [VacancyController::class, 'index']);
Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/email/verification-notification', [AuthController::class, 'sendVerification'])->name('verification.send');

    Route::get('/notifications', fn (Illuminate\Http\Request $request) => $request->user()->recruitmentNotifications()->latest()->paginate(20));
    Route::post('/notifications/{notification}/read', fn (App\Models\RecruitmentNotification $notification) => tap($notification)->update(['read_at' => now()]));

    Route::middleware('role:applicant,hr_admin,super_admin')->group(function () {
        Route::apiResource('/applications', ApplicationController::class)->only(['index', 'show']);
        Route::get('/applications/{application}/slip', [ApplicationController::class, 'slip']);
        Route::get('/applications/{application}/appointment-letter', [ApplicationController::class, 'appointmentLetter']);
    });

    Route::middleware('role:applicant,super_admin')->group(function () {
        Route::get('/profile', [App\Http\Controllers\Api\ProfileController::class, 'show']);
        Route::put('/profile', [App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::get('/profile/passport', [App\Http\Controllers\Api\ProfileController::class, 'passport']);
        Route::post('/profile/passport', [App\Http\Controllers\Api\ProfileController::class, 'uploadPassport']);
        Route::apiResource('/applications', ApplicationController::class)->only(['store', 'update']);
        Route::post('/applications/{application}/documents', [DocumentController::class, 'store']);
    });

    Route::get('/documents/{document}', [DocumentController::class, 'show'])->middleware('role:applicant,reviewer,panel_member,hr_admin,super_admin,registrar');

    Route::middleware('role:hr_admin,super_admin')->group(function () {
        Route::apiResource('/admin/vacancies', VacancyController::class)->except(['show']);
        Route::post('/admin/vacancies/{vacancy}/close', [VacancyController::class, 'close']);
        Route::get('/shortlists', [ShortlistController::class, 'index']);
        Route::post('/shortlists', [ShortlistController::class, 'store']);
        Route::post('/shortlists/auto', [ShortlistController::class, 'auto']);
        Route::get('/interviews', [InterviewController::class, 'index']);
        Route::post('/interviews', [InterviewController::class, 'store']);
        Route::get('/interviews/panel-members', [InterviewController::class, 'panelMembers']);
    });

    Route::middleware('role:reviewer,hr_admin,super_admin')->group(function () {
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::post('/applications/{application}/reviews', [ReviewController::class, 'store']);
    });

    Route::middleware('role:panel_member,super_admin')->group(function () {
        Route::get('/panel/interviews', [InterviewController::class, 'index']);
        Route::post('/panel/interview-scores', [InterviewController::class, 'score']);
    });

    Route::middleware('role:registrar,super_admin')->group(function () {
        Route::get('/final-approvals', [FinalApprovalController::class, 'index']);
        Route::post('/final-approvals/{application}', [FinalApprovalController::class, 'decide']);
    });

    Route::middleware('role:hr_admin,registrar,super_admin')->group(function () {
        Route::get('/dashboard', DashboardController::class);
        Route::get('/successful-list', [ReportController::class, 'successfulList']);
        Route::get('/successful-list/export/pdf', [ReportController::class, 'successfulListPdf']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/export/{type}', [ReportController::class, 'export']);
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users', [AdminController::class, 'storeUser']);
        Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
        Route::get('/admin/organization', [AdminController::class, 'organization']);
        Route::post('/admin/faculties', [AdminController::class, 'storeFaculty']);
        Route::post('/admin/departments', [AdminController::class, 'storeDepartment']);
        Route::match(['get', 'post'], '/admin/document-types', [AdminController::class, 'documentTypes']);
        Route::match(['get', 'post'], '/admin/settings', [AdminController::class, 'settings']);
        Route::get('/admin/audit-logs', [AdminController::class, 'auditLogs']);
    });
});
