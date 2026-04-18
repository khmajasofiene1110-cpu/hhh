<?php

declare(strict_types=1);
?>
<div class="goals-page">
    <div id="go-confetti" class="confetti-overlay" aria-hidden="true" hidden></div>
    <div id="gl-guest" class="state state--center" hidden><div class="spinner" role="status"><span class="spinner__ring" aria-hidden="true"></span></div></div>
    <div id="gl-app" hidden>
        <div>
            <h1 class="gl-title">Savings goals</h1>
            <p class="gl-lead">High-priority goals fill first, then medium, then low. Distribution uses this month’s income minus this month’s expenses.</p>
            <div class="gl-summary" id="gl-summary"></div>
        </div>
        <button type="button" class="gl-distribute" id="gl-distribute" disabled>Distribute monthly savings</button>
        <div id="gl-success" class="gl-success" role="status" hidden></div>
        <p id="gl-info" class="gl-info-note" hidden></p>
        <form id="gl-form" class="gl-form-card">
            <h2 class="gl-form-title">New goal</h2>
            <div class="gl-field">
                <label class="gl-field-label" for="goal-name">Name</label>
                <input id="goal-name" class="gl-input" placeholder="e.g. Emergency Fund" required>
            </div>
            <div class="gl-field">
                <label class="gl-field-label" for="goal-target">Target amount (DT)</label>
                <input id="goal-target" class="gl-input" type="number" inputmode="decimal" min="0" step="0.01" required>
            </div>
            <div class="gl-field">
                <label class="gl-field-label" for="goal-priority">Priority</label>
                <select id="goal-priority" class="gl-select">
                    <option value="high">High</option>
                    <option value="medium" selected>Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <button type="submit" class="gl-add-btn">Add goal</button>
        </form>
        <div id="gl-empty" class="gl-empty" hidden>
            <svg class="gl-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <p class="gl-empty-title">You haven&apos;t set any goals yet!</p>
            <p class="gl-empty-hint">Add a goal with a target and priority, then tap &quot;Distribute monthly savings&quot; when you have a positive surplus for the month.</p>
        </div>
        <ul id="gl-list" class="gl-goals-list"></ul>
    </div>
</div>
