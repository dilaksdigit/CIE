<?php
return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'cie_v232'),
            'username' => env('DB_USERNAME', 'cie_user'),
            'password' => env('DB_PASSWORD', ''),
        ],
    ],
];
