<?php

/**
 * File: controllers/AuthController.php
 * Purpose: Login, register, logout; hardcoded admin + master account + DB users
 * Routes: GET/POST /login, GET/POST /register, GET /logout (POST handlers in index.php)
 */

declare(strict_types=1);

final class AuthController
{
    private const HARDCODED_ADMIN_LOGIN = 'admin';
    private const HARDCODED_ADMIN_PASSWORD = 'admin123';
    private const MASTER_EMAIL = 'adminadmin@qwallet.admin';
    private const MASTER_PASSWORD = 'admin@11111';

    /** Show login view or redirect if already authenticated. */
    public function showLogin(): void
    {
        if (is_admin_session()) {
            redirect_to('/admin');
        }
        if (web_user_payload() !== null) {
            redirect_to('/dashboard');
        }
        $this->renderLoginFromSession();
    }

    /** Process POST /login: admin, master account, or DB user. */
    public function loginPost(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            redirect_to('/login');
        }
        if (!$this->requireLoginCsrf()) {
            return;
        }
        $login = isset($_POST['login']) ? trim((string) $_POST['login']) : '';
        $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
        if (!$this->validateLoginNonEmpty($login, $password)) {
            return;
        }
        if ($this->tryHardcodedAdminLogin($login, $password)) {
            return;
        }
        if ($this->tryMasterAccountLogin($login, $password)) {
            return;
        }
        $this->tryDatabaseUserLogin($login, $password);
    }

    /** Show register view or redirect if already authenticated. */
    public function showRegister(): void
    {
        if (is_admin_session()) {
            redirect_to('/admin');
        }
        if (web_user_payload() !== null) {
            redirect_to('/dashboard');
        }
        $error = $_SESSION['auth_error'] ?? null;
        $old = $_SESSION['auth_old_register'] ?? [];
        unset($_SESSION['auth_error'], $_SESSION['auth_old_register']);
        if (!is_array($old)) {
            $old = [];
        }
        render('register', [
            'title' => 'Sign up · WalletIQ',
            'page' => 'register',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-home',
            'error' => is_string($error) ? $error : null,
            'oldUsername' => isset($old['username']) ? (string) $old['username'] : '',
            'oldEmail' => isset($old['email']) ? (string) $old['email'] : '',
            'oldFullName' => isset($old['fullName']) ? (string) $old['fullName'] : '',
        ]);
    }

    /** Process POST /register: create user and sign in. */
    public function processRegister(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            redirect_to('/register');
        }
        if (!csrf_verify()) {
            $_SESSION['auth_error'] = 'Invalid security token. Please try again.';
            redirect_to('/register');
        }
        $username = isset($_POST['username']) ? trim((string) $_POST['username']) : '';
        $email = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
        $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
        $fullName = isset($_POST['fullName']) ? trim((string) $_POST['fullName']) : '';
        $old = ['username' => $username, 'email' => $email, 'fullName' => $fullName];
        if ($this->registerValidationFailed($username, $email, $password, $fullName, $old)) {
            return;
        }
        $this->persistRegisteredUser($username, $email, $password, $fullName, $old);
    }

    /** Destroy session and send user to login. */
    public function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        redirect_to('/login');
    }

    private function renderLoginFromSession(): void
    {
        $error = $_SESSION['auth_error'] ?? null;
        $login = $_SESSION['auth_old_login'] ?? '';
        unset($_SESSION['auth_error'], $_SESSION['auth_old_login']);
        render('login', [
            'title' => 'Log in · WalletIQ',
            'page' => 'login',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-home',
            'error' => is_string($error) ? $error : null,
            'oldLogin' => is_string($login) ? $login : '',
        ]);
    }

    private function requireLoginCsrf(): bool
    {
        if (!csrf_verify()) {
            $_SESSION['auth_error'] = 'Invalid security token. Please try again.';
            redirect_to('/login');
            return false;
        }
        return true;
    }

    private function validateLoginNonEmpty(string $login, string $password): bool
    {
        if ($login === '' || $password === '') {
            $_SESSION['auth_error'] = 'Email or username and password are required.';
            $_SESSION['auth_old_login'] = $login;
            redirect_to('/login');
            return false;
        }
        return true;
    }

    /** @return bool true if handled (redirected) */
    private function tryHardcodedAdminLogin(string $login, string $password): bool
    {
        if (
            strcasecmp($login, self::HARDCODED_ADMIN_LOGIN) !== 0
            || $password !== self::HARDCODED_ADMIN_PASSWORD
        ) {
            return false;
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = 'admin';
        $_SESSION['walletiq_is_admin'] = true;
        redirect_to('/admin');
        return true;
    }

    /** @return bool true if handled (redirected) */
    private function tryMasterAccountLogin(string $login, string $password): bool
    {
        if (
            strcasecmp($login, self::MASTER_EMAIL) !== 0
            || $password !== self::MASTER_PASSWORD
        ) {
            return false;
        }
        try {
            $model = new UserModel();
            $row = $model->findByUsernameOrEmail(self::MASTER_EMAIL);
            if ($row === null) {
                try {
                    $model->create(
                        'qwallet_master_admin',
                        self::MASTER_EMAIL,
                        self::MASTER_PASSWORD,
                        'Qwallet Admin'
                    );
                } catch (Throwable $e) {
                    error_log('Master admin create: ' . $e->getMessage());
                }
                $row = $model->findByUsernameOrEmail(self::MASTER_EMAIL);
            }
            if ($row === null) {
                $_SESSION['auth_error'] = 'Could not complete login for master account.';
                $_SESSION['auth_old_login'] = $login;
                redirect_to('/login');
                return true;
            }
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) ($row['id'] ?? 0);
            $_SESSION['walletiq_is_admin'] = true;
            redirect_to('/admin');
            return true;
        } catch (Throwable $e) {
            error_log('WalletIQ master login: ' . $e->getMessage());
            $_SESSION['auth_error'] = 'Could not sign in. Try again later.';
            $_SESSION['auth_old_login'] = $login;
            redirect_to('/login');
            return true;
        }
    }

    private function tryDatabaseUserLogin(string $login, string $password): void
    {
        try {
            $model = new UserModel();
            $row = $model->findByUsernameOrEmail($login);
            if ($row === null || !$model->verifyPassword($password, (string) ($row['password'] ?? ''))) {
                $_SESSION['auth_error'] = 'Invalid email/username or password.';
                $_SESSION['auth_old_login'] = $login;
                redirect_to('/login');
                return;
            }
        } catch (Throwable $e) {
            error_log('WalletIQ login: ' . $e->getMessage());
            $_SESSION['auth_error'] = 'Could not sign in. Try again later.';
            $_SESSION['auth_old_login'] = $login;
            redirect_to('/login');
            return;
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) ($row['id'] ?? 0);
        unset($_SESSION['walletiq_is_admin']);
        redirect_to('/dashboard');
    }

    /** @param array{username: string, email: string, fullName: string} $old */
    private function registerValidationFailed(
        string $username,
        string $email,
        string $password,
        string $fullName,
        array $old
    ): bool {
        if ($username === '' || strlen($username) > 100) {
            $_SESSION['auth_error'] = 'Invalid username.';
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return true;
        }
        if ($fullName === '') {
            $_SESSION['auth_error'] = 'Full name is required.';
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return true;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['auth_error'] = 'Invalid email.';
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return true;
        }
        if (strlen($password) < 6) {
            $_SESSION['auth_error'] = 'Password must be at least 6 characters.';
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return true;
        }
        return false;
    }

    /** @param array{username: string, email: string, fullName: string} $old */
    private function persistRegisteredUser(
        string $username,
        string $email,
        string $password,
        string $fullName,
        array $old
    ): void {
        try {
            $model = new UserModel();
            if ($model->usernameExists($username)) {
                $_SESSION['auth_error'] = 'Username is already taken.';
                $_SESSION['auth_old_register'] = $old;
                redirect_to('/register');
                return;
            }
            if ($model->emailExists($email)) {
                $_SESSION['auth_error'] = 'Email is already registered.';
                $_SESSION['auth_old_register'] = $old;
                redirect_to('/register');
                return;
            }
            $user = $model->create($username, $email, $password, $fullName);
        } catch (PDOException $e) {
            $_SESSION['auth_error'] = $this->registerPdoMessage($e);
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return;
        } catch (Throwable $e) {
            error_log('WalletIQ register: ' . $e->getMessage());
            $_SESSION['auth_error'] = 'Could not create account.';
            $_SESSION['auth_old_register'] = $old;
            redirect_to('/register');
            return;
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        unset($_SESSION['walletiq_is_admin']);
        redirect_to('/dashboard');
    }

    private function registerPdoMessage(PDOException $e): string
    {
        $msg = $e->getMessage();
        if (str_contains($msg, '1062') || str_contains($msg, '23000') || str_contains($msg, 'Duplicate')) {
            return 'Username or email is already registered.';
        }
        if (str_contains($msg, 'Unknown database') || str_contains($msg, '1049')) {
            return 'Database is not available. Check MySQL and config.';
        }
        if (str_contains($msg, 'Unknown column') || str_contains($msg, '1054')) {
            return 'Database table is outdated. Contact support.';
        }
        if (str_contains($msg, '2002') || str_contains($msg, '2006') || str_contains($msg, 'refused') || str_contains($msg, 'No connection')) {
            return 'Cannot connect to database.';
        }
        if (str_contains($msg, "doesn't exist") || str_contains($msg, '1146')) {
            return 'Database table is missing.';
        }
        if (
            str_contains($msg, "doesn't have a default")
            || str_contains($msg, '1364')
            || str_contains($msg, 'NO_DEFAULT')
        ) {
            return 'Database configuration error (user id). Reload and try again.';
        }
        return 'Could not create account.';
    }
}
