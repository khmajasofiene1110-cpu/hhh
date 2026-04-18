<?php

declare(strict_types=1);

/**
 * Simple route map: path => [ControllerClass, method].
 *
 * @var array<string, array{0: class-string, 1: string}>
 */
return [
    '/' => ['HomeController', 'index'],
    '/dashboard' => ['DashboardController', 'index'],
    '/stats' => ['StatsController', 'index'],
    '/budgets' => ['BudgetsController', 'index'],
    '/goals' => ['GoalsController', 'index'],
    '/profile' => ['ProfileController', 'index'],
    '/admin/login' => ['AdminWebController', 'login'],
    '/admin' => ['AdminWebController', 'dashboard'],
];
