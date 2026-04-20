<?php

/**
 * File: controllers/HomeController.php
 * Purpose: Root URL redirects by auth state
 * Routes: GET /
 */

declare(strict_types=1);

final class HomeController
{
    /** Redirect admins, logged-in users, or guests to the right entry page. */
    public function index(): void
    {
        if (is_admin_session()) {
            redirect_to('/admin');
        }
        if (web_user_payload() !== null) {
            redirect_to('/dashboard');
        }
        redirect_to('/login');
    }
}
