<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditService
{
    public function log(string $action, ?string $description = null, array $metadata = [], ?Request $request = null): void
    {
        $user = $request?->user();
        if ($user && $user->roles()->where('name', 'applicant')->exists()) {
            return;
        }

        AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'ip_address' => $request?->ip(),
            'description' => $description,
            'metadata' => $metadata ?: null,
        ]);
    }
}
