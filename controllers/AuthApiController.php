<?php

declare(strict_types=1);

final class AuthApiController
{
    public function register(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->methodNotAllowed();
            return;
        }
        $body = read_json_body();
        $username = isset($body['username']) ? trim((string) $body['username']) : '';
        $email = isset($body['email']) ? trim((string) $body['email']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';
        $fullName = isset($body['fullName']) ? trim((string) $body['fullName']) : '';

        if ($username === '' || strlen($username) > 100) {
            $this->jsonError('Invalid username.', 400);
            return;
        }
        if ($fullName === '') {
            $this->jsonError('Full name is required.', 400);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonError('Invalid email.', 400);
            return;
        }
        if (strlen($password) < 6) {
            $this->jsonError('Password must be at least 6 characters.', 400);
            return;
        }

        try {
            $model = new UserModel();
            if ($model->usernameExists($username)) {
                $this->jsonError('Username is already taken.', 409);
                return;
            }
            if ($model->emailExists($email)) {
                $this->jsonError('Email is already registered.', 409);
                return;
            }
            $user = $model->create($username, $email, $password, $fullName);
        } catch (PDOException $e) {
            $this->registerPdoError($e);
            return;
        } catch (Throwable $e) {
            error_log('WalletIQ register: ' . $e->getMessage());
            $this->jsonError('Could not create account.', 500);
            return;
        }

        $this->loginSession($user['id']);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['user' => $this->clientUserPayload($user, $fullName)]);
    }

    public function login(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->methodNotAllowed();
            return;
        }
        $body = read_json_body();
        $login = isset($body['username']) ? trim((string) $body['username']) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if ($login === '' || $password === '') {
            $this->jsonError('Username/email and password are required.', 400);
            return;
        }

        $model = new UserModel();
        $row = $model->findByUsernameOrEmail($login);
        if ($row === null || !$model->verifyPassword($password, (string) ($row['password'] ?? ''))) {
            $this->jsonError('Invalid username/email or password.', 401);
            return;
        }

        $user = $model->publicUserRow($row);
        $this->loginSession($user['id']);
        $fn = $user['full_name'];
        if ($fn === null || $fn === '') {
            $fn = $user['username'];
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['user' => $this->clientUserPayload($user, $fn)]);
    }

    public function logout(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->methodNotAllowed();
            return;
        }
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => true]);
    }

    public function me(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
            $this->methodNotAllowed();
            return;
        }
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate');
        try {
            $id = $_SESSION['user_id'] ?? null;
            if (!is_int($id) && !is_string($id)) {
                echo json_encode(['user' => null]);
                return;
            }
            $uid = (int) $id;
            if ($uid <= 0) {
                echo json_encode(['user' => null]);
                return;
            }
            $model = new UserModel();
            $row = $model->findById($uid);
            if ($row === null) {
                unset($_SESSION['user_id']);
                echo json_encode(['user' => null]);
                return;
            }
            $user = $model->publicUserRow($row);
            $fn = $user['full_name'];
            if ($fn === null || $fn === '') {
                $fn = $user['username'];
            }
            echo json_encode(['user' => $this->clientUserPayload($user, $fn)]);
        } catch (Throwable $e) {
            http_response_code(503);
            echo json_encode([
                'user' => null,
                'error' => 'Could not load session. Check the database connection.',
            ]);
        }
    }

    /**
     * @param array{id: int, username: string, email: string, full_name: ?string, created_at: string} $user
     */
    private function clientUserPayload(array $user, string $displayFullName): array
    {
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'fullName' => $displayFullName,
            'createdAt' => $user['created_at'],
        ];
    }

    private function loginSession(int $userId): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
    }

    private function methodNotAllowed(): void
    {
        http_response_code(405);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Method not allowed']);
    }

    private function jsonError(string $message, int $code): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => $message]);
    }

    private function registerPdoError(PDOException $e): void
    {
        $msg = $e->getMessage();
        error_log('WalletIQ register PDO: ' . $msg);

        if (str_contains($msg, '1062') || str_contains($msg, '23000') || str_contains($msg, 'Duplicate')) {
            $this->jsonError('Username or email is already registered.', 409);
            return;
        }
        if (str_contains($msg, 'Unknown database') || str_contains($msg, '1049')) {
            $this->jsonError(
                'MySQL database is missing. Create database `user_management` and import hhh/database/user_management.sql (phpMyAdmin).',
                503
            );
            return;
        }
        if (str_contains($msg, 'Unknown column') || str_contains($msg, '1054')) {
            $this->jsonError(
                'Database table is outdated. Run hhh/database/user_management_upgrade.sql in phpMyAdmin on database `user_management`.',
                503
            );
            return;
        }
        if (str_contains($msg, '2002') || str_contains($msg, '2006') || str_contains($msg, 'refused') || str_contains($msg, 'No connection')) {
            $this->jsonError(
                'Cannot connect to MySQL. Start MySQL in XAMPP and check hhh/config/config.php (host, user, password, database).',
                503
            );
            return;
        }
        if (str_contains($msg, "doesn't exist") || str_contains($msg, '1146')) {
            $this->jsonError(
                'MySQL table `users` is missing. Import hhh/database/user_management.sql into database `user_management`.',
                503
            );
            return;
        }

        $this->jsonError('Could not create account. Check PHP error log and MySQL.', 500);
    }
}
