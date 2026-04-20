<?php

/**
 * File: controllers/ProfileController.php
 * Purpose: User profile and logout link
 * Routes: GET /profile
 */

declare(strict_types=1);

final class ProfileController
{
    /** Show profile view for the logged-in user. */
    public function index(): void
    {
        require_web_auth();
        render('profile', [
            'title' => 'Profile · WalletIQ',
            'page' => 'profile',
            'shell' => true,
            'showNav' => true,
            'bodyClass' => 'page-app',
            'phpUser' => web_user_payload(),
        ]);
    }
}
