<?php

declare(strict_types=1);

final class ProfileController
{
    public function index(): void
    {
        render('profile', [
            'title' => 'Profile · WalletIQ',
            'page' => 'profile',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
        ]);
    }
}
