<?php

declare(strict_types=1);
?>
<div class="home-page">
    <div id="auth-loading" class="state state--center" aria-busy="true">
        <div class="spinner" role="status" aria-live="polite"><span class="spinner__ring" aria-hidden="true"></span></div>
    </div>
    <div id="auth-panel" class="auth-wrap" hidden>
        <header class="auth-header">
            <div class="auth-brand-icon" aria-hidden="true">
                <svg class="auth-brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 class="auth-title">WalletIQ</h1>
            <p class="auth-subtitle">Sign in to manage your money.</p>
        </header>
        <div class="auth-toggle" role="tablist" aria-label="Authentication mode">
            <button type="button" class="auth-tab auth-tab--active" data-mode="login" role="tab" aria-selected="true">Log in</button>
            <button type="button" class="auth-tab" data-mode="signup" role="tab" aria-selected="false">Sign up</button>
        </div>
        <form id="auth-form" class="auth-form" novalidate>
            <label class="auth-label" id="auth-fullname-wrap" hidden>
                Full name
                <input class="auth-input" name="fullName" type="text" autocomplete="name" disabled>
            </label>
            <label class="auth-label" id="auth-email-wrap">
                Email
                <input class="auth-input" name="email" type="email" autocomplete="email" required>
            </label>
            <label class="auth-label" id="auth-username-wrap" hidden>
                <span class="auth-label-caption" id="auth-username-caption">Username</span>
                <input class="auth-input" name="username" type="text" autocomplete="username" disabled>
            </label>
            <label class="auth-label">
                Password
                <input class="auth-input" name="password" type="password" autocomplete="current-password" required>
            </label>
            <p id="auth-error" class="auth-error" role="alert" hidden></p>
            <button class="auth-submit" type="submit">Log in</button>
        </form>
    </div>
</div>
