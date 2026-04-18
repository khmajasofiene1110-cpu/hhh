<?php

declare(strict_types=1);
?>
<div class="admin-login-page">
    <div class="admin-login-card">
        <div class="admin-login-head">
            <h1 class="admin-login-h1">Admin Login</h1>
            <p class="admin-login-lead">Sign in to access the Master Admin Dashboard.</p>
        </div>
        <form id="admin-login-form" class="admin-login-form">
            <div class="admin-login-field">
                <label class="admin-login-label" for="adm-user">Username</label>
                <input id="adm-user" class="admin-login-input" autocomplete="username" placeholder="admin">
            </div>
            <div class="admin-login-field">
                <label class="admin-login-label" for="adm-pass">Password</label>
                <input id="adm-pass" class="admin-login-input" type="password" autocomplete="current-password" placeholder="••••••••">
            </div>
            <div id="adm-err" class="admin-login-error" role="alert" hidden></div>
            <button type="submit" class="admin-login-submit" id="adm-submit">Sign in</button>
        </form>
    </div>
</div>
