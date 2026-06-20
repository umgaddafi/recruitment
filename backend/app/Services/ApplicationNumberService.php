<?php

namespace App\Services;

use App\Models\Application;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class ApplicationNumberService
{
    public function generate(): string
    {
        // Use system setting for numbering when available to provide predictable sequences
        $setting = SystemSetting::firstWhere('key', 'application.numbering');

        if (! $setting || ! is_array($setting->value)) {
            // fallback to random style used previously
            do {
                $number = 'UNI-REC-'.now()->year.'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
            } while (Application::where('application_number', $number)->exists());

            return $number;
        }

        $config = $setting->value;
        $prefix = $config['prefix'] ?? ('UNI-REC');
        $padding = isset($config['padding']) ? (int) $config['padding'] : 6;
        $resetYearly = $config['reset_yearly'] ?? true;

        // Atomic increment of next_sequence
        return DB::transaction(function () use ($setting, $prefix, $padding, $resetYearly) {
            $row = DB::table('system_settings')->where('id', $setting->id)->lockForUpdate()->first();
            $value = is_array($row->value) ? $row->value : json_decode($row->value, true) ?? [];

            $year = now()->year;
            $next = isset($value['next_sequence']) ? (int) $value['next_sequence'] : 1;
            $lastYear = isset($value['last_year']) ? (int) $value['last_year'] : $year;

            if ($resetYearly && $lastYear !== $year) {
                $next = 1;
            }

            $number = sprintf('%s-%s-%s', $prefix, $year, str_pad((string) $next, $padding, '0', STR_PAD_LEFT));

            // ensure no collision
            if (Application::where('application_number', $number)->exists()) {
                // fallback to random if collision occurs
                do {
                    $number = $prefix.'-'.now()->year.'-'.str_pad((string) random_int(1, 999999), $padding, '0', STR_PAD_LEFT);
                } while (Application::where('application_number', $number)->exists());
            } else {
                // persist next_sequence and last_year
                $value['next_sequence'] = $next + 1;
                $value['last_year'] = $year;
                DB::table('system_settings')->where('id', $setting->id)->update(['value' => json_encode($value)]);
            }

            return $number;
        });
    }
}
