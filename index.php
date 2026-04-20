<?php

/**
 * File: index.php
 * Purpose: Front controller — dispatches POST actions then page routes
 * Routes: All paths under this app directory
 */

declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$path = route_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --- Auth ---
if ($path === '/login' && $method === 'POST') {
    (new AuthController())->loginPost();
    exit;
}
if ($path === '/register' && $method === 'POST') {
    (new AuthController())->processRegister();
    exit;
}
if ($path === '/logout' && $method === 'GET') {
    (new AuthController())->logout();
    exit;
}

// --- Admin ---
if ($path === '/admin/users/delete' && $method === 'POST') {
    (new AdminController())->deleteUserPost();
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
