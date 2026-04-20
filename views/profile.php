<?php

declare(strict_types=1);
?>
<!-- View: profile | Edit profile, reset data, logout -->
<div class="profile-page">
    <div id="pf-guest" class="state state--center" aria-busy="true"><div class="spinner" role="status"><span class="spinner__ring" aria-hidden="true"></span></div></div>
    <div id="pf-app" hidden>
        <div>
            <h1 class="pf-title">Profile</h1>
            <p class="pf-lead">Update your account details</p>
        </div>
        <form id="pf-form" class="pf-card">
            <div class="pf-field">
                <label class="pf-label" for="pf-name">Full name</label>
                <input id="pf-name" class="pf-input" autocomplete="name" required>
            </div>
            <div class="pf-field">
                <label class="pf-label" for="pf-user">Username</label>
                <input id="pf-user" class="pf-input" autocomplete="username" required>
            </div>
            <p id="pf-err" class="pf-msg pf-msg--err" role="alert" hidden></p>
            <p id="pf-msg" class="pf-msg" hidden></p>
            <button type="submit" class="pf-save">Save changes</button>
        </form>
        <section class="pf-danger">
            <h2 class="pf-danger-title">Data &amp; session</h2>
            <p class="pf-danger-text">Reset data removes every transaction for your account in this browser. Your login and your savings goals and budgets stay as they are.</p>
            <button type="button" class="pf-reset" id="pf-reset-open">Reset transaction data</button>
            <a class="pf-logout" id="pf-logout" href="<?= htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8') ?>/logout">
                <span class="pf-logout-inner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log out
                </span>
            </a>
        </section>
    </div>
</div>

<div id="pf-modal-backdrop" class="confirm-backdrop" role="presentation" hidden>
    <div id="pf-modal" class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="pf-modal-title">
        <h2 id="pf-modal-title" class="confirm-title">Reset transactions?</h2>
        <div class="confirm-body"><p>This clears all transactions for your account. Goals and budgets are not removed.</p></div>
        <div class="confirm-actions">
            <button type="button" class="confirm-cancel" id="pf-modal-cancel">Cancel</button>
            <button type="button" class="confirm-danger" id="pf-modal-confirm">Reset data</button>
        </div>
    </div>
</div>
