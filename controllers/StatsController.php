<?php

declare(strict_types=1);

final class StatsController
{
    public function index(): void
    {
        render('stats', [
            'title' => 'Statistiques · WalletIQ',
            'page' => 'stats',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
        ]);
    }
}
