<?php

namespace App\Support;

class NetworkUrl
{
    public static function appBase(): string
    {
        if (app()->bound('request')) {
            return rtrim(request()->getSchemeAndHttpHost(), '/');
        }

        return rtrim((string) config('app.url', 'http://localhost'), '/');
    }

    public static function frontendBase(): string
    {
        if (app()->bound('request')) {
            return rtrim(request()->getSchemeAndHttpHost(), '/');
        }

        return rtrim((string) config('app.frontend_url', config('app.url', 'http://localhost')), '/');
    }
}
