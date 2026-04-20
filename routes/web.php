<?php

/**
 * File: routes/web.php
 * Purpose: GET page routes (path => [Controller, action])
 * Routes: /, /login, /register, /dashboard, /stats, /budgets, /goals, /profile, /admin
 */

declare(strict_types=1);

/**
 * @var array<string, array{0: class-string, 1: string}>
 */
return [
    '/' => ['HomeController', 'index'],
    '/login' => ['AuthController', 'showLogin'],
    '/register' => ['AuthController', 'showRegister'],
    '/dashboard' => ['DashboardController', 'index'],
    '/stats' => ['StatsController', 'index'],
    '/budgets' => ['BudgetsController', 'index'],
    '/goals' => ['GoalsController', 'index'],
    '/profile' => ['ProfileController', 'index'],
    '/admin' => ['AdminController', 'dashboard'],
];
