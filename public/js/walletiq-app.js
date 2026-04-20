/**
 * File: public/js/walletiq-app.js
 * Purpose: Page bootstraps, modals, and WalletIQCore wiring (no HTTP API).
 */
(function () {
  'use strict';

  var C = window.WalletIQCore;
  if (!C) return;

  function safeNewUuid() {
    if (typeof C.newUuid === 'function') {
      return C.newUuid();
    }
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 11);
  }

  var TX_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Others'];
  var BILL_SUBCATEGORIES = ['SONEDE', 'STEG', 'Phone Top-up'];
  var PHONE_PROVIDERS = ['Ooredoo', 'Orange', 'Tunisie Telecom'];
  var BILLS = 'Bills';
  var PHONE_TOPUP = 'Phone Top-up';
  var WARNING_RATIO = 0.8;

  function appBase() {
    var el = document.querySelector('meta[name="app-base"]');
    var b = el && el.content ? String(el.content).trim() : '';
    if (!b && document.body) {
      b = (document.body.getAttribute('data-base') || '').trim();
    }
    return b.replace(/\/+$/, '');
  }

  /**
   * Build a URL under the app prefix. When base is empty (mis-detection), use ./relative
   * so links stay under the current folder instead of the site root.
   */
  function pathJoin(base, p) {
    var path = String(p || '').replace(/^\/+/, '');
    if (!path) {
      return base ? base.replace(/\/+$/, '') + '/' : './';
    }
    if (base) {
      return base.replace(/\/+$/, '') + '/' + path;
    }
    return './' + path;
  }

  /** Sync user from PHP session (inline in layout) into localStorage for WalletIQCore. */
  function applyPhpSessionUser() {
    var w = window.__WALLETIQ_PHP_USER__;
    if (!w || !w.username) {
      return false;
    }
    ensureLocalUserFromPhpUser(w);
    C.setSession(w.username);
    try {
      C.updateUserLastActive(w.username);
    } catch (e) {}
    return true;
  }

  /** Called before page boot: hydrates local user from PHP when logged in (no fetch). */
  function ensureUserHydrated(done) {
    applyPhpSessionUser();
    if (typeof done === 'function') {
      done();
    }
  }

  function ensureLocalUserFromPhpUser(payload) {
    try {
      var uname = String(payload.username || '').trim();
      if (!uname) return;
      var idStr = payload.id != null ? String(payload.id) : safeNewUuid();
      var fullName = String(payload.fullName || uname);
      var createdAt = payload.createdAt || new Date().toISOString();
      var users = C.getUsers();
      var i = users.findIndex(function (u) {
        return u.username.toLowerCase() === uname.toLowerCase();
      });
      var row = {
        id: idStr,
        username: uname,
        password: '',
        fullName: fullName,
        email: payload.email ? String(payload.email) : '',
        createdAt: createdAt,
        lastActive: new Date().toISOString(),
        isAdmin: false,
      };
      if (i === -1) {
        C.saveUsers(users.concat([row]));
      } else {
        var next = users.slice();
        next[i] = Object.assign({}, next[i], row);
        C.saveUsers(next);
      }
    } catch (e) {
      /* ignore hydration errors */
    }
  }

  function replace(to) {
    window.location.replace(pathJoin(appBase(), to));
  }

  function syncUserFromSession() {
    var w = window.__WALLETIQ_PHP_USER__;
    if (w && w.username) {
      var byPhp = C.findUserByUsername(w.username);
      if (byPhp) {
        return byPhp;
      }
      ensureLocalUserFromPhpUser(w);
      C.setSession(w.username);
      return C.findUserByUsername(w.username) || null;
    }
    var sessionUser = C.getSessionUsername();
    if (!sessionUser) return null;
    return C.findUserByUsername(sessionUser) || null;
  }

  function formatWhen(iso) {
    var d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  // --- Login page: tab switch + slide between login and sign up ---
  function initLoginAuthTabs() {
    var slider = document.getElementById('auth-slider');
    var tabLogin = document.getElementById('auth-tab-login');
    var tabSignup = document.getElementById('auth-tab-signup');
    var panelLogin = document.getElementById('auth-tabpanel-login');
    var panelSignup = document.getElementById('auth-tabpanel-signup');
    if (!slider || !tabLogin || !tabSignup || !panelLogin || !panelSignup) return;

    function focusables(el) {
      return el.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])'
      );
    }

    function setPaneTabbable(panel, tabbable) {
      var nodes = focusables(panel);
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].tabIndex = tabbable ? 0 : -1;
      }
    }

    function setMode(mode) {
      var signup = mode === 'signup';
      slider.classList.remove('auth-slider--login', 'auth-slider--signup');
      slider.classList.add(signup ? 'auth-slider--signup' : 'auth-slider--login');
      tabLogin.classList.toggle('auth-tab--active', !signup);
      tabSignup.classList.toggle('auth-tab--active', signup);
      tabLogin.setAttribute('aria-selected', signup ? 'false' : 'true');
      tabSignup.setAttribute('aria-selected', signup ? 'true' : 'false');
      tabLogin.tabIndex = signup ? -1 : 0;
      tabSignup.tabIndex = signup ? 0 : -1;
      panelLogin.setAttribute('aria-hidden', signup ? 'true' : 'false');
      panelSignup.setAttribute('aria-hidden', signup ? 'false' : 'true');
      setPaneTabbable(panelLogin, !signup);
      setPaneTabbable(panelSignup, signup);
    }

    tabLogin.addEventListener('click', function () {
      setMode('login');
    });
    tabSignup.addEventListener('click', function () {
      setMode('signup');
    });

    tabLogin.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setMode('signup');
        tabSignup.focus();
      }
    });
    tabSignup.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setMode('login');
        tabLogin.focus();
      }
    });

    var h = (window.location.hash || '').toLowerCase();
    if (h === '#signup') {
      setMode('signup');
    } else {
      setMode('login');
    }
  }

  // --- App guard ---
  function requireUser() {
    var user = syncUserFromSession();
    if (!user) {
      replace('/login');
      return null;
    }
    return user;
  }

  // --- Transaction modal ---
  function openTransactionModal(username, onSaved) {
    var backdrop = document.createElement('div');
    backdrop.className = 'tx-modal-backdrop';
    backdrop.setAttribute('role', 'presentation');
    var type = 'expense';
    var category = TX_CATEGORIES[0];
    var subCategory = BILL_SUBCATEGORIES[0];
    var provider = PHONE_PROVIDERS[0];

    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function close() {
      window.removeEventListener('keydown', onKey);
      if (backdrop.parentNode) document.body.removeChild(backdrop);
    }

    var subOpts = BILL_SUBCATEGORIES.map(function (s) {
      return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
    }).join('');
    var provOpts = PHONE_PROVIDERS.map(function (p) {
      return '<option value="' + esc(p) + '">' + esc(p) + '</option>';
    }).join('');
    var catOpts = TX_CATEGORIES.map(function (c) {
      return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
    }).join('');

    backdrop.innerHTML =
      '<div class="tx-modal" role="dialog" aria-modal="true" aria-labelledby="tx-modal-title">' +
      '<header class="tx-modal-header"><h2 id="tx-modal-title" class="tx-modal-title">New transaction</h2>' +
      '<button type="button" class="tx-modal-close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></header>' +
      '<form class="tx-modal-form">' +
      '<label class="tx-modal-label">Amount<input class="tx-modal-input" name="amount" type="number" inputmode="decimal" min="0" step="0.01" required></label>' +
      '<fieldset class="tx-modal-fieldset"><legend class="tx-modal-legend">Type</legend><div class="tx-modal-type-row">' +
      '<label class="tx-modal-radio"><input type="radio" name="tx-type" value="income"> Income</label>' +
      '<label class="tx-modal-radio"><input type="radio" name="tx-type" value="expense" checked> Expense</label></div></fieldset>' +
      '<label class="tx-modal-label">Category<select class="tx-modal-select" name="category">' +
      catOpts +
      '</select></label>' +
      '<label id="tx-sub-wrap" class="tx-modal-label" hidden>Sub-category<select class="tx-modal-select" name="subcat">' +
      subOpts +
      '</select></label>' +
      '<label id="tx-prov-wrap" class="tx-modal-label" hidden>Provider<select class="tx-modal-select" name="prov">' +
      provOpts +
      '</select></label>' +
      '<p class="tx-modal-error" role="alert" hidden></p>' +
      '<div class="tx-modal-actions"><button type="button" class="tx-modal-cancel">Cancel</button><button type="submit" class="tx-modal-save">Save</button></div>' +
      '</form></div>';

    document.body.appendChild(backdrop);
    window.addEventListener('keydown', onKey);

    var form = backdrop.querySelector('.tx-modal-form');
    var errEl = form.querySelector('.tx-modal-error');
    var subWrap = backdrop.querySelector('#tx-sub-wrap');
    var provWrap = backdrop.querySelector('#tx-prov-wrap');
    var catSel = form.querySelector('[name="category"]');
    var subSel = form.querySelector('[name="subcat"]');
    var provSel = form.querySelector('[name="prov"]');
    catSel.value = category;
    subSel.value = subCategory;
    provSel.value = provider;

    function syncVisibility() {
      var showSub = category === BILLS;
      var showProv = showSub && subCategory === PHONE_TOPUP;
      subWrap.hidden = !showSub;
      provWrap.hidden = !showProv;
    }

    form.querySelectorAll('input[name="tx-type"]').forEach(function (r) {
      r.addEventListener('change', function () {
        type = r.value;
      });
    });

    catSel.addEventListener('change', function () {
      category = catSel.value;
      if (category === BILLS) {
        subCategory = BILL_SUBCATEGORIES[0];
        provider = PHONE_PROVIDERS[0];
        subSel.value = subCategory;
        provSel.value = provider;
      }
      syncVisibility();
    });

    subSel.addEventListener('change', function () {
      subCategory = subSel.value;
      if (subCategory === PHONE_TOPUP) {
        provider = PHONE_PROVIDERS[0];
        provSel.value = provider;
      }
      syncVisibility();
    });

    provSel.addEventListener('change', function () {
      provider = provSel.value;
    });

    syncVisibility();

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errEl.hidden = true;
      var num = parseFloat(String(form.querySelector('input[name="amount"]').value || ''));
      if (!isFinite(num) || num <= 0) {
        errEl.textContent = 'Enter a valid amount greater than zero.';
        errEl.hidden = false;
        return;
      }
      if (category === BILLS) {
        if (!subCategory) {
          errEl.textContent = 'Select a bills sub-category.';
          errEl.hidden = false;
          return;
        }
        if (subCategory === PHONE_TOPUP && !provider) {
          errEl.textContent = 'Select a provider.';
          errEl.hidden = false;
          return;
        }
      }
      var sub = category === BILLS ? subCategory : null;
      var prov = category === BILLS && subCategory === PHONE_TOPUP ? provider : null;
      C.addTransaction({
        username: username,
        amount: num,
        type: type,
        category: category,
        subCategory: sub,
        provider: prov,
        timestamp: new Date().toISOString(),
      });
      close();
      onSaved();
    });

    backdrop.querySelector('.tx-modal-close').addEventListener('click', close);
    form.querySelector('.tx-modal-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });

    form.querySelector('input[name="amount"]').focus();
  }

  // --- Dashboard ---
  function initDashboard() {
    var app = document.getElementById('dash-app');
    var user = syncUserFromSession();
    if (!user) {
      replace('/login');
      return;
    }
    if (app) app.hidden = false;

    function bump() {
      paint();
    }

    var openBtn = document.getElementById('dash-open-modal');
    openBtn.addEventListener('click', function () {
      openTransactionModal(user.username, bump);
    });

    function paint() {
      var cur = syncUserFromSession();
      if (!cur) {
        replace('/login');
        return;
      }
      user = cur;
      document.getElementById('dash-full-name').textContent = user.fullName;
      var txs = C.getTransactionsForUser(user.username);
      var incomeTotal = 0;
      var expenseTotal = 0;
      var monthIn = 0;
      var monthOut = 0;
      var monthStart = startOfMonth(new Date()).getTime();
      for (var i = 0; i < txs.length; i++) {
        var t = txs[i];
        var ts = new Date(t.timestamp).getTime();
        if (t.type === 'income') {
          incomeTotal += t.amount;
          if (ts >= monthStart) monthIn += t.amount;
        } else {
          expenseTotal += t.amount;
          if (ts >= monthStart) monthOut += t.amount;
        }
      }
      var balance = incomeTotal - expenseTotal;
      document.getElementById('dash-balance').textContent = C.formatMoneyDt(balance);
      document.getElementById('dash-income').textContent = C.formatMoneyDt(monthIn);
      document.getElementById('dash-expenses').textContent = C.formatMoneyDt(monthOut);

      var budgetCap = C.getBudgetsForUser(user.username).reduce(function (s, b) {
        return s + b.monthlyLimit;
      }, 0);
      var byCat = C.getExpenseTotalsByCategoryThisMonth(user.username);
      var spentAgainst = Object.keys(byCat).reduce(function (a, k) {
        return a + byCat[k];
      }, 0);
      var budgetSection = document.getElementById('dash-budget-section');
      var budgetHint = document.getElementById('dash-budget-hint');
      if (budgetCap > 0) {
        budgetSection.hidden = false;
        budgetHint.hidden = true;
        var pct = Math.min(100, (spentAgainst / budgetCap) * 100);
        var rem = Math.max(0, budgetCap - spentAgainst);
        document.getElementById('dash-budget-pct').textContent = Math.round(pct) + '%';
        document.getElementById('dash-spent').textContent = C.formatMoneyDt(spentAgainst);
        document.getElementById('dash-remaining').textContent = C.formatMoneyDt(rem);
        document.getElementById('dash-cap').textContent = C.formatMoneyDt(budgetCap);
        var ring = document.getElementById('dash-budget-ring');
        ring.style.background =
          'conic-gradient(var(--color-primary) 0deg ' + pct * 3.6 + 'deg, var(--color-surface) 0deg)';
        document.getElementById('dash-budget-bar-fill').style.width = pct + '%';
      } else {
        budgetSection.hidden = true;
        budgetHint.hidden = false;
      }

      var catSection = document.getElementById('dash-cat-section');
      var catList = document.getElementById('dash-cat-list');
      if (catSection && catList) {
        var catKeys = Object.keys(byCat).filter(function (k) {
          return (byCat[k] || 0) > 0;
        });
        if (catKeys.length === 0) {
          catSection.hidden = true;
        } else {
          catSection.hidden = false;
          catKeys.sort(function (a, b) {
            return byCat[b] - byCat[a];
          });
          var maxCatAmt = byCat[catKeys[0]] || 0;
          catList.innerHTML = '';
          catKeys.forEach(function (cat) {
            var amt = byCat[cat];
            var p = maxCatAmt > 0 ? (amt / maxCatAmt) * 100 : 0;
            var li = document.createElement('li');
            li.className = 'dash-cat-row';
            li.innerHTML =
              '<div class="dash-cat-head"><span>' +
              escHtml(cat) +
              '</span><span class="dash-cat-amt">' +
              C.formatMoneyDt(amt) +
              '</span></div><div class="dash-cat-track"><div class="dash-cat-fill" style="width:' +
              p +
              '%"></div></div>';
            catList.appendChild(li);
          });
        }
      }

      var recent = txs
        .slice()
        .sort(function (a, b) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        })
        .slice(0, 12);
      var list = document.getElementById('dash-activity-list');
      var empty = document.getElementById('dash-empty');
      list.innerHTML = '';
      if (recent.length === 0) {
        empty.hidden = false;
      } else {
        empty.hidden = true;
        recent.forEach(function (tx) {
          var li = document.createElement('li');
          li.className = 'dash-activity-item';
          li.innerHTML =
            '<div class="dash-activity-main"><p class="dash-activity-label">' +
            escHtml(C.getTransactionLabel(tx)) +
            '</p><p class="dash-activity-meta">' +
            (tx.type === 'income' ? 'Income' : 'Expense') +
            ' · ' +
            formatWhen(tx.timestamp) +
            '</p></div><span class="dash-activity-amt ' +
            (tx.type === 'income' ? 'dash-activity-amt--in' : 'dash-activity-amt--out') +
            '">' +
            (tx.type === 'income' ? '+' : '−') +
            C.formatMoneyDt(tx.amount) +
            '</span>';
          list.appendChild(li);
        });
      }
    }

    function escHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    paint();
  }

  // --- Budgets ---
  function initBudgets() {
    var user = requireUser();
    if (!user) return;
    document.getElementById('bg-guest').hidden = true;
    document.getElementById('bg-app').hidden = false;
    var listEl = document.getElementById('bg-list');
    var drafts = {};

    function paint() {
      listEl.innerHTML = '';
      C.BUDGET_CATEGORIES.forEach(function (category) {
        var limit = C.getBudgetLimit(user.username, category);
        var spendByCat = C.getExpenseTotalsByCategoryThisMonth(user.username);
        var spent = spendByCat[category] || 0;
        var hasLimit = limit != null && limit > 0;
        var pct = hasLimit ? Math.min(100, (spent / limit) * 100) : 0;
        var warn = hasLimit && spent >= WARNING_RATIO * limit;
        var draftVal = drafts[category] !== undefined ? drafts[category] : limit != null ? String(limit) : '';
        var row = document.createElement('div');
        row.className = 'bg-row';
        row.innerHTML =
          '<div class="bg-row-head"><span class="bg-cat">' +
          escHtml2(category) +
          '</span><form class="bg-limit-form">' +
          '<input class="bg-limit-input" type="number" inputmode="decimal" min="0" step="1" placeholder="Limit" aria-label="Monthly limit in DT for ' +
          escHtml2(category) +
          '" value="' +
          escAttr(draftVal) +
          '">' +
          '<span class="bg-dt">DT</span><button type="submit" class="bg-save">Save</button></form></div>' +
          '<p class="bg-meta">Spent this month: <strong>' +
          C.formatMoneyDt(spent) +
          '</strong>' +
          (hasLimit
            ? ' / limit <strong>' + C.formatMoneyDt(limit) + '</strong>'
            : ' — set a limit to track') +
          '</p>' +
          '<div class="bg-track"><div class="bg-fill' +
          (warn ? ' bg-fill--warn' : '') +
          '" style="width:' +
          (hasLimit ? pct : 0) +
          '%"></div></div>' +
          (warn ? '<p class="bg-hint">80% or more of budget used</p>' : '');
        var input = row.querySelector('.bg-limit-input');
        input.addEventListener('input', function () {
          drafts[category] = input.value;
        });
        row.querySelector('form').addEventListener('submit', function (e) {
          e.preventDefault();
          var errBox = document.getElementById('bg-err');
          if (errBox) {
            errBox.hidden = true;
            errBox.textContent = '';
          }
          var raw = drafts[category] !== undefined ? drafts[category] : input.value;
          var n = parseFloat(String(raw));
          if (!isFinite(n) || n < 0) return;
          var totals = C.getTotalsForUser(user.username);
          var otherSum = C.getBudgetsForUser(user.username)
            .filter(function (b) {
              return b.category !== category;
            })
            .reduce(function (s, b) {
              return s + b.monthlyLimit;
            }, 0);
          if (totals.netBalance > 0 && otherSum + n > totals.netBalance) {
            if (errBox) {
              errBox.textContent =
                'Total monthly limits cannot exceed your balance (' +
                C.formatMoneyDt(totals.netBalance) +
                '). Reduce this or other categories.';
              errBox.hidden = false;
            }
            return;
          }
          C.upsertBudget(user.username, category, n);
          drafts[category] = undefined;
          paint();
        });
        listEl.appendChild(row);
      });
    }

    function escHtml2(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }
    function escAttr(s) {
      return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    paint();
  }

  // --- Stats ---
  var SWIPE_COMMIT = 72;

  function initStats() {
    var user = requireUser();
    if (!user) return;
    document.getElementById('st-guest').hidden = true;
    document.getElementById('st-app').hidden = false;
    var barTitleEl = document.getElementById('st-bar-title');
    var barRoot = document.getElementById('st-bar-chart');
    var donutEl = document.getElementById('st-donut-chart');
    var legendEl = document.getElementById('st-donut-legend');
    var txList = document.getElementById('st-tx-list');
    var txEmpty = document.getElementById('st-tx-empty');
    var period = 'monthly';
    var DONUT_PALETTE = [
      '#f97316',
      '#3b82f6',
      '#10b981',
      '#a855f7',
      '#eab308',
      '#ec4899',
      '#6366f1',
      '#0ea5e9',
    ];
    var BAR_TITLES = {
      daily: 'Dépenses quotidiennes',
      monthly: 'Dépenses mensuelles',
      yearly: 'Dépenses annuelles',
    };
    function formatWhenFr(iso) {
      var d = new Date(iso);
      return d.toLocaleString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    var periodTabs = document.querySelectorAll('.st-seg[data-st-period]');
    periodTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        period = tab.getAttribute('data-st-period') || 'monthly';
        periodTabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('st-seg--active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        paint();
      });
    });

    function periodKeyFromIso(iso, p) {
      if (typeof iso !== 'string' || iso.length < 4) return '';
      if (p === 'daily') return iso.length >= 10 ? iso.substring(0, 10) : iso;
      if (p === 'monthly') return iso.length >= 7 ? iso.substring(0, 7) : iso.substring(0, 4);
      return iso.substring(0, 4);
    }

    function getCategoryExpenseTotalsInBuckets(username, p, keys) {
      var keySet = {};
      for (var i = 0; i < keys.length; i++) keySet[keys[i]] = true;
      var txs = C.getTransactionsForUser(username);
      var map = {};
      for (var j = 0; j < txs.length; j++) {
        var t = txs[j];
        if (t.type !== 'expense') continue;
        var k = periodKeyFromIso(t.timestamp, p);
        if (!keySet[k]) continue;
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
      return map;
    }

    function niceCeil(n) {
      if (n <= 0) return 100;
      var exp = Math.pow(10, Math.floor(Math.log10(n)));
      var f = n / exp;
      var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
      return nf * exp;
    }

    function formatStPeriodLabel(key, p) {
      if (p === 'yearly') return key;
      if (p === 'monthly') {
        var parts = key.split('-');
        if (parts.length >= 2) {
          var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
          return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        }
        return key;
      }
      var ts = Date.parse(key + 'T12:00:00');
      if (!isNaN(ts)) {
        return new Date(ts).toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return key;
    }

    function buildDonut(categoryTotals) {
      var entries = Object.keys(categoryTotals)
        .map(function (k) {
          return { cat: k, amount: categoryTotals[k] };
        })
        .filter(function (x) {
          return x.amount > 0;
        });
      entries.sort(function (a, b) {
        return b.amount - a.amount;
      });
      var total = entries.reduce(function (s, x) {
        return s + x.amount;
      }, 0);
      if (total <= 0) {
        return { bg: '#e5e7eb', legend: [] };
      }
      var deg = 0;
      var parts = [];
      var legend = [];
      for (var i = 0; i < entries.length; i++) {
        var slice = (entries[i].amount / total) * 360;
        var col = DONUT_PALETTE[i % DONUT_PALETTE.length];
        parts.push(col + ' ' + deg + 'deg ' + (deg + slice) + 'deg');
        deg += slice;
        legend.push({ cat: entries[i].cat, color: col, amount: entries[i].amount });
      }
      return { bg: 'conic-gradient(' + parts.join(', ') + ')', legend: legend };
    }

    function paintBarChart() {
      if (!barRoot || !barTitleEl) return;
      barTitleEl.textContent = BAR_TITLES[period] || BAR_TITLES.monthly;
      var exp = C.getExpenseTotalsByTimeBucket(user.username, period);
      var keys = Object.keys(exp).sort(function (a, b) {
        return a.localeCompare(b);
      });
      var limit = period === 'daily' ? 30 : period === 'monthly' ? 12 : 5;
      keys = keys.slice(-limit);
      var maxAmt = 0;
      keys.forEach(function (k) {
        if (exp[k] > maxAmt) maxAmt = exp[k];
      });
      var maxRounded = niceCeil(maxAmt);
      var steps = 4;
      if (keys.length === 0) {
        barRoot.innerHTML = '<p class="st-empty">Aucune dépense pour cette période.</p>';
        return;
      }
      barRoot.innerHTML =
        '<div class="st-bar-viz">' +
        '<div class="st-bar-viz__y" id="st-bar-y-axis"></div>' +
        '<div class="st-bar-viz__scroll"><div class="st-bar-viz__cols-inner" id="st-bar-cols"></div></div>' +
        '</div>';
      var yEl = barRoot.querySelector('#st-bar-y-axis');
      var cols = barRoot.querySelector('#st-bar-cols');
      for (var s = steps; s >= 0; s--) {
        var lbl = document.createElement('span');
        lbl.textContent = C.formatMoneyDt((maxRounded * s) / steps);
        yEl.appendChild(lbl);
      }
      keys.forEach(function (k) {
        var amount = exp[k] || 0;
        var h = maxRounded > 0 ? (amount / maxRounded) * 100 : 0;
        var wrap = document.createElement('div');
        wrap.className = 'st-bar-viz__bar-wrap';
        wrap.innerHTML =
          '<div class="st-bar-viz__bar-stack"><div class="st-bar-viz__bar" style="height:' +
          h +
          '%"></div></div><span class="st-bar-viz__label">' +
          escHtml3(formatStPeriodLabel(k, period)) +
          '</span>';
        cols.appendChild(wrap);
      });
    }

    function paintDonut() {
      if (!donutEl || !legendEl) return;
      var exp = C.getExpenseTotalsByTimeBucket(user.username, period);
      var keys = Object.keys(exp).sort(function (a, b) {
        return a.localeCompare(b);
      });
      var limit = period === 'daily' ? 30 : period === 'monthly' ? 12 : 5;
      keys = keys.slice(-limit);
      var catTotals = getCategoryExpenseTotalsInBuckets(user.username, period, keys);
      var donut = buildDonut(catTotals);
      donutEl.style.background = donut.bg;
      legendEl.innerHTML = '';
      if (donut.legend.length === 0) {
        legendEl.innerHTML = '<p class="st-empty">Aucune dépense par catégorie sur cette période.</p>';
        return;
      }
      donut.legend.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'st-donut-legend__row';
        row.innerHTML =
          '<span class="st-donut-dot" style="background:' +
          item.color +
          '"></span><span class="st-donut-legend__name">' +
          escHtml3(item.cat) +
          '</span><span class="st-donut-legend__amt">' +
          C.formatMoneyDt(item.amount) +
          '</span>';
        legendEl.appendChild(row);
      });
    }

    function bump() {
      paint();
    }

    function paint() {
      paintBarChart();
      paintDonut();
      var txs = C.getTransactionsForUser(user.username).sort(function (a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      txList.innerHTML = '';
      if (txs.length === 0) {
        txEmpty.hidden = false;
      } else {
        txEmpty.hidden = true;
        txs.forEach(function (tx) {
          txList.appendChild(renderSwipeRow(tx, user.username, bump));
        });
      }
    }

    function escHtml3(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function renderSwipeRow(tx, username, onRemoved) {
      var wrap = document.createElement('div');
      wrap.className = 'swipe-wrap';
      wrap.innerHTML =
        '<div class="swipe-actions"><button type="button" class="swipe-del" aria-label="Supprimer la transaction ' +
        escAttr(C.getTransactionLabel(tx)) +
        '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>' +
        '<div class="swipe-row">' +
        '<div class="swipe-main"><p class="swipe-label">' +
        escHtml3(C.getTransactionLabel(tx)) +
        '</p><p class="swipe-meta">' +
        (tx.type === 'income' ? 'Revenu' : 'Dépense') +
        ' · ' +
        formatWhenFr(tx.timestamp) +
        '</p></div>' +
        '<span class="swipe-amt ' +
        (tx.type === 'income' ? 'swipe-amt--in' : 'swipe-amt--out') +
        '">' +
        (tx.type === 'income' ? '+' : '−') +
        C.formatMoneyDt(tx.amount) +
        '</span>' +
        '<button type="button" class="swipe-desktop-del" aria-label="Supprimer la transaction ' +
        escAttr(C.getTransactionLabel(tx)) +
        '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div>';
      var row = wrap.querySelector('.swipe-row');
      var offset = 0;
      function setOff(x) {
        offset = x;
        row.style.transform = 'translateX(' + x + 'px)';
      }
      function del() {
        if (C.removeTransactionById(tx.id, username)) onRemoved();
        setOff(0);
      }
      wrap.querySelector('.swipe-del').addEventListener('click', del);
      wrap.querySelector('.swipe-desktop-del').addEventListener('click', del);
      var dragging = false;
      var startX = 0;
      var curX = 0;
      row.addEventListener('touchstart', function (e) {
        dragging = true;
        startX = e.touches[0].clientX;
        curX = startX;
      });
      row.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        curX = e.touches[0].clientX;
        var delta = curX - startX;
        var next = Math.min(0, Math.max(-120, delta));
        setOff(next);
      });
      row.addEventListener('touchend', end);
      row.addEventListener('touchcancel', end);
      function end() {
        if (!dragging) return;
        dragging = false;
        if (offset < -SWIPE_COMMIT) setOff(-88);
        else setOff(0);
      }
      return wrap;
    }

    function escAttr(s) {
      return String(s).replace(/"/g, '&quot;');
    }

    paint();
  }

  // --- Goals ---
  function initGoals() {
    var user = requireUser();
    if (!user) return;
    document.getElementById('gl-guest').hidden = true;
    document.getElementById('gl-app').hidden = false;
    var confettiEl = document.getElementById('go-confetti');

    function priorityRank(p) {
      return p === 'high' ? 0 : p === 'medium' ? 1 : 2;
    }
    function sortGoals(list) {
      return list.slice().sort(function (a, b) {
        var d = priorityRank(a.priority) - priorityRank(b.priority);
        if (d !== 0) return d;
        return a.name.localeCompare(b.name);
      });
    }

    function paint() {
      var username = user.username;
      var goals = sortGoals(C.getGoalsForUser(username));
      var m = C.getMonthlyIncomeAndExpenses(username);
      var mk = C.currentMonthKey();
      var led = C.getWaterfallLedger(username);
      var dist = led.monthKey === mk ? led.distributed : 0;
      var surplus = m.income - m.expenses;
      var poolPreview = Math.max(0, surplus - dist);
      var t = C.getTotalsForUser(username);
      var committed = C.getGoalsForUser(username).reduce(function (s, g) {
        return s + g.currentAmount;
      }, 0);
      document.getElementById('gl-summary').innerHTML =
        '<span>This month income: <strong>' +
        C.formatMoneyDt(m.income) +
        '</strong></span>' +
        '<span>This month expenses: <strong>' +
        C.formatMoneyDt(m.expenses) +
        '</strong></span>' +
        '<span>Monthly surplus: <strong>' +
        C.formatMoneyDt(surplus) +
        '</strong></span>' +
        '<span>Already distributed: <strong>' +
        C.formatMoneyDt(dist) +
        '</strong></span>' +
        '<span>Pool to assign: <strong>' +
        C.formatMoneyDt(poolPreview) +
        '</strong></span>' +
        '<span>All-time balance: <strong>' +
        C.formatMoneyDt(t.netBalance) +
        '</strong> · In goals: <strong>' +
        C.formatMoneyDt(committed) +
        '</strong></span>';

      var btn = document.getElementById('gl-distribute');
      btn.disabled = goals.length === 0 || poolPreview <= 0;

      var list = document.getElementById('gl-list');
      var empty = document.getElementById('gl-empty');
      list.innerHTML = '';
      if (goals.length === 0) {
        empty.hidden = false;
      } else {
        empty.hidden = true;
        goals.forEach(function (g) {
          var pct = Math.min(100, g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0);
          var pLabel = g.priority === 'high' ? 'High' : g.priority === 'medium' ? 'Medium' : 'Low';
          var badgeClass = 'gl-badge';
          if (g.priority === 'medium') badgeClass += ' gl-badge--med';
          if (g.priority === 'low') badgeClass += ' gl-badge--low';
          var li = document.createElement('li');
          li.className = 'gl-goal-card';
          li.innerHTML =
            '<div class="gl-goal-head"><span class="gl-goal-name">' +
            escHtml4(g.name) +
            '</span><span class="' +
            badgeClass +
            '">' +
            pLabel +
            '</span></div>' +
            '<p class="gl-amounts"><strong>' +
            C.formatMoneyDt(g.currentAmount) +
            '</strong> of <strong>' +
            C.formatMoneyDt(g.targetAmount) +
            '</strong></p>' +
            '<div class="gl-track"><div class="gl-fill" style="width:' +
            pct +
            '%"></div></div>';
          list.appendChild(li);
        });
      }
    }

    function escHtml4(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    document.getElementById('gl-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('goal-name').value.trim();
      var target = parseFloat(document.getElementById('goal-target').value);
      var priority = document.getElementById('goal-priority').value;
      if (!name || !isFinite(target) || target <= 0) return;
      var g = {
        id: safeNewUuid(),
        username: user.username,
        name: name,
        targetAmount: target,
        currentAmount: 0,
        priority: priority,
      };
      C.saveGoalsForUser(user.username, C.getGoalsForUser(user.username).concat([g]));
      document.getElementById('goal-name').value = '';
      document.getElementById('goal-target').value = '';
      document.getElementById('goal-priority').value = 'medium';
      paint();
    });

    document.getElementById('gl-distribute').addEventListener('click', function () {
      document.getElementById('gl-info').hidden = true;
      document.getElementById('gl-success').hidden = true;
      var r = C.distributeMonthlySavings(user.username);
      paint();
      var m = C.getMonthlyIncomeAndExpenses(user.username);
      var mk = C.currentMonthKey();
      var led = C.getWaterfallLedger(user.username);
      var dist = led.monthKey === mk ? led.distributed : 0;
      var surplus = m.income - m.expenses;
      var poolPreview = Math.max(0, surplus - dist);
      var successEl = document.getElementById('gl-success');
      var infoEl = document.getElementById('gl-info');
      if (r.poolApplied > 0) {
        successEl.innerHTML =
          '<p class="gl-success-title">Savings distributed</p><ul class="gl-success-list">' +
          r.allocations
            .map(function (a) {
              return (
                '<li><strong>' +
                escHtml4(a.goalName) +
                '</strong><span>+' +
                C.formatMoneyDt(a.amount) +
                '</span></li>'
              );
            })
            .join('') +
          '</ul><button type="button" class="gl-dismiss" id="gl-dismiss">Dismiss</button>';
        successEl.hidden = false;
        document.getElementById('gl-dismiss').addEventListener('click', function () {
          successEl.hidden = true;
        });
        burstConfetti();
      } else if (poolPreview <= 0) {
        infoEl.textContent =
          surplus <= 0
            ? 'No monthly surplus yet. Add more income than expenses this month to distribute savings.'
            : 'This month’s surplus has already been moved into your goals. Add new income to unlock more.';
        infoEl.hidden = false;
      } else {
        infoEl.textContent = 'All goals are already full for the amount available.';
        infoEl.hidden = false;
      }
    });

    function burstConfetti() {
      var colors = ['#7c3aed', '#a78bfa', '#22c55e', '#facc15', '#f472b6', '#38bdf8'];
      confettiEl.innerHTML = '';
      confettiEl.hidden = false;
      for (var i = 0; i < 18; i++) {
        var span = document.createElement('span');
        span.className = 'confetti-piece';
        span.style.left = 8 + (i % 6) * 14 + '%';
        span.style.background = colors[i % colors.length];
        span.style.animationDelay = i * 35 + 'ms';
        span.style.setProperty('--spin', i * 47 + 'deg');
        confettiEl.appendChild(span);
      }
      setTimeout(function () {
        confettiEl.hidden = true;
        confettiEl.innerHTML = '';
      }, 1600);
    }

    paint();
  }

  // --- Profile ---
  function initProfile() {
    var pfGuest = document.getElementById('pf-guest');
    var pfApp = document.getElementById('pf-app');
    function showProfileBootError(msg) {
      if (pfApp) pfApp.hidden = true;
      var g = document.getElementById('pf-guest');
      if (g) {
        g.innerHTML = '';
        var p = document.createElement('p');
        p.className = 'walletiq-fatal';
        p.style.cssText =
          'margin:0 auto;padding:1rem;max-width:28rem;text-align:center;color:#7f1d1d;font-size:0.95rem;line-height:1.45';
        p.textContent = msg;
        g.appendChild(p);
        g.hidden = false;
        g.removeAttribute('hidden');
        g.setAttribute('aria-busy', 'false');
        return;
      }
      var wrap = document.querySelector('.profile-page');
      if (!wrap) return;
      var banner = document.createElement('div');
      banner.className = 'walletiq-fatal';
      banner.setAttribute('role', 'alert');
      banner.style.cssText =
        'margin:0 0 0.75rem;padding:1rem;border-radius:var(--radius);text-align:center;color:#7f1d1d;font-size:0.95rem;line-height:1.45;background:rgba(254,226,226,0.95);border:1px solid rgba(220,38,38,0.25)';
      banner.textContent = msg;
      wrap.insertBefore(banner, wrap.firstChild);
    }
    function openProfileForUser(user) {
      if (!user) {
        replace('/login');
        return;
      }
      try {
        if (pfGuest) {
          pfGuest.hidden = true;
          pfGuest.removeAttribute('aria-busy');
          if (pfGuest.parentNode) {
            pfGuest.remove();
          }
        }
        if (pfApp) {
          pfApp.hidden = false;
        }
      var nameI = document.getElementById('pf-name');
      var userI = document.getElementById('pf-user');
      var form = document.getElementById('pf-form');
      if (!form) {
        showProfileBootError('Profile form is missing from the page. Reload or contact support.');
        return;
      }
      if (nameI) nameI.value = user.fullName || user.username || '';
      if (userI) userI.value = user.username || '';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var errEl = document.getElementById('pf-err');
        var msgEl = document.getElementById('pf-msg');
        if (errEl) errEl.hidden = true;
        if (msgEl) msgEl.hidden = true;
        var r = C.updateUserProfile(user.username, {
          fullName: nameI ? nameI.value : '',
          username: userI ? userI.value : '',
        });
        if (!r.ok) {
          if (errEl) {
            errEl.textContent = r.error;
            errEl.hidden = false;
          }
          return;
        }
        user = r.user;
        if (msgEl) {
          msgEl.textContent = 'Profile updated.';
          msgEl.hidden = false;
        }
      });

      var backdrop = document.getElementById('pf-modal-backdrop');
      var modal = document.getElementById('pf-modal');
      var resetOpen = document.getElementById('pf-reset-open');
      var modalCancel = document.getElementById('pf-modal-cancel');
      var modalConfirm = document.getElementById('pf-modal-confirm');
      if (resetOpen && backdrop && modal) {
        resetOpen.addEventListener('click', function () {
          backdrop.hidden = false;
        });
      }
      if (modalCancel && backdrop && modal) {
        modalCancel.addEventListener('click', function () {
          backdrop.hidden = true;
        });
      }
      if (backdrop && modal) {
        backdrop.addEventListener('click', function (e) {
          if (e.target === backdrop) {
            backdrop.hidden = true;
          }
        });
      }
      if (modalConfirm && backdrop && modal) {
        modalConfirm.addEventListener('click', function () {
          C.clearUserTransactions(user.username);
          backdrop.hidden = true;
          var msgEl = document.getElementById('pf-msg');
          if (msgEl) {
            msgEl.textContent =
              'All your transactions have been cleared. Goals and budgets were kept.';
            msgEl.hidden = false;
          }
        });
      }
    } catch (err) {
      showProfileBootError(
        'Profile could not load. Refresh the page or open the console (F12).'
      );
    }
  }

    applyPhpSessionUser();
    openProfileForUser(syncUserFromSession());
  }

  // --- Admin dashboard (users rendered server-side; delete via POST form) ---
  function initAdminDashboard() {
    var tbody = document.getElementById('adm-tbody');
    var search = document.getElementById('adm-search');
    var form = document.getElementById('adm-delete-form');
    var uidInput = document.getElementById('adm-delete-user-id');
    if (!tbody || !search) return;

    function escHtml5(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var rows = tbody.querySelectorAll('tr.admin-tr');
      rows.forEach(function (tr) {
        var hay = (tr.getAttribute('data-search') || '').toLowerCase();
        tr.hidden = q !== '' && hay.indexOf(q) === -1;
      });
    });

    var pendingDelId = null;

    document.querySelectorAll('.adm-del-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pendingDelId = btn.getAttribute('data-user-id');
        var nm = btn.getAttribute('data-user-name') || '';
        var body = document.getElementById('adm-modal-body');
        if (body) {
          body.innerHTML =
            '<p>This will permanently remove <strong>' +
            escHtml5(nm) +
            '</strong> (ID <strong>' +
            escHtml5(String(pendingDelId)) +
            '</strong>) and all related data. This cannot be undone.</p>';
        }
        var bdOpen = document.getElementById('adm-modal-backdrop');
        if (bdOpen) bdOpen.hidden = false;
      });
    });

    function closeModal() {
      var bd = document.getElementById('adm-modal-backdrop');
      if (bd) bd.hidden = true;
      pendingDelId = null;
    }

    var cancel = document.getElementById('adm-modal-cancel');
    var backdrop = document.getElementById('adm-modal-backdrop');
    if (cancel) cancel.addEventListener('click', closeModal);
    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target.id === 'adm-modal-backdrop') closeModal();
      });
    }

    var confirm = document.getElementById('adm-modal-confirm');
    if (confirm) {
      confirm.addEventListener('click', function () {
        if (!pendingDelId || !form || !uidInput) {
          closeModal();
          return;
        }
        uidInput.value = pendingDelId;
        var bdHide = document.getElementById('adm-modal-backdrop');
        if (bdHide) bdHide.hidden = true;
        form.submit();
      });
    }
  }

  function boot() {
    var page = document.body.getAttribute('data-page') || '';
    ensureUserHydrated(function () {
      try {
        if (page === 'login') {
          initLoginAuthTabs();
        } else if (page === 'register') {
          /* form POST server-side */
        } else if (page === 'dashboard') initDashboard();
        else if (page === 'stats') initStats();
        else if (page === 'budgets') initBudgets();
        else if (page === 'goals') initGoals();
        else if (page === 'profile') initProfile();
        else if (page === 'admin_dashboard') initAdminDashboard();
      } catch (e) {
        if (page === 'profile') {
          var pg = document.getElementById('pf-guest');
          var pa = document.getElementById('pf-app');
          if (pa) pa.hidden = true;
          if (pg) {
            pg.innerHTML = '';
            var pe = document.createElement('p');
            pe.className = 'walletiq-fatal';
            pe.style.cssText =
              'margin:0 auto;padding:1rem;max-width:28rem;text-align:center;color:#7f1d1d;font-size:0.95rem;line-height:1.45';
            pe.textContent =
              'Profile failed to start. Open the browser console (F12). Ensure walletiq-core.js loads and MySQL is available for login.';
            pg.appendChild(pe);
            pg.hidden = false;
            pg.setAttribute('aria-busy', 'false');
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
