<?php

declare(strict_types=1);

final class HomeController
{
    public function index(): void
    {
        render('home', [
            'title' => 'WalletIQ',
            'page' => 'home',
            'shell' => false,
            'showNav' => false,
            'bodyClass' => 'page-home',
        ]);
    }
}
