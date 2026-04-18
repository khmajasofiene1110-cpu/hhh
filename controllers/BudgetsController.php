<?php

declare(strict_types=1);

final class BudgetsController
{
    public function index(): void
    {
        render('budgets', [
            'title' => 'Budgets · WalletIQ',
            'page' => 'budgets',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
        ]);
    }
}
