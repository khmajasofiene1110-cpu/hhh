<?php

declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$path = route_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --- Auth API ---
if ($path === '/api/auth/register' && $method === 'POST') {
    (new AuthApiController())->register();
    exit;
}
if ($path === '/api/auth/login' && $method === 'POST') {
    (new AuthApiController())->login();
    exit;
}
if ($path === '/api/auth/logout' && $method === 'POST') {
    (new AuthApiController())->logout();
    exit;
}
if ($path === '/api/auth/me' && $method === 'GET') {
    (new AuthApiController())->me();
    exit;
}

// --- API (same contract as Express: /admin/users) ---
if ($path === '/api/admin/users' && $method === 'GET') {
    (new AdminApiController())->listUsers();
    exit;
}
if (preg_match('#^/api/admin/users/(\d+)$#', $path, $m) && $method === 'DELETE') {
    (new AdminApiController())->deleteUser((int) $m[1]);
    exit;
}

// --- Pages ---
$routes = require __DIR__ . '/routes/web.php';
if (!isset($routes[$path])) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

[$class, $action] = $routes[$path];
$controller = new $class();
$controller->$action();
