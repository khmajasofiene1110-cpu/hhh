<?php

/**
 * File: controllers/GoalsController.php
 * Purpose: Savings goals UI
 * Routes: GET /goals
 */

declare(strict_types=1);

final class GoalsController
{
    /** Show goals view for the logged-in user. */
    public function index(): void
    {
        require_web_auth();
        render('goals', [
            'title' => 'Goals · WalletIQ',
            'page' => 'goals',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
            'phpUser' => web_user_payload(),
        ]);
    }
}
