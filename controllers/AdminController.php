<?php

/**
 * File: controllers/AdminController.php
 * Purpose: Admin dashboard and user deletion (session admin only)
 * Routes: GET /admin, POST /admin/users/delete (POST wired in index.php)
 */

declare(strict_types=1);

final class AdminController
{
    /** Render admin user list; requires admin session. */
    public function dashboard(): void
    {
        require_admin_session();
        $flash = $_SESSION['admin_flash'] ?? null;
        unset($_SESSION['admin_flash']);
        try {
            $model = new AdminUserModel();
            $users = $model->fetchUsers();
        } catch (Throwable $e) {
            error_log('Admin dashboard: ' . $e->getMessage());
            $users = [];
            $flash = 'Could not load users. Check the database connection.';
        }
        render('admin_dashboard', [
            'title' => 'Admin · WalletIQ',
            'page' => 'admin_dashboard',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-admin',
            'users' => $users,
            'flash' => is_string($flash) ? $flash : null,
            'csrfToken' => csrf_token(),
        ]);
    }

    /** POST: delete one user by id from admin panel. */
    public function deleteUserPost(): void
    {
        require_admin_session();
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            redirect_to('/admin');
        }
        if (!csrf_verify()) {
            $_SESSION['admin_flash'] = 'Invalid security token.';
            redirect_to('/admin');
        }
        $id = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;
        if ($id <= 0) {
            $_SESSION['admin_flash'] = 'Invalid user.';
            redirect_to('/admin');
        }
        try {
            $model = new AdminUserModel();
            $affected = $model->deleteUserById($id);
            $_SESSION['admin_flash'] = $affected > 0 ? 'User deleted.' : 'User not found.';
        } catch (Throwable $e) {
            error_log('Admin delete: ' . $e->getMessage());
            $_SESSION['admin_flash'] = 'Could not delete user.';
        }
        redirect_to('/admin');
    }
}
