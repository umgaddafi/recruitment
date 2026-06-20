<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;

class ConfigController extends Controller
{
    public function index()
    {
        $keys = [
            'branding',
            'documents.policy',
            'recruitment.minimum_score',
            'application.numbering',
            'portal_name',
            'max_upload_kb',
            'system.maintenance_mode',
        ];

        $settings = SystemSetting::whereIn('key', $keys)->get()->pluck('value', 'key')->toArray();

        // Normalize simple scalar keys that may be under different groups
        if (! isset($settings['portal_name']) && isset($settings['branding']) && is_array($settings['branding'])) {
            $settings['portal_name'] = $settings['branding']['portal_name'] ?? null;
        }

        return response()->json($settings);
    }
}
