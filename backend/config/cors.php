<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost'),
        'http://localhost',
        'http://localhost:5173',
    ],
    'allowed_origins_patterns' => [
        '#^http://([0-9]{1,3}\.){3}[0-9]{1,3}(:\d+)?$#',
        '#^http://[a-zA-Z0-9.-]+(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
