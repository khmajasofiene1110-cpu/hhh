<?php

declare(strict_types=1);

final class GoalsController
{
    public function index(): void
    {
        render('goals', [
            'title' => 'Goals · WalletIQ',
            'page' => 'goals',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
        ]);
    }
}
