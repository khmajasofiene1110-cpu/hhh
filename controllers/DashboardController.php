<?php

/**
 * File: controllers/DashboardController.php
 * Purpose: Main app dashboard (requires web auth)
 * Routes: GET /dashboard
 */

declare(strict_types=1);

final class DashboardController
{
    /** Show dashboard with hydrated user for client JS. */
    public function index(): void
    {
        require_web_auth();
        render('dashboard', [
            'title' => 'Dashboard · WalletIQ',
            'page' => 'dashboard',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
            'phpUser' => web_user_payload(),
        ]);
    }
}
