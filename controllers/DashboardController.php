<?php

declare(strict_types=1);

final class DashboardController
{
    public function index(): void
    {
        render('dashboard', [
            'title' => 'Dashboard · WalletIQ',
            'page' => 'dashboard',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
        ]);
    }
}
