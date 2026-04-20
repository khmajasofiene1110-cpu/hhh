<?php

declare(strict_types=1);

$b = htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8');
$path = route_path();
?>
<!-- View: partial bottom_nav | App shell navigation -->
<nav class="bottom-nav bottom-nav--app" aria-label="Main">
    <a class="bottom-nav__link<?= ($path === '/dashboard' || str_starts_with($path, '/dashboard/')) ? ' bottom-nav__link--active' : '' ?>" href="<?= $b ?>/dashboard">
        <span class="bottom-nav__icon-slot">
            <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <?= ($path === '/dashboard' || str_starts_with($path, '/dashboard/')) ? '<span class="bottom-nav__dot" aria-hidden="true"></span>' : '' ?>
        </span>
        <span class="bottom-nav__label">Dashboard</span>
    </a>
    <a class="bottom-nav__link<?= ($path === '/stats' || str_starts_with($path, '/stats/')) ? ' bottom-nav__link--active' : '' ?>" href="<?= $b ?>/stats">
        <span class="bottom-nav__icon-slot">
            <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <?= ($path === '/stats' || str_starts_with($path, '/stats/')) ? '<span class="bottom-nav__dot" aria-hidden="true"></span>' : '' ?>
        </span>
        <span class="bottom-nav__label">Stats</span>
    </a>
    <a class="bottom-nav__link<?= ($path === '/budgets' || str_starts_with($path, '/budgets/')) ? ' bottom-nav__link--active' : '' ?>" href="<?= $b ?>/budgets">
        <span class="bottom-nav__icon-slot">
            <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            <?= ($path === '/budgets' || str_starts_with($path, '/budgets/')) ? '<span class="bottom-nav__dot" aria-hidden="true"></span>' : '' ?>
        </span>
        <span class="bottom-nav__label">Budgets</span>
    </a>
    <a class="bottom-nav__link<?= ($path === '/goals' || str_starts_with($path, '/goals/')) ? ' bottom-nav__link--active' : '' ?>" href="<?= $b ?>/goals">
        <span class="bottom-nav__icon-slot">
            <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <?= ($path === '/goals' || str_starts_with($path, '/goals/')) ? '<span class="bottom-nav__dot" aria-hidden="true"></span>' : '' ?>
        </span>
        <span class="bottom-nav__label">Goals</span>
    </a>
    <a class="bottom-nav__link<?= ($path === '/profile' || str_starts_with($path, '/profile/')) ? ' bottom-nav__link--active' : '' ?>" href="<?= $b ?>/profile">
        <span class="bottom-nav__icon-slot">
            <svg class="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <?= ($path === '/profile' || str_starts_with($path, '/profile/')) ? '<span class="bottom-nav__dot" aria-hidden="true"></span>' : '' ?>
        </span>
        <span class="bottom-nav__label">Profile</span>
    </a>
</nav>
