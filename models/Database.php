<?php

declare(strict_types=1);

final class Database
{
    private static ?PDO $pdo = null;

    /**
     * Older installs may lack `full_name` on `users`. Add it once so register/login work without manual SQL.
     */
    public static function ensureUserManagementSchema(): void
    {
        static $done = false;
        if ($done) {
            return;
        }
        $done = true;
        try {
            $pdo = self::pdo();
        } catch (Throwable) {
            return;
        }
        try {
            $t = $pdo->query("SHOW TABLES LIKE 'users'");
            if ($t === false || $t->fetch(PDO::FETCH_NUM) === false) {
                return;
            }
            $c = $pdo->query("SHOW COLUMNS FROM `users` LIKE 'full_name'");
            if ($c !== false && $c->fetch(PDO::FETCH_ASSOC) !== false) {
                return;
            }
            $pdo->exec(
                'ALTER TABLE `users` ADD COLUMN `full_name` varchar(150) DEFAULT NULL AFTER `email`'
            );
        } catch (Throwable $e) {
            error_log('WalletIQ ensureUserManagementSchema: ' . $e->getMessage());
        }
    }

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }
        $c = app_config()['mysql'];
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $c['host'],
            $c['port'],
            $c['database']
        );
        self::$pdo = new PDO($dsn, $c['user'], $c['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return self::$pdo;
    }
}
