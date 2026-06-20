<?php

use App\Support\NetworkUrl;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'type' => 'Laravel REST API',
        'frontend' => NetworkUrl::frontendBase(),
        'health' => url('/up'),
    ]);
});
