<?php

declare(strict_types=1);

final class AdminWebController
{
    public function login(): void
    {
        render('admin_login', [
            'title' => 'Admin Login · WalletIQ',
            'page' => 'admin_login',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-admin-login',
        ]);
    }

    public function dashboard(): void
    {
        render('admin_dashboard', [
            'title' => 'Admin · WalletIQ',
            'page' => 'admin_dashboard',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-admin',
        ]);
    }
}
