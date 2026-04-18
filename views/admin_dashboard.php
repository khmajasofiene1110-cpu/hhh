<?php

declare(strict_types=1);
?>
<div class="admin-dash">
    <header class="admin-dash-header">
        <div class="admin-dash-brand">
            <div class="admin-dash-logo" aria-hidden="true">W</div>
            <div>
                <div class="admin-dash-title">Master Admin Dashboard</div>
                <div class="admin-dash-sub">WalletIQ Management System</div>
            </div>
        </div>
        <button type="button" class="admin-dash-logout" id="admin-logout">Logout</button>
    </header>

    <div class="admin-dash-stats">
        <div class="admin-stat admin-stat--blue">
            <div class="admin-stat-label">Total Users</div>
            <div class="admin-stat-value" id="adm-stat-total">0</div>
            <div class="admin-stat-sub">Registered accounts</div>
        </div>
        <div class="admin-stat admin-stat--green">
            <div class="admin-stat-label">Regular Users</div>
            <div class="admin-stat-value" id="adm-stat-regular">0</div>
            <div class="admin-stat-sub">Standard accounts</div>
        </div>
        <div class="admin-stat admin-stat--purple">
            <div class="admin-stat-label">Administrators</div>
            <div class="admin-stat-value" id="adm-stat-admins">0</div>
            <div class="admin-stat-sub">Admin accounts</div>
        </div>
    </div>

    <div id="adm-error" class="admin-error" role="alert" hidden></div>

    <div class="admin-table-wrap">
        <div class="admin-table-toolbar">
            <label class="sr-only" for="adm-search">Search users</label>
            <input id="adm-search" class="admin-search" type="search" placeholder="Search users..." autocomplete="off">
        </div>
        <div class="admin-table-card">
            <div class="admin-table-head">
                <div class="admin-table-title">Registered Users Database</div>
                <div class="admin-table-sub">Manage all user accounts and permissions</div>
            </div>
            <div class="admin-table-scroll">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Created At</th><th>Last Seen</th><th class="admin-table-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="adm-tbody">
                        <tr><td colspan="7" class="admin-table-empty">Loading users…</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div id="adm-modal-backdrop" class="confirm-backdrop" role="presentation" hidden></div>
<div id="adm-modal" class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="adm-modal-title" hidden>
    <h2 id="adm-modal-title" class="confirm-title">Delete account?</h2>
    <div class="confirm-body" id="adm-modal-body"></div>
    <div class="confirm-actions">
        <button type="button" class="confirm-cancel" id="adm-modal-cancel">Cancel</button>
        <button type="button" class="confirm-danger" id="adm-modal-confirm">Delete account</button>
    </div>
</div>
