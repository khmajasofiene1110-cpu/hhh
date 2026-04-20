<?php

/**
 * File: controllers/StatsController.php
 * Purpose: Statistics page (charts, transactions)
 * Routes: GET /stats
 */

declare(strict_types=1);

final class StatsController
{
    /** Show stats view for the logged-in user. */
    public function index(): void
    {
        require_web_auth();
        render('stats', [
            'title' => 'Statistiques · WalletIQ',
            'page' => 'stats',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
            'phpUser' => web_user_payload(),
        ]);
    }
}
