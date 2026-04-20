<?php

/**
 * File: app/bootstrap.php
 * Purpose: Autoload, config, routing helpers, session, CSRF, auth guards, render()
 * Routes: Used by all PHP entry points (index.php)
 */

declare(strict_types=1);

$config = require dirname(__DIR__) . '/config/config.php';

spl_autoload_register(static function (string $class): void {
    $base = dirname(__DIR__);
    $paths = [
        $base . '/controllers/' . $class . '.php',
        $base . '/models/' . $class . '.php',
    ];
    foreach ($paths as $path) {
        if (is_file($path)) {
            require_once $path;
            return;
        }
    }
});

function app_config(): array
{
    global $config;
    return $config;
}

/** Web root path prefix, e.g. /Qwallet/hhh when the front controller is in a subdirectory. */
function base_url(): string
{
    $script = $_SERVER['SCRIPT_NAME'] ?? '';
    if ($script === '' || $script === '/') {
        $script = $_SERVER['PHP_SELF'] ?? '/index.php';
    }
    $script = str_replace('\\', '/', (string) $script);
    $dir = dirname($script);
    if ($dir === '/' || $dir === '\\' || $dir === '.' || $dir === '') {
        $self = str_replace('\\', '/', (string) ($_SERVER['PHP_SELF'] ?? ''));
        if ($self !== '' && $self !== '/') {
            $d2 = dirname($self);
            if ($d2 !== '/' && $d2 !== '.' && $d2 !== '') {
                return rtrim($d2, '/');
            }
        }
        return '';
    }
    return rtrim($dir, '/');
}

/** Request path relative to the application (starts with /). */
function route_path(): string
{
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    if (is_string($pathInfo) && $pathInfo !== '' && $pathInfo !== '/') {
        $uri = '/' . ltrim(str_replace('\\', '/', $pathInfo), '/');
    } else {
        $parsed = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $uri = (is_string($parsed) && $parsed !== '') ? $parsed : '/';
    }
    $uri = str_replace('\\', '/', $uri);

    $prefix = base_url();
    if ($prefix !== '' && str_starts_with($uri, $prefix)) {
        $uri = substr($uri, strlen($prefix)) ?: '/';
    }

    // /index.php/profile → /profile (XAMPP & direct script URLs)
    if (str_starts_with($uri, '/index.php')) {
        $tail = substr($uri, strlen('/index.php'));
        if ($tail === '' || $tail === false) {
            $uri = '/';
        } else {
            $uri = $tail[0] === '/' ? $tail : '/' . $tail;
        }
    }

    $uri = rtrim($uri, '/');
    return $uri === '' ? '/' : $uri;
}

/**
 * @param array<string, mixed> $data
 */
function render(string $view, array $data = []): void
{
    $base = base_url();
    extract($data, EXTR_SKIP);
    $viewFile = dirname(__DIR__) . '/views/' . $view . '.php';
    if (!is_file($viewFile)) {
        http_response_code(500);
        echo 'Missing view: ' . htmlspecialchars($view);
        return;
    }
    ob_start();
    require $viewFile;
    $content = ob_get_clean();
    $title = $data['title'] ?? 'WalletIQ';
    $page = $data['page'] ?? '';
    $shell = $data['shell'] ?? false;
    $showNav = $data['showNav'] ?? false;
    $bodyClass = $data['bodyClass'] ?? '';
    $baseUrl = $base;
    $phpUser = $data['phpUser'] ?? null;
    require dirname(__DIR__) . '/views/layout.php';
}

function init_session(): void
{
    if (session_status() !== PHP_SESSION_NONE) {
        return;
    }
    $path = base_url();
    $cookiePath = ($path === '' || $path === '/') ? '/' : $path;
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => $cookiePath,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

init_session();

try {
    Database::ensureUserManagementSchema();
} catch (Throwable) {
    // MySQL not running or DB missing: pages still load; DB-backed features may fail gracefully
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_verify(): bool
{
    $t = $_POST['csrf_token'] ?? null;
    return is_string($t) && isset($_SESSION['csrf_token']) && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $t);
}

function csrf_field(): void
{
    echo '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') . '">';
}

/**
 * Redirect to a path under the app (e.g. /dashboard). Uses absolute URL so XAMPP subfolders work.
 */
function redirect_to(string $path): void
{
    if ($path === '' || ($path[0] ?? '') !== '/') {
        $path = '/' . ltrim((string) $path, '/');
    }
    $base = base_url();
    $relative = $base . $path;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host !== '') {
        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ((string) ($_SERVER['SERVER_PORT'] ?? '') === '443');
        $scheme = $https ? 'https' : 'http';
        $url = $scheme . '://' . $host . $relative;
    } else {
        $url = $relative;
    }
    header('Location: ' . $url, true, 302);
    exit;
}

/** Absolute URL for form actions (POST) so subfolder installs always hit index.php routes. */
function app_full_url(string $path): string
{
    if ($path === '' || ($path[0] ?? '') !== '/') {
        $path = '/' . ltrim((string) $path, '/');
    }
    $base = base_url();
    $relative = $base . $path;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host === '') {
        return $relative;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ((string) ($_SERVER['SERVER_PORT'] ?? '') === '443');
    $scheme = $https ? 'https' : 'http';
    return $scheme . '://' . $host . $relative;
}

/**
 * @return array{id: int, username: string, email: string, fullName: string, createdAt: string}|null
 */
function web_user_payload(): ?array
{
    $id = $_SESSION['user_id'] ?? null;
    // Hardcoded admin (session marker, not a DB row): expose a stable profile for the app shell.
    if ($id === 'admin' && is_admin_session()) {
        return [
            'id' => -1,
            'username' => 'admin',
            'email' => 'admin@walletiq.local',
            'fullName' => 'Administrator',
            'createdAt' => gmdate('c', 0),
        ];
    }
    if (!is_int($id) && !is_string($id)) {
        return null;
    }
    $uid = (int) $id;
    if ($uid <= 0) {
        return null;
    }
    try {
        $model = new UserModel();
        $row = $model->findById($uid);
        if ($row === null) {
            unset($_SESSION['user_id']);
            return null;
        }
        $user = $model->publicUserRow($row);
        $fn = $user['full_name'];
        if ($fn === null || $fn === '') {
            $fn = $user['username'];
        }
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'fullName' => $fn,
            'createdAt' => $user['created_at'],
        ];
    } catch (Throwable) {
        return null;
    }
}

function require_web_auth(): void
{
    if (web_user_payload() !== null) {
        return;
    }
    redirect_to('/login');
}

function is_admin_session(): bool
{
    return !empty($_SESSION['walletiq_is_admin']);
}

function require_admin_session(): void
{
    if (is_admin_session()) {
        return;
    }
    redirect_to('/login');
}
