<?php

declare(strict_types=1);
?>
<!-- View: budgets | Per-category monthly limits -->
<div class="budgets-page">
    <div id="bg-guest" class="state state--center" hidden><div class="spinner" role="status"><span class="spinner__ring" aria-hidden="true"></span></div></div>
    <div id="bg-app" hidden>
        <div>
            <h1 class="bg-title">Budgets</h1>
            <p class="bg-lead">Monthly limits per category. Bars turn warning red at 80% or more of the limit. Total limits cannot exceed your all-time balance.</p>
        </div>
        <p id="bg-err" class="bg-err" role="alert" hidden></p>
        <div id="bg-list" class="bg-list"></div>
    </div>
</div>
