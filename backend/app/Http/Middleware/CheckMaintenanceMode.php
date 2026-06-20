<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $setting = SystemSetting::firstWhere('key', 'system.maintenance_mode');

        if (! $setting) {
            return $next($request);
        }

        $value = $setting->value;
        $enabled = false;
        $mode = 'maintenance';

        if (is_array($value)) {
            $enabled = ! empty($value['enabled']);
            $mode = $value['mode'] ?? $mode;
        } else {
            $enabled = (bool) $value;
        }

        // If not enabled, proceed
        if (! $enabled) {
            return $next($request);
        }

        // Allow safe reads; block write methods for non-super-admins
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
            return $next($request);
        }

        $user = $request->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('super_admin')) {
            return $next($request);
        }

        return response()->json(['message' => 'The system is currently in maintenance mode. Write operations are disabled.'], 503);
    }
}
