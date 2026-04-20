<?php

/**
 * File: controllers/BudgetsController.php
 * Purpose: Monthly budget limits per category
 * Routes: GET /budgets
 */

declare(strict_types=1);

final class BudgetsController
{
    /** Show budgets view for the logged-in user. */
    public function index(): void
    {
        require_web_auth();
        render('budgets', [
            'title' => 'Budgets · WalletIQ',
            'page' => 'budgets',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
            'phpUser' => web_user_payload(),
        ]);
    }
}
