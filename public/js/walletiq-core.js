/**
 * File: public/js/walletiq-core.js
 * Purpose: Client-side domain logic and localStorage persistence for WalletIQ
 */
(function () {
  'use strict';

  function newUuid() {
    try {
      if (window.crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch (e) {}
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 11);
  }

  var STORAGE_USERS = 'walletiq_users';
  var STORAGE_SESSION = 'walletiq_session';
  var STORAGE_TRANSACTIONS = 'walletiq_transactions';
  var STORAGE_BUDGETS = 'walletiq_budgets';
  var STORAGE_GOALS = 'walletiq_goals';
  var STORAGE_WATERFALL_LEDGER = 'walletiq_waterfall_ledger';
  var ADMIN_SESSION_KEY = 'walletiq_admin_session';

  var DEFAULT_ADMIN_USERNAME = 'admin';
  var DEFAULT_ADMIN_PASSWORD = 'admin123';

  function readStorageJson(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeStorageJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function removeStorageKey(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function buildDefaultAdmin() {
    return {
      id: newUuid(),
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      fullName: 'Administrator',
      createdAt: nowIso(),
      lastActive: nowIso(),
      isAdmin: true,
    };
  }

  function getUsers() {
    var raw = readStorageJson(STORAGE_USERS, []);
    var hasAdmin = raw.some(function (u) {
      return u.username.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase();
    });
    if (hasAdmin) return raw;
    var seeded = raw.concat([buildDefaultAdmin()]);
    saveUsers(seeded);
    return seeded;
  }

  function saveUsers(users) {
    writeStorageJson(STORAGE_USERS, users);
  }

  function getSessionUsername() {
    return readStorageJson(STORAGE_SESSION, null);
  }

  function setSession(username) {
    writeStorageJson(STORAGE_SESSION, username);
  }

  function clearSession() {
    removeStorageKey(STORAGE_SESSION);
  }

  function findUserByUsername(username) {
    return getUsers().find(function (u) {
      return u.username.toLowerCase() === username.trim().toLowerCase();
    });
  }

  function updateUserLastActive(username) {
    var users = getUsers();
    var i = users.findIndex(function (u) {
      return u.username.toLowerCase() === username.toLowerCase();
    });
    if (i === -1) return;
    var next = users.slice();
    next[i] = Object.assign({}, next[i], { lastActive: nowIso() });
    saveUsers(next);
  }

  function updateUserProfile(currentUsername, next) {
    var name = next.fullName.trim();
    var uname = next.username.trim();
    if (!name) return { ok: false, error: 'Full name is required.' };
    if (!uname) return { ok: false, error: 'Username is required.' };
    var users = getUsers();
    var i = users.findIndex(function (u) {
      return u.username.toLowerCase() === currentUsername.trim().toLowerCase();
    });
    if (i === -1) return { ok: false, error: 'User not found.' };
    if (
      users.some(function (u, j) {
        return j !== i && u.username.toLowerCase() === uname.toLowerCase();
      })
    ) {
      return { ok: false, error: 'Username is already taken.' };
    }
    var updated = Object.assign({}, users[i], { fullName: name, username: uname });
    var nextUsers = users.slice();
    nextUsers[i] = updated;
    saveUsers(nextUsers);
    var session = getSessionUsername();
    if (session && session.toLowerCase() === currentUsername.trim().toLowerCase()) {
      setSession(uname);
    }
    return { ok: true, user: updated };
  }

  function purgeUserData(username) {
    removeTransactionsForUser(username);
    removeGoalsForUser(username);
    removeBudgetsForUser(username);
    removeWaterfallLedgerForUser(username);
  }

  function deleteUser(username) {
    var u = username.trim().toLowerCase();
    var users = getUsers();
    var idx = users.findIndex(function (x) {
      return x.username.toLowerCase() === u;
    });
    if (idx === -1) return false;
    purgeUserData(users[idx].username);
    var nextUsers = users.filter(function (x) {
      return x.username.toLowerCase() !== u;
    });
    saveUsers(nextUsers);
    var session = getSessionUsername();
    if (session && session.toLowerCase() === u) clearSession();
    return true;
  }

  function getAllTransactions() {
    return readStorageJson(STORAGE_TRANSACTIONS, []);
  }

  function getTransactionsForUser(username) {
    var u = username.trim().toLowerCase();
    return getAllTransactions().filter(function (t) {
      return t.username.toLowerCase() === u;
    });
  }

  function addTransaction(tx) {
    var full = Object.assign({}, tx, { id: newUuid() });
    var all = getAllTransactions();
    writeStorageJson(STORAGE_TRANSACTIONS, all.concat([full]));
    return full;
  }

  function removeTransactionsForUser(username) {
    var u = username.trim().toLowerCase();
    writeStorageJson(
      STORAGE_TRANSACTIONS,
      getAllTransactions().filter(function (t) {
        return t.username.toLowerCase() !== u;
      })
    );
  }

  function clearUserTransactions(username) {
    removeTransactionsForUser(username);
    removeWaterfallLedgerForUser(username);
  }

  function removeTransactionById(id, username) {
    var u = username.trim().toLowerCase();
    var all = getAllTransactions();
    var exists = all.some(function (t) {
      return t.id === id && t.username.toLowerCase() === u;
    });
    if (!exists) return false;
    writeStorageJson(
      STORAGE_TRANSACTIONS,
      all.filter(function (t) {
        return t.id !== id;
      })
    );
    return true;
  }

  function getAllBudgets() {
    return readStorageJson(STORAGE_BUDGETS, []);
  }

  function getBudgetsForUser(username) {
    var u = username.trim().toLowerCase();
    return getAllBudgets().filter(function (b) {
      return b.username.toLowerCase() === u;
    });
  }

  function getBudgetLimit(username, category) {
    var b = getBudgetsForUser(username).find(function (x) {
      return x.category === category;
    });
    return b ? b.monthlyLimit : null;
  }

  function upsertBudget(username, category, monthlyLimit) {
    var uname = username.trim();
    var u = uname.toLowerCase();
    var all = getAllBudgets();
    var existing = all.find(function (x) {
      return x.username.toLowerCase() === u && x.category === category;
    });
    var next = existing
      ? Object.assign({}, existing, { monthlyLimit: monthlyLimit })
      : {
          id: newUuid(),
          username: uname,
          category: category,
          monthlyLimit: monthlyLimit,
        };
    var others = all.filter(function (x) {
      return !(x.username.toLowerCase() === u && x.category === category);
    });
    writeStorageJson(STORAGE_BUDGETS, others.concat([next]));
    return next;
  }

  function removeBudgetsForUser(username) {
    var u = username.trim().toLowerCase();
    writeStorageJson(
      STORAGE_BUDGETS,
      getAllBudgets().filter(function (b) {
        return b.username.toLowerCase() !== u;
      })
    );
  }

  function getAllGoals() {
    return readStorageJson(STORAGE_GOALS, []);
  }

  function getGoalsForUser(username) {
    var u = username.trim().toLowerCase();
    return getAllGoals().filter(function (g) {
      return g.username.toLowerCase() === u;
    });
  }

  function saveGoalsForUser(username, goals) {
    var u = username.trim().toLowerCase();
    var rest = getAllGoals().filter(function (g) {
      return g.username.toLowerCase() !== u;
    });
    writeStorageJson(STORAGE_GOALS, rest.concat(goals));
  }

  function removeGoalsForUser(username) {
    var u = username.trim().toLowerCase();
    writeStorageJson(
      STORAGE_GOALS,
      getAllGoals().filter(function (g) {
        return g.username.toLowerCase() !== u;
      })
    );
  }

  function currentMonthKey(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    return d.getFullYear() + '-' + m;
  }

  function allLedgerRows() {
    return readStorageJson(STORAGE_WATERFALL_LEDGER, []);
  }

  function getWaterfallLedger(username) {
    var u = username.trim().toLowerCase();
    var mk = currentMonthKey();
    var row = allLedgerRows().find(function (r) {
      return r.username.toLowerCase() === u;
    });
    if (!row || row.monthKey !== mk) return { monthKey: mk, distributed: 0 };
    return { monthKey: row.monthKey, distributed: row.distributed };
  }

  function setWaterfallLedger(username, monthKey, distributed) {
    var uname = username.trim();
    var u = uname.toLowerCase();
    var rest = allLedgerRows().filter(function (r) {
      return r.username.toLowerCase() !== u;
    });
    writeStorageJson(STORAGE_WATERFALL_LEDGER, rest.concat([{ username: uname, monthKey: monthKey, distributed: distributed }]));
  }

  function removeWaterfallLedgerForUser(username) {
    var u = username.trim().toLowerCase();
    writeStorageJson(
      STORAGE_WATERFALL_LEDGER,
      allLedgerRows().filter(function (r) {
        return r.username.toLowerCase() !== u;
      })
    );
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function getMonthlyIncomeAndExpenses(username) {
    var txs = getTransactionsForUser(username);
    var start = startOfMonth(new Date()).getTime();
    var income = 0;
    var expenses = 0;
    for (var i = 0; i < txs.length; i++) {
      var t = txs[i];
      if (new Date(t.timestamp).getTime() < start) continue;
      if (t.type === 'income') income += t.amount;
      else expenses += t.amount;
    }
    return { income: income, expenses: expenses };
  }

  function getTotalsForUser(username) {
    var txs = getTransactionsForUser(username);
    var totalIncome = 0;
    var totalExpenses = 0;
    for (var i = 0; i < txs.length; i++) {
      var t = txs[i];
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpenses += t.amount;
    }
    return {
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }

  function getExpenseTotalsByCategoryThisMonth(username) {
    var txs = getTransactionsForUser(username);
    var start = startOfMonth(new Date()).getTime();
    var map = {};
    for (var i = 0; i < txs.length; i++) {
      var t = txs[i];
      if (t.type !== 'expense') continue;
      if (new Date(t.timestamp).getTime() < start) continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return map;
  }

  function topSpendingCategory(totals) {
    var entries = Object.keys(totals).map(function (k) {
      return [k, totals[k]];
    });
    if (entries.length === 0) return null;
    entries.sort(function (a, b) {
      return b[1] - a[1];
    });
    return { category: entries[0][0], amount: entries[0][1] };
  }

  /**
   * Aggregate income and expense by time bucket (ISO timestamp on transactions).
   * @param {'daily'|'monthly'|'yearly'} period
   * @return {{ incomeByKey: Record<string, number>, expenseByKey: Record<string, number> }}
   */
  function getIncomeExpenseByTimeBucket(username, period) {
    var txs = getTransactionsForUser(username);
    var incomeByKey = {};
    var expenseByKey = {};
    for (var i = 0; i < txs.length; i++) {
      var t = txs[i];
      var iso = t.timestamp;
      if (typeof iso !== 'string' || iso.length < 4) continue;
      var key;
      if (period === 'daily') {
        key = iso.length >= 10 ? iso.substring(0, 10) : iso;
      } else if (period === 'monthly') {
        key = iso.length >= 7 ? iso.substring(0, 7) : iso.substring(0, 4);
      } else {
        key = iso.substring(0, 4);
      }
      if (t.type === 'income') {
        incomeByKey[key] = (incomeByKey[key] || 0) + t.amount;
      } else if (t.type === 'expense') {
        expenseByKey[key] = (expenseByKey[key] || 0) + t.amount;
      }
    }
    return { incomeByKey: incomeByKey, expenseByKey: expenseByKey };
  }

  /**
   * Expense-only buckets (convenience).
   */
  function getExpenseTotalsByTimeBucket(username, period) {
    return getIncomeExpenseByTimeBucket(username, period).expenseByKey;
  }

  var priorityRank = { high: 0, medium: 1, low: 2 };

  function allocateSurplusWaterfall(remains, goals) {
    if (remains <= 0 || goals.length === 0) return [];
    var ordered = goals.slice().sort(function (a, b) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
    var pool = remains;
    var allocations = [];
    for (var i = 0; i < ordered.length; i++) {
      var g = ordered[i];
      if (pool <= 0) break;
      var room = Math.max(0, g.targetAmount - g.currentAmount);
      var add = Math.min(pool, room);
      if (add > 0) {
        allocations.push({ goalId: g.id, amount: add });
        pool -= add;
      }
    }
    return allocations;
  }

  function distributeMonthlySavings(username) {
    var m = getMonthlyIncomeAndExpenses(username);
    var monthlyIncome = m.income;
    var monthlyExpenses = m.expenses;
    var monthlySurplus = monthlyIncome - monthlyExpenses;
    var mk = currentMonthKey();
    var ledger = getWaterfallLedger(username);
    var alreadyDistributedThisMonth = ledger.monthKey === mk ? ledger.distributed : 0;
    var poolAvailable = Math.max(0, monthlySurplus - alreadyDistributedThisMonth);
    var goals = getGoalsForUser(username);
    var rawAllocations = allocateSurplusWaterfall(
      poolAvailable,
      goals.map(function (g) {
        return {
          id: g.id,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          priority: g.priority,
        };
      })
    );
    var addById = {};
    for (var i = 0; i < rawAllocations.length; i++) {
      addById[rawAllocations[i].goalId] = rawAllocations[i].amount;
    }
    var nextGoals = goals.map(function (g) {
      return Object.assign({}, g, {
        currentAmount: g.currentAmount + (addById[g.id] || 0),
      });
    });
    var poolApplied = rawAllocations.reduce(function (s, a) {
      return s + a.amount;
    }, 0);
    saveGoalsForUser(username, nextGoals);
    setWaterfallLedger(username, mk, alreadyDistributedThisMonth + poolApplied);
    var nameById = {};
    for (var j = 0; j < goals.length; j++) {
      nameById[goals[j].id] = goals[j].name;
    }
    var allocations = rawAllocations.map(function (a) {
      return {
        goalId: a.goalId,
        goalName: nameById[a.goalId] || 'Goal',
        amount: a.amount,
      };
    });
    return {
      allocations: allocations,
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      monthlySurplus: monthlySurplus,
      alreadyDistributedThisMonth: alreadyDistributedThisMonth,
      poolAvailable: poolAvailable,
      poolApplied: poolApplied,
      nextGoals: nextGoals,
    };
  }

  function formatMoneyDt(value) {
    return (
      value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' DT'
    );
  }

  function getTransactionLabel(tx) {
    var parts = [tx.category];
    if (tx.subCategory) parts.push(tx.subCategory);
    if (tx.provider) parts.push(tx.provider);
    return parts.join(' · ');
  }

  var BUDGET_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Others'];

  function isAdminSessionActive() {
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === '1';
  }

  function setAdminSessionActive() {
    window.localStorage.setItem(ADMIN_SESSION_KEY, '1');
  }

  function clearAdminSession() {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  var MASTER_ADMIN_USERNAME = 'admin';

  function isMasterAdminUsername(username) {
    return username.trim().toLowerCase() === MASTER_ADMIN_USERNAME.toLowerCase();
  }

  window.WalletIQCore = {
    newUuid: newUuid,
    STORAGE_USERS: STORAGE_USERS,
    STORAGE_SESSION: STORAGE_SESSION,
    readStorageJson: readStorageJson,
    writeStorageJson: writeStorageJson,
    removeStorageKey: removeStorageKey,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getSessionUsername: getSessionUsername,
    setSession: setSession,
    clearSession: clearSession,
    findUserByUsername: findUserByUsername,
    updateUserLastActive: updateUserLastActive,
    updateUserProfile: updateUserProfile,
    deleteUser: deleteUser,
    getTransactionsForUser: getTransactionsForUser,
    addTransaction: addTransaction,
    clearUserTransactions: clearUserTransactions,
    removeTransactionById: removeTransactionById,
    getBudgetsForUser: getBudgetsForUser,
    getBudgetLimit: getBudgetLimit,
    upsertBudget: upsertBudget,
    getGoalsForUser: getGoalsForUser,
    saveGoalsForUser: saveGoalsForUser,
    getWaterfallLedger: getWaterfallLedger,
    currentMonthKey: currentMonthKey,
    getMonthlyIncomeAndExpenses: getMonthlyIncomeAndExpenses,
    getTotalsForUser: getTotalsForUser,
    getExpenseTotalsByCategoryThisMonth: getExpenseTotalsByCategoryThisMonth,
    getIncomeExpenseByTimeBucket: getIncomeExpenseByTimeBucket,
    getExpenseTotalsByTimeBucket: getExpenseTotalsByTimeBucket,
    topSpendingCategory: topSpendingCategory,
    distributeMonthlySavings: distributeMonthlySavings,
    formatMoneyDt: formatMoneyDt,
    getTransactionLabel: getTransactionLabel,
    BUDGET_CATEGORIES: BUDGET_CATEGORIES,
    isAdminSessionActive: isAdminSessionActive,
    setAdminSessionActive: setAdminSessionActive,
    clearAdminSession: clearAdminSession,
    isMasterAdminUsername: isMasterAdminUsername,
    DEFAULT_ADMIN_PASSWORD: DEFAULT_ADMIN_PASSWORD,
  };
})();
