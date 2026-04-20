<?php

/**
 * File: views/layout.php
 * Purpose: HTML shell, assets, optional __WALLETIQ_PHP_USER__ for client hydration
 */

declare(strict_types=1);

/** @var string $content */
/** @var string $title */
/** @var string $page */
/** @var bool $shell */
/** @var bool $showNav */
/** @var string $bodyClass */
/** @var string $baseUrl */
/** @var array{id:int,username:string,email:string,fullName:string,createdAt:string}|null $phpUser */

$b = htmlspecialchars($baseUrl ?? '', ENT_QUOTES, 'UTF-8');
$p = htmlspecialchars($page ?? '', ENT_QUOTES, 'UTF-8');
$t = htmlspecialchars($title ?? 'WalletIQ', ENT_QUOTES, 'UTF-8');
$bc = htmlspecialchars($bodyClass ?? '', ENT_QUOTES, 'UTF-8');
?>
<!-- View: layout | App HTML wrapper and scripts -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="app-base" content="<?= $b ?>">
    <title><?= $t ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= $b ?>/public/css/app.css">
</head>
<body class="<?= $bc ?>" data-page="<?= $p ?>" data-base="<?= $b ?>">
<?php if (!empty($shell)): ?>
<div class="layout-outer">
    <div class="layout-with-nav">
        <div class="app-shell">
            <main class="app-main" id="app-main">
                <?= $content ?>
            </main>
        </div>
    </div>
    <?php if (!empty($showNav)): ?>
        <?php require __DIR__ . '/partials/bottom_nav.php'; ?>
    <?php endif; ?>
</div>
<?php else: ?>
    <?= $content ?>
<?php endif; ?>
<?php if (!empty($phpUser) && is_array($phpUser)): ?>
<script>
window.__WALLETIQ_PHP_USER__ = <?= json_encode($phpUser, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
</script>
<?php endif; ?>
<script src="<?= $b ?>/public/js/walletiq-core.js" defer></script>
<script src="<?= $b ?>/public/js/walletiq-app.js" defer></script>
<script defer>
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (window.WalletIQCore) return;
    var msg = 'WalletIQ could not load (missing core script). Use the app URL that ends with <strong>hhh/</strong> (e.g. <code>/projet_web/hhh/</code>) and check the Network tab for 404s on <code>walletiq-core.js</code>.';
    var targets = document.querySelectorAll('#auth-loading, #pf-guest, #bg-guest, #st-guest, #gl-guest');
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      if (!el) continue;
      el.innerHTML = '<p class="walletiq-fatal" style="margin:0 auto;padding:1rem;max-width:28rem;text-align:center;color:#7f1d1d;font-size:0.95rem;line-height:1.45">' + msg + '</p>';
      el.removeAttribute('hidden');
      el.setAttribute('aria-busy', 'false');
    }
  });
})();
</script>
</body>
</html>
