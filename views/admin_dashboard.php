<?php

declare(strict_types=1);

/** @var list<array<string,mixed>> $users */
/** @var string|null $flash */
/** @var string $csrfToken */

$users = isset($users) && is_array($users) ? $users : [];
$flash = isset($flash) && is_string($flash) && $flash !== '' ? $flash : null;
$b = htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8');
$csrf = htmlspecialchars($csrfToken ?? csrf_token(), ENT_QUOTES, 'UTF-8');

$total = count($users);
$admins = 0;
foreach ($users as $ur) {
    if (strtolower(trim((string) ($ur['username'] ?? ''))) === 'admin') {
        $admins++;
    }
}
$regular = $total - $admins;

function admin_fmt_date(?string $v): string
{
    if ($v === null || $v === '') {
        return '-';
    }
    $ts = strtotime($v);
    return $ts !== false ? date('M j, Y', $ts) : '-';
}

function admin_last_seen_label(array $r): string
{
    $name = strtolower(trim((string) ($r['username'] ?? '')));
    if ($name === 'admin') {
        return 'Online Now';
    }
    $ls = $r['last_seen'] ?? null;
    if ($ls === null || $ls === '') {
        return 'Inactive';
    }
    $ts = is_string($ls) ? strtotime($ls) : false;
    if ($ts === false) {
        return 'Inactive';
    }
    $diffSec = (int) round((time() - $ts));
    $abs = abs($diffSec);
    if ($abs < 60) {
        return 'Active ' . $abs . 's ago';
    }
    if ($abs < 3600) {
        return 'Active ' . (int) round($abs / 60) . ' mins ago';
    }
    if ($abs < 86400) {
        return 'Active ' . (int) round($abs / 3600) . ' hrs ago';
    }
    if ($abs < 2 * 86400) {
        return 'Yesterday';
    }
    return 'Active ' . (int) round($abs / 86400) . ' days ago';
}

?>
<!-- View: admin_dashboard | User list and delete (admin session) -->
<div class="admin-dash">
    <header class="admin-dash-header">
        <div class="admin-dash-brand">
            <div class="admin-dash-logo" aria-hidden="true">W</div>
            <div>
                <div class="admin-dash-title">Master Admin Dashboard</div>
                <div class="admin-dash-sub">WalletIQ Management System</div>
            </div>
        </div>
        <a class="admin-dash-logout" href="<?= $b ?>/logout" id="admin-logout">Logout</a>
    </header>

    <?php if ($flash !== null): ?>
        <div id="adm-flash" class="admin-error" role="alert"><?= htmlspecialchars($flash, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <div id="adm-error" class="admin-error" role="alert" hidden></div>

    <div class="admin-dash-stats">
        <div class="admin-stat admin-stat--blue">
            <div class="admin-stat-label">Total Users</div>
            <div class="admin-stat-value" id="adm-stat-total"><?= (int) $total ?></div>
            <div class="admin-stat-sub">Registered accounts</div>
        </div>
        <div class="admin-stat admin-stat--green">
            <div class="admin-stat-label">Regular Users</div>
            <div class="admin-stat-value" id="adm-stat-regular"><?= (int) $regular ?></div>
            <div class="admin-stat-sub">Standard accounts</div>
        </div>
        <div class="admin-stat admin-stat--purple">
            <div class="admin-stat-label">Administrators</div>
            <div class="admin-stat-value" id="adm-stat-admins"><?= (int) $admins ?></div>
            <div class="admin-stat-sub">Admin accounts</div>
        </div>
    </div>

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
                        <?php if (count($users) === 0): ?>
                            <tr><td colspan="7" class="admin-table-empty">No users yet.</td></tr>
                        <?php else: ?>
                            <?php foreach ($users as $urow): ?>
                                <?php
                                $id = (int) ($urow['id'] ?? 0);
                                $uname = (string) ($urow['username'] ?? '');
                                $isAdmin = strtolower(trim($uname)) === 'admin';
                                $dispName = $isAdmin ? 'Admin' : $uname;
                                $emailDisp = $isAdmin ? 'admin@gmail.com' : (string) ($urow['email'] ?? '');
                                $role = $isAdmin ? 'ADMIN' : 'USER';
                                $createdDisp = admin_fmt_date(isset($urow['last_seen']) ? (string) $urow['last_seen'] : null);
                                $lastDisp = admin_last_seen_label($urow);
                                $idShort = $id > 0 ? (substr((string) $id, 0, 6) . '…') : '-';
                                ?>
                                <tr class="admin-tr" data-search="<?= htmlspecialchars(strtolower($dispName . ' ' . $emailDisp), ENT_QUOTES, 'UTF-8') ?>">
                                    <td class="admin-td-id"><?= htmlspecialchars($idShort, ENT_QUOTES, 'UTF-8') ?></td>
                                    <td class="admin-td-name"><?= htmlspecialchars($dispName, ENT_QUOTES, 'UTF-8') ?></td>
                                    <td class="admin-td-email"><?= htmlspecialchars($emailDisp, ENT_QUOTES, 'UTF-8') ?></td>
                                    <td><span class="admin-role"><span class="admin-role-dot"></span><?= htmlspecialchars($role, ENT_QUOTES, 'UTF-8') ?></span></td>
                                    <td><?= htmlspecialchars($createdDisp, ENT_QUOTES, 'UTF-8') ?></td>
                                    <td><?= htmlspecialchars($lastDisp, ENT_QUOTES, 'UTF-8') ?></td>
                                    <td class="admin-td-actions">
                                        <button type="button" class="admin-icon-btn" aria-label="Edit" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                                        <button type="button" class="admin-icon-btn admin-icon-btn--danger adm-del-btn" data-user-id="<?= $id ?>" data-user-name="<?= htmlspecialchars($dispName, ENT_QUOTES, 'UTF-8') ?>" aria-label="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<form id="adm-delete-form" class="adm-delete-form-hidden" method="post" action="<?= htmlspecialchars(app_full_url('/admin/users/delete'), ENT_QUOTES, 'UTF-8') ?>" autocomplete="off">
    <input type="hidden" name="csrf_token" value="<?= $csrf ?>">
    <input type="hidden" name="user_id" id="adm-delete-user-id" value="">
</form>

<div id="adm-modal-backdrop" class="confirm-backdrop" role="presentation" hidden>
    <div id="adm-modal" class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="adm-modal-title">
        <h2 id="adm-modal-title" class="confirm-title">Delete account?</h2>
        <div class="confirm-body" id="adm-modal-body"></div>
        <div class="confirm-actions">
            <button type="button" class="confirm-cancel" id="adm-modal-cancel">Cancel</button>
            <button type="button" class="confirm-danger" id="adm-modal-confirm">Delete account</button>
        </div>
    </div>
</div>
