<?php

declare(strict_types=1);

/** @var string|null $error */
/** @var string $oldUsername */
/** @var string $oldEmail */
/** @var string $oldFullName */
$err = isset($error) && is_string($error) && $error !== '' ? $error : null;
$ou = isset($oldUsername) ? (string) $oldUsername : '';
$oe = isset($oldEmail) ? (string) $oldEmail : '';
$of = isset($oldFullName) ? (string) $oldFullName : '';
$b = htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8');
?>
<!-- View: register | Standalone sign-up; POST /register -->
<div class="home-page">
    <div id="auth-panel" class="auth-wrap">
        <header class="auth-header">
            <div class="auth-brand-icon" aria-hidden="true">
                <svg class="auth-brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 class="auth-title">WalletIQ</h1>
            <p class="auth-subtitle">Create an account to get started.</p>
        </header>
        <div class="auth-toggle" role="tablist" aria-label="Authentication mode">
            <a class="auth-tab" href="<?= $b ?>/login" role="tab" aria-selected="false">Log in</a>
            <a class="auth-tab auth-tab--active" href="<?= $b ?>/register" role="tab" aria-selected="true">Sign up</a>
        </div>
        <form id="auth-form-signup" class="auth-form" method="post" action="<?= $b ?>/register" novalidate>
            <?php csrf_field(); ?>
            <label class="auth-label">
                Username
                <input class="auth-input" name="username" type="text" autocomplete="username" required value="<?= htmlspecialchars($ou, ENT_QUOTES, 'UTF-8') ?>">
            </label>
            <label class="auth-label">
                Email
                <input class="auth-input" name="email" type="email" autocomplete="email" required value="<?= htmlspecialchars($oe, ENT_QUOTES, 'UTF-8') ?>">
            </label>
            <label class="auth-label">
                Password
                <input class="auth-input" name="password" type="password" autocomplete="new-password" required>
            </label>
            <label class="auth-label">
                Full name
                <input class="auth-input" name="fullName" type="text" autocomplete="name" required value="<?= htmlspecialchars($of, ENT_QUOTES, 'UTF-8') ?>">
            </label>
            <?php if ($err !== null): ?>
                <p id="auth-error-signup" class="auth-error" role="alert"><?= htmlspecialchars($err, ENT_QUOTES, 'UTF-8') ?></p>
            <?php else: ?>
                <p id="auth-error-signup" class="auth-error" role="alert" hidden></p>
            <?php endif; ?>
            <button class="auth-submit" type="submit">Create account</button>
        </form>
    </div>
</div>
