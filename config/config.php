<?php

declare(strict_types=1);

/**
 * Application configuration. Environment variables override defaults (same names as the Node server).
 */
return [
    'mysql' => [
        'host' => getenv('MYSQL_HOST') !== false && getenv('MYSQL_HOST') !== '' ? getenv('MYSQL_HOST') : '127.0.0.1',
        'port' => (int) (getenv('MYSQL_PORT') !== false && getenv('MYSQL_PORT') !== '' ? getenv('MYSQL_PORT') : '3306'),
        'user' => getenv('MYSQL_USER') !== false && getenv('MYSQL_USER') !== '' ? getenv('MYSQL_USER') : 'root',
        'password' => getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : '',
        'database' => getenv('MYSQL_DATABASE') !== false && getenv('MYSQL_DATABASE') !== '' ? getenv('MYSQL_DATABASE') : 'user_management',
    ],
];
