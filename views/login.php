<?php

declare(strict_types=1);

/** @var string|null $error */
/** @var string $oldLogin */
$err = isset($error) && is_string($error) && $error !== '' ? $error : null;
$ol = isset($oldLogin) ? (string) $oldLogin : '';
$b = htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8');
?>
<!-- View: login | Login + signup slider; POST /login and /register -->
<div class="home-page">
    <div id="auth-panel" class="auth-wrap">
        <header class="auth-header">
            <div class="auth-brand-icon" aria-hidden="true">
                <svg class="auth-brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 class="auth-title">WalletIQ</h1>
            <p class="auth-subtitle">Sign in or create an account.</p>
        </header>
        <div class="auth-toggle" role="tablist" aria-label="Authentication mode">
            <button type="button" class="auth-tab auth-tab--active" id="auth-tab-login" role="tab" aria-selected="true" aria-controls="auth-tabpanel-login" tabindex="0">Log in</button>
            <button type="button" class="auth-tab" id="auth-tab-signup" role="tab" aria-selected="false" aria-controls="auth-tabpanel-signup" tabindex="-1">Sign up</button>
        </div>

        <div id="auth-slider" class="auth-slider auth-slider--login" aria-live="polite">
            <div class="auth-slider-track">
                <div class="auth-slider-pane" id="auth-tabpanel-login" role="tabpanel" aria-labelledby="auth-tab-login" aria-hidden="false">
                    <form id="auth-form-login" class="auth-form" method="post" action="<?= $b ?>/login" novalidate>
                        <?php csrf_field(); ?>
                        <label class="auth-label">
                            Email or username
                            <input class="auth-input" name="login" type="text" autocomplete="username" required value="<?= htmlspecialchars($ol, ENT_QUOTES, 'UTF-8') ?>">
                        </label>
                        <label class="auth-label">
                            Password
                            <input class="auth-input" name="password" type="password" autocomplete="current-password" required>
                        </label>
                        <?php if ($err !== null): ?>
                            <p id="auth-error-login" class="auth-error" role="alert"><?= htmlspecialchars($err, ENT_QUOTES, 'UTF-8') ?></p>
                        <?php else: ?>
                            <p id="auth-error-login" class="auth-error" role="alert" hidden></p>
                        <?php endif; ?>
                        <button class="auth-submit" type="submit">Log in</button>
                    </form>
                </div>
                <div class="auth-slider-pane" id="auth-tabpanel-signup" role="tabpanel" aria-labelledby="auth-tab-signup" aria-hidden="true">
                    <p class="auth-slider-lead">Create an account to use WalletIQ as a regular user.</p>
                    <form id="auth-form-signup" class="auth-form" method="post" action="<?= $b ?>/register" novalidate>
                        <?php csrf_field(); ?>
                        <label class="auth-label">
                            Username
                            <input class="auth-input" name="username" type="text" autocomplete="username" required>
                        </label>
                        <label class="auth-label">
                            Email
                            <input class="auth-input" name="email" type="email" autocomplete="email" required>
                        </label>
                        <label class="auth-label">
                            Password
                            <input class="auth-input" name="password" type="password" autocomplete="new-password" required>
                        </label>
                        <label class="auth-label">
                            Full name
                            <input class="auth-input" name="fullName" type="text" autocomplete="name" required>
                        </label>
                        <p id="auth-error-signup" class="auth-error" role="alert" hidden></p>
                        <button class="auth-submit" type="submit">Create account</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
