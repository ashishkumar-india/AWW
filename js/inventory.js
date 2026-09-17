/* ==========================================================================
   Bihar State ICDS - Anganwadi Sevika Management System
   Inventory Management & Ledger Controller: js/inventory.js
   ========================================================================== */

/** Returns the current month key as YYYY-MM, e.g. "2026-09" */
function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calculates live balance for all Bihar commodities, scoped to the given month.
 * Fix #1: monthKey now defaults to the CURRENT calendar month (not hard-coded).
 * Fix #2: only transactions whose date falls within monthKey are counted.
 */
function computeLiveStockBalances(monthKey = null) {
  if (!monthKey) monthKey = getCurrentMonthKey();

  const opening = window.db.getOpeningStock(monthKey);
  const transactions = window.db.getTransactions();

  // Initialize summary for each commodity
  const balances = {};
  BIHAR_COMMODITIES.forEach(c => {
    balances[c.id] = {
      commodity: c,
      opening: Number(opening[c.id] || 0),
      inward: 0,
      hcmOutward: 0,
      thrOutward: 0,
      totalOutward: 0,
      currentBalance: Number(opening[c.id] || 0),
      status: "safe"
    };
  });

  // Tally only transactions that belong to the requested month
  transactions.forEach(t => {
    if (!t.date || !t.date.startsWith(monthKey)) return; // Fix #2: month scope
    const itemBal = balances[t.item];
    if (!itemBal) return;
    const qty = Number(t.quantity);
    if (t.type === "inward") {
      itemBal.inward += qty;
    } else if (t.type === "hcm") {
      itemBal.hcmOutward += qty;
      itemBal.totalOutward += qty;
    } else if (t.type === "thr") {
      itemBal.thrOutward += qty;
      itemBal.totalOutward += qty;
    }
  });

  // Calculate final balance and status
  BIHAR_COMMODITIES.forEach(c => {
    const b = balances[c.id];
    b.currentBalance = Number((b.opening + b.inward - b.totalOutward).toFixed(3));
    if (b.currentBalance <= c.criticalThreshold) {
      b.status = "critical";
    } else if (b.currentBalance <= c.reorderThreshold) {
      b.status = "warning";
    } else {
      b.status = "safe";
    }
  });

  return balances;
}

/**
 * Renders Live Stock Cards & KPI Overview
 */
function renderLiveStockCards(searchQuery = "") {
  const container = document.getElementById("stockCardsContainer");
  if (!container) return;

  const balances = computeLiveStockBalances();
  const lang = (typeof currentLang !== "undefined" ? currentLang : "hi");

  let lowStockCount = 0;
  let riceBalance = 0;
  let dalBalance = 0;
  let eggBalance = 0;

  let html = "";
  const query = searchQuery.trim().toLowerCase();

  BIHAR_COMMODITIES.forEach(c => {
    const b = balances[c.id];
    const name = lang === "hi" ? c.name_hi : c.name_en;
    const unit = lang === "hi" ? c.unit_hi : c.unit_en;

    // Tally KPI metrics
    if (c.id === "rice") riceBalance = b.currentBalance;
    if (c.id === "dal") dalBalance = b.currentBalance;
    if (c.id === "eggs") eggBalance = b.currentBalance;
    if (b.status !== "safe") lowStockCount++;

    // Filter by search query
    if (query && !name.toLowerCase().includes(query) && !c.id.includes(query)) {
      return;
    }

    // Capacity Meter percentage (relative to monthly required buffer ~ 3x reorder threshold)
    const maxCapacity = c.reorderThreshold * 3.5;
    const percent = Math.min(100, Math.max(5, (b.currentBalance / maxCapacity) * 100));

    // Status pill
    let statusPillClass = "status-safe";
    let statusText = lang === "hi" ? "पर्याप्त स्टॉक" : "Safe Stock";
    if (b.status === "warning") {
      statusPillClass = "status-warning";
      statusText = lang === "hi" ? "पुनः मंगाएं" : "Reorder Soon";
    } else if (b.status === "critical") {
      statusPillClass = "status-critical";
      statusText = lang === "hi" ? "अति-न्यूनतम" : "Critical Low";
    }

    html += `
      <div class="stock-card ${b.status}">
        <div class="stock-card-top">
          <div class="stock-name-box">
            <div class="stock-icon">${c.icon}</div>
            <div>
              <div class="stock-title">${name}</div>
              <span class="stock-source-tag">${c.source}</span>
            </div>
          </div>
          <span class="stock-status-pill ${statusPillClass}">${statusText}</span>
        </div>

        <div class="stock-balance-row">
          <div>
            <span class="stock-balance-num">${b.currentBalance}</span>
            <span class="stock-unit">${unit}</span>
            ${c.id === "milk" ? `<div style="font-size:12px; font-weight:800; color:#15803D; margin-top:2px;">(${Number((b.currentBalance / 0.2).toFixed(3))} पैकेट / Pkt)</div>` : ''}
          </div>
          <span class="stock-reorder-text">पुनः मांग सीमा: ${c.reorderThreshold} ${unit}${c.id === "milk" ? ` (${Number((c.reorderThreshold / 0.2).toFixed(0))} पैकेट)` : ''}</span>
        </div>

        <div class="stock-meter">
          <div class="stock-meter-fill ${b.status}" style="width: ${percent}%;"></div>
        </div>

        <div class="stock-card-footer">
          <span class="stock-monthly-stat">माह में कुल खपत: <strong>${b.totalOutward.toFixed(3)} ${unit}${c.id === "milk" ? ` (${Number((b.totalOutward / 0.2).toFixed(3))} पैकेट)` : ''}</strong></span>
          <button class="stock-card-btn" onclick="openInwardForCommodity('${c.id}')">+ आवक दर्ज</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Update KPI displays
  const kpiRiceVal = document.getElementById("kpiRiceVal");
  const kpiDalVal = document.getElementById("kpiDalVal");
  const kpiEggVal = document.getElementById("kpiEggVal");
  const kpiAlertsVal = document.getElementById("kpiAlertsVal");
  const alertCountBadge = document.getElementById("alertCountBadge");

  if (kpiRiceVal) kpiRiceVal.textContent = `${riceBalance} kg`;
  if (kpiDalVal) kpiDalVal.textContent = `${dalBalance} kg`;
  if (kpiEggVal) kpiEggVal.textContent = `${eggBalance} Nos.`;
  if (kpiAlertsVal) kpiAlertsVal.textContent = lowStockCount;

  if (alertCountBadge) {
    if (lowStockCount > 0) {
      alertCountBadge.textContent = lowStockCount;
      alertCountBadge.classList.add("visible");
    } else {
      alertCountBadge.classList.remove("visible");
    }
  }

  // Update Low Stock Banner — Fix #3: actually show it for critical/warning items
  renderAlertBanner(lowStockCount, balances);
}

/**
 * Fix #3: Renders the top alert banner for low/critical stock items.
 */
function renderAlertBanner(lowCount, balances) {
  const container = document.getElementById("statusBannerContainer");
  if (!container) return;

  const criticalItems = [];
  const warningItems = [];
  BIHAR_COMMODITIES.forEach(c => {
    const b = balances[c.id];
    if (!b) return;
    if (b.status === "critical") criticalItems.push(c.name_hi.split(" ")[0]);
    else if (b.status === "warning") warningItems.push(c.name_hi.split(" ")[0]);
  });

  if (criticalItems.length === 0 && warningItems.length === 0) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  let html = "";
  if (criticalItems.length > 0) {
    html += `<div class="alert-banner alert-banner-critical">⚠️ <strong>अति न्यून स्टॉक:</strong> ${criticalItems.join(", ")} — तत्काल मंगाएं!</div>`;
  }
  if (warningItems.length > 0) {
    html += `<div class="alert-banner alert-banner-warning">🔔 <strong>पुनः मंगाएं:</strong> ${warningItems.join(", ")} — स्टॉक कम हो रहा है।</div>`;
  }

  container.innerHTML = html;
  container.style.display = "block";
}

// Pagination state for ledger — Fix #6
let ledgerCurrentPage = 1;
const LEDGER_PAGE_SIZE = 25;

/**
 * Renders the Register-8 Transactions Ledger Table with pagination.
 * Fix #6: Shows 25 rows per page instead of all at once.
 */
function renderTransactionsLedger(filterType = "all", page = null) {
  const tbody = document.getElementById("transactionsTableBody");
  if (!tbody) return;

  if (page !== null) ledgerCurrentPage = page;

  const transactions = window.db.getTransactions();
  const lang = (typeof currentLang !== "undefined" ? currentLang : "hi");

  let filtered = transactions;
  if (filterType !== "all") {
    filtered = transactions.filter(t => t.type === filterType);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 24px; color: var(--neutral-muted);">
          कोई लेन-देन उपलब्ध नहीं है (No transactions found)
        </td>
      </tr>
    `;
    renderLedgerPagination(0, 0, filterType);
    return;
  }

  const totalPages = Math.ceil(filtered.length / LEDGER_PAGE_SIZE);
  if (ledgerCurrentPage > totalPages) ledgerCurrentPage = totalPages;
  const start = (ledgerCurrentPage - 1) * LEDGER_PAGE_SIZE;
  const paginated = filtered.slice(start, start + LEDGER_PAGE_SIZE);

  let html = "";
  paginated.forEach(t => {
    const commodity = BIHAR_COMMODITIES.find(c => c.id === t.item) || {
      name_hi: t.item,
      name_en: t.item,
      unit_hi: "kg",
      unit_en: "kg"
    };

    const itemName = lang === "hi" ? commodity.name_hi : commodity.name_en;
    const unitName = lang === "hi" ? commodity.unit_hi : commodity.unit_en;

    // Type Badge
    let typeBadge = "";
    if (t.type === "inward") {
      typeBadge = `<span class="badge badge-inward">📥 आवक (Inward)</span>`;
    } else if (t.type === "hcm") {
      typeBadge = `<span class="badge badge-hcm">🍲 दैनिक HCM</span>`;
    } else if (t.type === "thr") {
      typeBadge = `<span class="badge badge-thr">📦 टेक होम राशन (THR)</span>`;
    }

    const sourceText = t.source || t.challan || "-";
    const beneficiaryCount = t.beneficiaries ? `${t.beneficiaries} व्यक्ति/बच्चे` : "-";

    html += `
      <tr>
        <td class="font-bold">${formatDate(t.date)}</td>
        <td>${typeBadge}</td>
        <td><strong>${itemName}</strong></td>
        <td><span class="qty-pill font-bold">${t.quantity} ${unitName}</span></td>
        <td>
          <div style="font-size:12.5px;">${sourceText}</div>
          ${t.notes || t.details ? `<div style="font-size:11px; color:var(--neutral-muted);">${t.notes || t.details}</div>` : ""}
        </td>
        <td>${beneficiaryCount}</td>
        <td>
          <button class="btn btn-danger-outline" style="padding: 3px 8px; font-size: 11.5px;" onclick="deleteTransactionEntry('${t.id}')">
            🗑️ हटाएं
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  renderLedgerPagination(ledgerCurrentPage, totalPages, filterType);
}

/**
 * Renders pagination controls below the ledger table.
 */
function renderLedgerPagination(currentPage, totalPages, filterType) {
  let pager = document.getElementById("ledgerPaginationBar");
  if (!pager) {
    // Create pager div right after the table wrapper if not present
    const tableWrapper = document.querySelector(".ledger-table-wrapper") || document.getElementById("transactionsTableBody")?.closest("table")?.parentElement;
    if (tableWrapper) {
      pager = document.createElement("div");
      pager.id = "ledgerPaginationBar";
      pager.style.cssText = "display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 0;flex-wrap:wrap;";
      tableWrapper.after(pager);
    }
  }
  if (!pager) return;

  if (totalPages <= 1) { pager.innerHTML = ""; return; }

  let html = `<span style="font-size:13px;color:var(--neutral-muted);margin-right:4px;">पृष्ठ ${currentPage}/${totalPages}</span>`;
  html += `<button onclick="renderTransactionsLedger('${filterType}', 1)" ${currentPage===1?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--neutral-border);background:var(--surface);cursor:pointer;">«</button>`;
  html += `<button onclick="renderTransactionsLedger('${filterType}', ${currentPage-1})" ${currentPage===1?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--neutral-border);background:var(--surface);cursor:pointer;">‹</button>`;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let p = start; p <= end; p++) {
    const active = p === currentPage;
    html += `<button onclick="renderTransactionsLedger('${filterType}', ${p})" style="padding:4px 10px;border-radius:6px;border:1px solid ${active ? 'var(--primary)' : 'var(--neutral-border)'};background:${active ? 'var(--primary)' : 'var(--surface)'};color:${active ? '#fff' : 'inherit'};font-weight:${active ? '700' : '400'};cursor:pointer;">${p}</button>`;
  }

  html += `<button onclick="renderTransactionsLedger('${filterType}', ${currentPage+1})" ${currentPage===totalPages?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--neutral-border);background:var(--surface);cursor:pointer;">›</button>`;
  html += `<button onclick="renderTransactionsLedger('${filterType}', ${totalPages})" ${currentPage===totalPages?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--neutral-border);background:var(--surface);cursor:pointer;">»</button>`;

  pager.innerHTML = html;
}

/**
 * Fix #8: Deletes a transaction entry using the app's own confirm modal instead of browser confirm().
 */
function deleteTransactionEntry(id) {
  showConfirmModal(
    getTranslation("confirmDelete"),
    () => {
      window.db.deleteTransaction(id);
      renderLiveStockCards();
      renderTransactionsLedger(document.getElementById("ledgerTypeFilter")?.value || "all");
      if (window.renderMprDocument) window.renderMprDocument();
      showToast(getTranslation("deletedSuccess"), "info");
    }
  );
}

/**
 * Lightweight in-app confirm modal (replaces browser confirm()).
 * Fix #8: Works on all mobile browsers, matches the app design.
 */
function showConfirmModal(message, onConfirm) {
  let modal = document.getElementById("_confirmModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "_confirmModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
    modal.innerHTML = `
      <div style="background:var(--surface,#fff);border-radius:16px;padding:28px 24px;max-width:340px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.18);text-align:center;">
        <div style="font-size:2rem;margin-bottom:12px;">🗑️</div>
        <p id="_confirmMsg" style="font-size:15px;font-weight:600;color:var(--neutral-dark,#0F172A);margin-bottom:20px;line-height:1.5;"></p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="_confirmCancel" style="flex:1;padding:10px;border-radius:8px;border:1.5px solid var(--neutral-border,#E2E8F0);background:var(--surface,#fff);font-size:14px;font-weight:600;cursor:pointer;">रद्द करें</button>
          <button id="_confirmOk" style="flex:1;padding:10px;border-radius:8px;border:none;background:#E11D48;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">हटाएं ✓</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById("_confirmCancel").addEventListener("click", () => { modal.style.display = "none"; });
    modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
  }
  document.getElementById("_confirmMsg").textContent = message;
  modal.style.display = "flex";
  const okBtn = document.getElementById("_confirmOk");
  // Remove previous listener and attach fresh one
  const freshOk = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(freshOk, okBtn);
  freshOk.addEventListener("click", () => {
    modal.style.display = "none";
    onConfirm();
  });
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

window.renderLiveStockCards = renderLiveStockCards;
window.renderTransactionsLedger = renderTransactionsLedger;
window.deleteTransactionEntry = deleteTransactionEntry;
window.computeLiveStockBalances = computeLiveStockBalances;
