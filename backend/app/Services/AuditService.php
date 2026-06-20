<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditService
{
    public function log(string $action, ?string $description = null, array $metadata = [], ?Request $request = null): void
    {
        AuditLog::create([
            'user_id' => $request?->user()?->id,
            'action' => $action,
            'ip_address' => $request?->ip(),
            'description' => $description,
            'metadata' => $metadata ?: null,
        ]);
    }
}
