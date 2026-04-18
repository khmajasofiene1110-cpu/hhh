<?php

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

/**
 * @return array<string, mixed>
 */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/** Web root path prefix, e.g. /projet_web/hhh when the front controller is in a subdirectory. */
function base_url(): string
{
    $script = $_SERVER['SCRIPT_NAME'] ?? '';
    if ($script === '' || $script === '/') {
        $script = $_SERVER['PHP_SELF'] ?? '/index.php';
    }
    $script = str_replace('\\', '/', (string) $script);
    $dir = dirname($script);
    if ($dir === '/' || $dir === '\\' || $dir === '.' || $dir === '') {
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
    // MySQL not running or DB missing: pages still load; API will return clear errors
}
