<?php

declare(strict_types=1);

$calIcon = '<svg class="st-tab__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
?>
<div class="stats-page stats-page--v2">
    <div id="st-guest" class="state state--center" hidden><div class="spinner" role="status"><span class="spinner__ring" aria-hidden="true"></span></div></div>
    <div id="st-app" hidden>
        <header class="st-header">
            <h1 class="st-title">Statistiques</h1>
            <p class="st-lead">Visualise tes habitudes de dépenses</p>
        </header>

        <div class="st-period-bar">
            <span class="st-period-bar__label">PÉRIODE :</span>
            <div class="st-segmented" role="tablist" aria-label="Période d’analyse">
                <button type="button" class="st-seg" data-st-period="daily" role="tab" aria-selected="false">
                    <?= $calIcon ?> Quotidien
                </button>
                <button type="button" class="st-seg st-seg--active" data-st-period="monthly" role="tab" aria-selected="true">
                    <?= $calIcon ?> Mensuel
                </button>
                <button type="button" class="st-seg" data-st-period="yearly" role="tab" aria-selected="false">
                    <?= $calIcon ?> Annuel
                </button>
            </div>
        </div>

        <div class="st-charts-grid">
            <article class="st-chart-card">
                <h2 class="st-chart-card__title" id="st-bar-title">Dépenses mensuelles</h2>
                <div id="st-bar-chart" class="st-bar-chart" aria-describedby="st-bar-title"></div>
            </article>
            <article class="st-chart-card">
                <h2 class="st-chart-card__title">Dépenses par catégorie</h2>
                <div class="st-donut-block">
                    <div id="st-donut-chart" class="st-donut-chart" role="img" aria-label="Répartition par catégorie"></div>
                    <div id="st-donut-legend" class="st-donut-legend"></div>
                </div>
            </article>
        </div>

        <section class="st-tx-section" aria-label="Transactions">
            <h2 class="st-section-title">Transactions</h2>
            <p class="st-swipe-hint">Sur mobile, glisse vers la gauche pour supprimer. Sur ordinateur, utilise l’icône poubelle.</p>
            <p id="st-tx-empty" class="st-empty" hidden>Aucune transaction pour l’instant.</p>
            <ul id="st-tx-list" class="st-tx-list"></ul>
        </section>
    </div>
</div>
