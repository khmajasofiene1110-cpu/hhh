<?php

declare(strict_types=1);
?>
<div class="dash-page">
    <div id="dash-guest" class="state state--center" hidden>
        <div class="spinner" role="status"><span class="spinner__ring" aria-hidden="true"></span></div>
    </div>
    <div id="dash-app" hidden>
        <header class="dash-header">
            <div class="dash-header-row">
                <div>
                    <p class="dash-greeting">Hello,</p>
                    <h1 class="dash-user-name" id="dash-full-name"></h1>
                </div>
                <a class="dash-profile-link" href="<?= htmlspecialchars(base_url(), ENT_QUOTES, 'UTF-8') ?>/profile" aria-label="Open profile">
                    <svg class="dash-profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </a>
            </div>
        </header>

        <section class="dash-cards" aria-label="Summary">
            <article class="dash-card">
                <div class="dash-card-top">
                    <span class="dash-card-label">Total balance</span>
                    <span class="dash-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    </span>
                </div>
                <p class="dash-card-value" id="dash-balance">0.00 DT</p>
            </article>
            <div class="dash-row">
                <article class="dash-card">
                    <div class="dash-card-top">
                        <span class="dash-card-label">Income</span>
                        <span class="dash-card-icon dash-card-icon--income" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </span>
                    </div>
                    <p class="dash-card-value" id="dash-income">0.00 DT</p>
                    <p class="dash-card-hint">This month</p>
                </article>
                <article class="dash-card">
                    <div class="dash-card-top">
                        <span class="dash-card-label">Expenses</span>
                        <span class="dash-card-icon dash-card-icon--expense" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>
                        </span>
                    </div>
                    <p class="dash-card-value" id="dash-expenses">0.00 DT</p>
                    <p class="dash-card-hint">This month</p>
                </article>
            </div>
        </section>

        <section id="dash-cat-section" class="dash-cat-section" aria-label="This month spending by category" hidden>
            <h2 class="dash-section-title">Spending by category (this month)</h2>
            <ul id="dash-cat-list" class="dash-cat-list"></ul>
        </section>

        <section id="dash-budget-section" class="dash-budget-section" aria-label="Budget overview" hidden>
            <h2 class="dash-budget-title">Spent vs. budget (this month)</h2>
            <div class="dash-budget-row">
                <div class="dash-budget-ring" id="dash-budget-ring">
                    <div class="dash-budget-hole">
                        <span class="dash-budget-pct" id="dash-budget-pct">0%</span>
                        <span class="dash-budget-pct-label">used</span>
                    </div>
                </div>
                <div class="dash-budget-legend">
                    <div class="dash-budget-line">
                        <span class="dash-budget-dot dash-budget-dot--spent" aria-hidden="true"></span>
                        <span>Spent</span>
                        <strong id="dash-spent">0.00 DT</strong>
                    </div>
                    <div class="dash-budget-line">
                        <span class="dash-budget-dot dash-budget-dot--left" aria-hidden="true"></span>
                        <span>Remaining</span>
                        <strong id="dash-remaining">0.00 DT</strong>
                    </div>
                    <p class="dash-budget-cap">of <span id="dash-cap">0.00 DT</span> total monthly limits</p>
                </div>
            </div>
            <div class="dash-budget-bar-track" aria-hidden="true">
                <div class="dash-budget-bar-fill" id="dash-budget-bar-fill"></div>
            </div>
        </section>
        <p id="dash-budget-hint" class="dash-budget-hint" hidden>
            Set category limits on the Budgets tab to see spending vs. budget here.
        </p>

        <button type="button" class="dash-new-tx" id="dash-open-modal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New transaction
        </button>

        <section class="dash-activity" aria-label="Recent activities">
            <h2 class="dash-section-title">Recent activities</h2>
            <div id="dash-empty" class="dash-empty" hidden>
                <svg class="dash-empty-ill" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <p class="dash-empty-title">No transactions yet</p>
                <p class="dash-empty-hint">Tap &quot;New transaction&quot; to log income or spending. Your activity will show up here.</p>
            </div>
            <ul id="dash-activity-list" class="dash-activity-list"></ul>
        </section>
    </div>
</div>
