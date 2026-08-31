(function () {
'use strict';

console.log('[NEMKO JS] my-qualifications.js EXECUTING');

// ─── Config ───────────────────────────────────────────────────────────────────
var SORT_CYCLE = ['asc', 'desc', 'default'];

var tables = {

  // ── Authorized tab ───────────────────────────────────────────────────────────
  'authorized-table': {
    tableSelector: '.my-qualifcation-table .table',
    dropdownId:    'authorized-col-visibility',
    sortState:     { key: null, direction: 'default' },
    pageState:     { current: 1 },
    paginationMeta: null,
    columns: [
      { key: 'qualifications', label: 'Qualifications',               sortable: true,  sortApiKey: 'qualificationreference', visible: true,  dropdown: true },
      { key: 'level',          label: 'Level',                        sortable: true,  sortApiKey: 'qualificationlevel',     visible: true,  dropdown: true },
      { key: 'verifiedBy',     label: 'Verified By',                  sortable: true,  sortApiKey: 'verifier',               visible: true,  dropdown: true },
      { key: 'active',         label: 'Active',                       sortable: true,  sortApiKey: 'qualificationstatus',    visible: true,  dropdown: true },
      { key: 'limitations',    label: 'Limitations',                  sortable: true,  sortApiKey: 'limitations',            visible: true,  dropdown: true },
      { key: 'report',         label: 'Report <br/> Approver',        sortable: true,  sortApiKey: 'reportapprover',         visible: true,  dropdown: true },
      { key: 'certification',  label: 'Certification <br/> Decision', sortable: true,  sortApiKey: 'certificationdecision',  visible: true,  dropdown: true },
      { key: 'conformity',     label: 'Conformity <br/> Statement',   sortable: true,  sortApiKey: 'confirmitystatement',    visible: true,  dropdown: true },
      { key: 'action',         label: 'Action',                       sortable: false,                                       visible: true,  dropdown: false },
    ],
    rows: [],
  },

  // ── Requested tab ────────────────────────────────────────────────────────────
  'requested-table': {
    tableSelector: '.my-qualifcation-table-requested .table',
    dropdownId:    'requested-col-visibility',
    sortState:     { key: null, direction: 'default' },
    pageState:     { current: 1 },
    paginationMeta: null,
    columns: [
      { key: 'qualifications', label: 'Qualifications', sortable: true,  sortApiKey: 'qualificationreference', visible: true, dropdown: true  },
      { key: 'level',          label: 'Level',          sortable: true,  sortApiKey: 'qualificationlevel',     visible: true, dropdown: true  },
      { key: 'verifiedBy',     label: 'Verified By',    sortable: true,  sortApiKey: 'verifier',               visible: true, dropdown: true  },
      { key: 'rejectedDate',   label: 'Rejected Date',  sortable: true,  sortApiKey: 'Updated',                visible: true, dropdown: true  },
      { key: 'action',         label: 'Action',         sortable: false,                                        visible: true, dropdown: false },
    ],
    rows: [],
  },
};

// ─── Server-side filter state (authorized table only) ─────────────────────────
var authorizedApiFilter = {
  status:               null,
  conformityStatement:  null,
  certificationDecision: null,
  qualificationLevel:   null,
  reportApprover:       null,
  search:               '',
  operator:             'contains',
  sortBy:               null,
  sortOrder:            null,
};

var requestedApiFilter = { search: '', operator: 'contains', sortBy: null, sortOrder: null };

function applyAuthorizedFilters(page) {
  var fetchFn = window.nemkoFetchQualificationsPage;
  if (typeof fetchFn !== 'function') return;
  fetchFn(page || 1, authorizedApiFilter).then(function () {
    tables['authorized-table'].rows           = window.nemkoTableRows       || [];
    tables['authorized-table'].paginationMeta = window.nemkoTablePagination || null;
    renderTable('authorized-table');
  });
}

function applyRequestedFilters(page) {
  var fetchFn = window.nemkoFetchRequestedPage;
  if (typeof fetchFn !== 'function') return;
  fetchFn(page || 1, requestedApiFilter).then(function () {
    tables['requested-table'].rows           = window.nemkoRequestedRows       || [];
    tables['requested-table'].paginationMeta = window.nemkoRequestedPagination || null;
    renderTable('requested-table');
  });
}

// ─── Rows (API already filtered/sorted — return as-is) ───────────────────────
function getSortedRows(config) {
  return config.rows.slice();
}

function cycleSort(tabId, key) {
  var config    = tables[tabId];
  if (!config) return;
  var sortState = config.sortState;

  if (sortState.key !== key) {
    sortState.key       = key;
    sortState.direction = 'asc';
  } else {
    var idx = SORT_CYCLE.indexOf(sortState.direction);
    sortState.direction = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    if (sortState.direction === 'default') sortState.key = null;
  }

  config.pageState.current = 1;

  // Resolve the API sort field from the column's sortApiKey
  var sortCol = config.columns.find(function (c) { return c.key === sortState.key; });
  var apiSortBy = (sortState.direction !== 'default' && sortCol && sortCol.sortApiKey)
    ? sortCol.sortApiKey
    : null;

  if (tabId === 'authorized-table') {
    authorizedApiFilter.sortBy    = apiSortBy;
    authorizedApiFilter.sortOrder = sortState.direction !== 'default' ? sortState.direction : null;
    applyAuthorizedFilters(1);
    return;
  }
  if (tabId === 'requested-table') {
    requestedApiFilter.sortBy    = apiSortBy;
    requestedApiFilter.sortOrder = sortState.direction !== 'default' ? sortState.direction : null;
    applyRequestedFilters(1);
    return;
  }
  renderTable(tabId);
}

// ─── Sort SVG helpers ─────────────────────────────────────────────────────────
function getSortSVG(sortState, key) {
  var isActive = (sortState.key === key);
  var dir      = isActive ? sortState.direction : 'default';
  var primary  = 'var(--color-primary, #006e8c)';
  var muted    = '#C0C0C0';
  var upFill   = (isActive && dir === 'asc')  ? primary : muted;
  var downFill = (isActive && dir === 'desc') ? primary : muted;

  return (
    '<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5 1L1 5H9L5 1Z"   fill="' + upFill   + '" />' +
      '<path d="M5 13L1 9H9L5 13Z" fill="' + downFill + '" />' +
    '</svg>'
  );
}

function getSortTitle(sortState, key) {
  if (sortState.key !== key || sortState.direction === 'default') return 'Click to sort ascending';
  if (sortState.direction === 'asc')  return 'Click to sort descending';
  return 'Click to clear sort';
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function renderPagination(tabId) {
  var config     = tables[tabId];
  var container  = document.getElementById(tabId);
  if (!container) return;
  var pagination = container.querySelector('.nemko-pagination');
  if (!pagination) return;

  var meta       = config.paginationMeta || {};
  var pageNumber = meta.pageNumber     || 1;
  var lastPage   = meta.lastPageNumber || 1;
  var totalCount = meta.totalCount     || 0;
  var pageSize   = meta.pageSize       || 0;
  var hasBack    = !!meta.hasBack;
  var hasMore    = !!meta.hasMore;

  var startNum = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  var endNum   = pageSize > 0 ? Math.min(pageNumber * pageSize, totalCount) : totalCount;

  pagination.innerHTML =
    '<li class="page-item ' + (!hasBack ? 'disabled' : 'cursor-pointer') + '" data-page="first">' +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
        '<path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898"/>' +
        '<rect width="1.815" height="8.1675" fill="#989898"/>' +
      '</svg>' +
    '</li>' +
    '<li class="page-item ' + (!hasBack ? 'disabled' : 'cursor-pointer') + '" data-page="prev">' +
      '<svg width="14" height="10" viewBox="0 0 14 10" fill="none">' +
        '<path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898"/>' +
        '<path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898"/>' +
      '</svg>' +
    '</li>' +
    '<li class="page-item">' +
      '<span class="font-medium font-inter text-black text-xs">' + startNum + ' to ' + endNum + ' of ' + totalCount + '</span>' +
    '</li>' +
    '<li class="page-item ' + (!hasMore ? 'disabled' : 'cursor-pointer') + '" data-page="next">' +
      '<svg width="14" height="10" viewBox="0 0 14 10" fill="none">' +
        '<path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898"/>' +
        '<path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898"/>' +
      '</svg>' +
    '</li>' +
    '<li class="page-item ' + (!hasMore ? 'disabled' : 'cursor-pointer') + '" data-page="last">' +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
        '<path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898"/>' +
        '<rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898"/>' +
      '</svg>' +
    '</li>';

  var fetchFn = tabId === 'authorized-table'
    ? window.nemkoFetchQualificationsPage
    : window.nemkoFetchRequestedPage;

  pagination.querySelectorAll('.page-item:not(.disabled)').forEach(function (item) {
    item.addEventListener('click', function () {
      var action  = item.dataset.page;
      var newPage = pageNumber;
      if (action === 'first') newPage = 1;
      if (action === 'prev')  newPage = Math.max(1, pageNumber - 1);
      if (action === 'next')  newPage = Math.min(lastPage, pageNumber + 1);
      if (action === 'last')  newPage = lastPage;
      if (newPage === pageNumber) return;
      if (typeof fetchFn !== 'function') return;
      var fetchPromise = (tabId === 'authorized-table')
        ? fetchFn(newPage, authorizedApiFilter)
        : fetchFn(newPage, requestedApiFilter);
      fetchPromise.then(function () {
        config.rows           = tabId === 'authorized-table'
          ? (window.nemkoTableRows     || [])
          : (window.nemkoRequestedRows || []);
        config.paginationMeta = tabId === 'authorized-table'
          ? (window.nemkoTablePagination     || null)
          : (window.nemkoRequestedPagination || null);
        renderTable(tabId);
      });
    });
  });
}

// ─── Render Table ─────────────────────────────────────────────────────────────
function renderTable(tabId) {
  var config    = tables[tabId];
  if (!config) return;
  var container = document.getElementById(tabId);
  if (!container) return;
  var table = container.querySelector(config.tableSelector);
  if (!table) return;

  var visCols   = config.columns.filter(function (c) { return c.visible; });
  var pagedRows = getSortedRows(config);

  var theadTr = table.querySelector('thead tr');
  theadTr.innerHTML = visCols.map(function (col) {
    if (!col.sortable) {
      return (
        '<th>' +
          '<div class="w-100 d-flex align-items-center">' +
            '<p class="text-color-3 font-medium text-sm lg-text-base">' + col.label + '</p>' +
          '</div>' +
        '</th>'
      );
    }
    return (
      '<th class="sortable-col"' +
          ' data-table-id="' + tabId + '"' +
          ' data-col-key="'  + col.key + '"' +
          ' style="cursor:pointer;"' +
          ' title="' + getSortTitle(config.sortState, col.key) + '">' +
        '<div class="w-100 d-flex justify-content-between align-items-center gap-1"' +
            ' style="flex-wrap:nowrap;pointer-events:none;">' +
          '<p class="text-color-3 font-medium text-sm lg-text-base" style="margin:0;min-width:0;">' +
            col.label +
          '</p>' +
          '<span style="display:inline-flex;flex-shrink:0;align-items:center;">' +
            getSortSVG(config.sortState, col.key) +
          '</span>' +
        '</div>' +
      '</th>'
    );
  }).join('');

  theadTr.querySelectorAll('.sortable-col').forEach(function (th) {
    th.addEventListener('click', function () {
      var tId = th.dataset.tableId;
      var key = th.dataset.colKey;
      if (tId && key) cycleSort(tId, key);
    });
  });

  var tbody = table.querySelector('tbody');

  if (pagedRows.length === 0) {
    tbody.innerHTML =
      '<tr>' +
        '<td colspan="' + visCols.length + '" ' +
            'class="text-center py-4 text-color-3 text-sm font-medium">' +
          'No records found.' +
        '</td>' +
      '</tr>';
    renderPagination(tabId);
    return;
  }

  tbody.innerHTML = pagedRows.map(function (row) {
    var cells = visCols.map(function (col) {
      if (col.key === 'action') {
        if (tabId === 'requested-table' && row.qualificationStatusName === 'Verified') {
          return '<td>Verified</td>';
        }
        if (tabId === 'authorized-table' && row.withdrawn === true) {
          return '<td>Withdrawn</td>';
        }
        var actionsRaw = row.actions || '';
        var actions = typeof actionsRaw === 'string'
          ? actionsRaw.split(',').map(function (a) { return a.trim(); }).filter(Boolean)
          : (Array.isArray(actionsRaw) ? actionsRaw : []);

        var btns = actions.map(function (action) {
          return (
            '<a href="javascript:void(0)" class="btn btn-link p-0 text-decoration-none action-btn"' +
              ' data-action="' + action + '"' +
              ' data-row-id="' + (row.id != null ? row.id : '') + '"' +
              ' data-tab-id="' + tabId + '">' +
              action +
            '</a>'
          );
        }).join('<span class="text-muted mx-1" style="font-size:0.7rem;">|</span>');

        return '<td><div class="d-flex gap-1 flex-wrap">' + btns + '</div></td>';
      }
      return '<td>' + (row[col.key] != null ? row[col.key] : '') + '</td>';
    }).join('');

    return (
      '<tr class="cursor-pointer"' +
          ' data-row-id="' + (row.id != null ? row.id : '') + '"' +
          ' data-tab-id="' + tabId + '">' +
        cells +
      '</tr>'
    );
  }).join('');

  renderPagination(tabId);
}

// ─── Column-visibility dropdown ───────────────────────────────────────────────
function buildDropdown(tabId) {
  var config = tables[tabId];
  if (!config) return;
  var ddMenu = document.getElementById(config.dropdownId);
  if (!ddMenu) return;

  var toggleable = config.columns.filter(function (c) { return c.dropdown; });

  ddMenu.innerHTML = toggleable.map(function (col) {
    return (
      '<li class="py-10">' +
        '<label class="dropdown-item d-flex align-items-center gap-2" data-col-key="' + col.key + '">' +
          '<input type="checkbox" ' + (col.visible ? 'checked' : '') + ' class="d-none" />' +
          '<span class="chkbox-icon ' + (col.visible ? 'active' : '') + '"></span>' +
          '<p class="font-medium text-sm md-text-base text-color-3">' + col.label.replace('<br/>', ' ') + '</p>' +
        '</label>' +
      '</li>'
    );
  }).join('');

  ddMenu.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var key = this.closest('label').dataset.colKey;
      var col = config.columns.find(function (c) { return c.key === key; });
      if (!col) return;

      var visibleCount = config.columns.filter(function (c) { return c.visible; }).length;
      if (visibleCount === 1 && !this.checked) {
        this.checked = true;
        return;
      }
      col.visible = this.checked;
      this.closest('label').querySelector('.chkbox-icon').classList.toggle('active', this.checked);

      if (!col.visible && config.sortState.key === col.key) {
        config.sortState.key       = null;
        config.sortState.direction = 'default';
      }

      renderTable(tabId);
    });
  });
}


// ─── Tab switch ───────────────────────────────────────────────────────────────
function initTabSwitch() {
  document.querySelectorAll('.nemko-tab-btn').forEach(function (btn) {
    if (btn.dataset.tabSwitchInit === '1') return;
    btn.dataset.tabSwitchInit = '1';

    btn.addEventListener('click', function () {
      var tabId = this.dataset.tabId;
      if (!tabId) return;

      document.querySelectorAll('.nemko-tab-btn').forEach(function (b) {
        b.classList.remove('nemko-tab-btn-active');
      });
      document.querySelectorAll('.nemko-data-table-qualification').forEach(function (t) {
        t.style.display = 'none';
      });

      this.classList.add('nemko-tab-btn-active');
      var target = document.getElementById(tabId);
      if (target) target.style.display = 'block';

      if (tables[tabId]) renderTable(tabId);
    });
  });
}

// ─── Action button + row click delegation ─────────────────────────────────────
if (!window._nemkoMyQualListeners) {
  window._nemkoMyQualListeners = true;

  document.addEventListener('click', function (e) {

    var btn = e.target.closest('.action-btn[data-action]');
    if (btn) {
      e.stopPropagation();
      var action = btn.dataset.action;
      var rowId  = btn.dataset.rowId;
      var tabId  = btn.dataset.tabId;
      var allRows = (tabId === 'authorized-table')
        ? (window.nemkoTableRows     || [])
        : (window.nemkoRequestedRows || []);
      var item = allRows.find(function (r) { return String(r.id) === String(rowId); });

      if (action === 'Update' || action === 'Edit') {
        if (!item) { console.warn('[NEMKO] Edit: row not found. rowId="' + rowId + '"'); return; }
        if (typeof window.nemkoOpenEditQualification !== 'function') {
          console.error('[NEMKO] window.nemkoOpenEditQualification is not defined');
          return;
        }
        window.nemkoOpenEditQualification(item, tabId);
      } else if (action === 'Withdraw') {
        if (!rowId) { console.warn('[NEMKO] Withdraw: no rowId'); return; }
        if (typeof window.nemkoWithdrawQualification !== 'function') {
          console.error('[NEMKO] window.nemkoWithdrawQualification is not defined');
          return;
        }
        window.nemkoWithdrawQualification(rowId);
      } else if (action === 'View Details') {
        if (!item) { console.warn('[NEMKO] View Details: row not found. rowId="' + rowId + '"'); return; }
        if (typeof window.nemkoOpenDetailsQualification !== 'function') {
          console.error('[NEMKO] window.nemkoOpenDetailsQualification is not defined');
          return;
        }
        window.nemkoOpenDetailsQualification(item, tabId);
      }
      return;
    }

    var rowEl = e.target.closest('tr[data-row-id][data-tab-id]');
    if (!rowEl) return;
    var rowId = rowEl.dataset.rowId;
    var tabId = rowEl.dataset.tabId;
    var allRows = (tabId === 'authorized-table')
      ? (window.nemkoTableRows     || [])
      : (window.nemkoRequestedRows || []);
    var item = allRows.find(function (r) { return String(r.id) === String(rowId); });
    if (!item) return;
    if (typeof window.nemkoOpenDetailsQualification === 'function') {
      window.nemkoOpenDetailsQualification(item, tabId);
    }
  });
}

// ─── Level filter select ──────────────────────────────────────────────────────
function populateLevelFilterSelect(selectId) {
  var levels = window.nemkoQualificationLevels || [];
  if (!levels.length) return;
  var sel = document.getElementById(selectId);
  if (!sel) return;
  sel.querySelectorAll('option:not([value=""])').forEach(function (o) { o.parentNode.removeChild(o); });
  levels.forEach(function (lv) {
    var opt = document.createElement('option');
    opt.value = String(lv.id);
    opt.textContent = lv.name;
    sel.appendChild(opt);
  });
}

// ─── Search operator dropdown wiring ─────────────────────────────────────────
function getSymbolHtml(symbolType, symbol) {
  if (symbolType === 'text-full')  return '<u>Ab</u>';
  if (symbolType === 'text-start') return '<u>A</u>b';
  if (symbolType === 'text-end')   return 'A<u>b</u>';
  return symbol;
}

function initSearchOperator(container, tableId) {
  var operatorBtn = container.querySelector('.text-transform-btn[data-bs-toggle="dropdown"]');
  if (!operatorBtn || operatorBtn.dataset.operatorInit === '1') return;
  operatorBtn.dataset.operatorInit = '1';

  var searchInput = container.querySelector('.nemko-filter-search');

  container.querySelectorAll('.search-op-item[data-table-id="' + tableId + '"]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var op         = this.dataset.operator;
      var symbol     = this.dataset.symbol;
      var symbolType = this.dataset.symbolType;

      // Update button symbol (innerHTML for partial-underline support)
      if (operatorBtn) {
        operatorBtn.innerHTML        = getSymbolHtml(symbolType, symbol);
        operatorBtn.dataset.operator = op;
      }

      // Update active state
      container.querySelectorAll('.search-op-item[data-table-id="' + tableId + '"]').forEach(function (i) {
        i.classList.toggle('active', i.dataset.operator === op);
      });

      var isValueless = (op === 'empty' || op === 'notempty');

      // Enable/disable search input
      if (searchInput) {
        searchInput.disabled = isValueless;
        if (isValueless) searchInput.value = '';
      }

      if (tableId === 'authorized-table') {
        authorizedApiFilter.operator = op;
        authorizedApiFilter.search   = isValueless ? '' : (searchInput ? searchInput.value : '');
        applyAuthorizedFilters(1);
      } else {
        requestedApiFilter.operator = op;
        requestedApiFilter.search   = isValueless ? '' : (searchInput ? searchInput.value : '');
        applyRequestedFilters(1);
      }
    });
  });
}

// ─── Authorized table server-side filter wiring ───────────────────────────────
var AUTHORIZED_FILTER_MAP = {
  'active':                 'status',
  'report':                 'reportApprover',
  'conformity':             'conformityStatement',
  'certificationDecision':  'certificationDecision',
};

function initAuthorizedServerFilters() {
  var container = document.getElementById('authorized-table');
  if (!container) return;

  initSearchOperator(container, 'authorized-table');

  var searchInput = container.querySelector('.nemko-filter-search');
  if (searchInput && !searchInput.dataset.serverFilterInit) {
    searchInput.dataset.serverFilterInit = '1';
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        authorizedApiFilter.search = this.value;
        applyAuthorizedFilters(1);
      }
    });
  }

  container.querySelectorAll('select[data-filter-key]').forEach(function (sel) {
    if (sel.dataset.serverFilterInit === '1') return;
    sel.dataset.serverFilterInit = '1';
    var filterKey = sel.dataset.filterKey;

    if (filterKey === 'level') {
      sel.addEventListener('change', function () {
        var val = this.value;
        authorizedApiFilter.qualificationLevel = val ? parseInt(val, 10) : null;
        applyAuthorizedFilters(1);
      });
      return;
    }

    var apiParam = AUTHORIZED_FILTER_MAP[filterKey];
    if (!apiParam) return;
    sel.addEventListener('change', function () {
      var val = this.value;
      authorizedApiFilter[apiParam] = val === '' ? null : (val.toLowerCase() === 'yes');
      applyAuthorizedFilters(1);
    });
  });
}

function initRequestedServerFilters() {
  var container = document.getElementById('requested-table');
  if (!container) return;

  initSearchOperator(container, 'requested-table');

  var searchInput = container.querySelector('.nemko-filter-search');
  if (searchInput && !searchInput.dataset.serverFilterInit) {
    searchInput.dataset.serverFilterInit = '1';
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        requestedApiFilter.search = this.value;
        applyRequestedFilters(1);
      }
    });
  }
}

// ─── Main init ────────────────────────────────────────────────────────────────
function initMyQualifications() {
  tables['authorized-table'].rows           = window.nemkoTableRows           || [];
  tables['requested-table'].rows            = window.nemkoRequestedRows       || [];
  tables['authorized-table'].paginationMeta = window.nemkoTablePagination     || null;
  tables['requested-table'].paginationMeta  = window.nemkoRequestedPagination || null;

  populateLevelFilterSelect('authorizedLevelFilter');

  Object.keys(tables).forEach(function (tabId) {
    buildDropdown(tabId);
    renderTable(tabId);
  });

  initTabSwitch();
  initAuthorizedServerFilters();
  initRequestedServerFilters();

  var activeTabBtn = document.querySelector('.nemko-tab-btn-active');
  var activeTabId  = activeTabBtn ? activeTabBtn.dataset.tabId : 'authorized-table';
  document.querySelectorAll('.nemko-data-table-qualification').forEach(function (t) {
    t.style.display = (t.id === activeTabId) ? 'block' : 'none';
  });
}

// ─── Expose globals ───────────────────────────────────────────────────────────
window.initMyQualifications  = initMyQualifications;
window.cycleSort             = cycleSort;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyQualifications);
} else {
  initMyQualifications();
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Reference-data populate helpers (shared by add + edit modals) ────────────
// ─────────────────────────────────────────────────────────────────────────────

function populateTypeSelectEl(selectId) {
  var types = window.nemkoQualificationTypes || [];
  if (!types.length) return;
  var $sel = $('#' + selectId);
  $sel.find('option:not([disabled])').remove();
  types.forEach(function (t) {
    $sel.append('<option value="' + t.key + '" data-type-id="' + t.id + '">' + t.name + '</option>');
  });
}

function populateLevelRadiosInto(containerId, radioName) {
  var levels = window.nemkoQualificationLevels || [];
  if (!levels.length) return;
  var $c = $('#' + containerId);
  $c.empty();
  levels.forEach(function (lv) {
    $c.append(
      '<label class="nemko-frm-radio d-flex align-items-center gap-2">' +
        '<input class="form-check-input" type="radio" name="' + radioName + '"' +
          ' value="' + lv.key + '" data-level-id="' + lv.id + '">' +
        '<span class="radio-icon radio-icon-lg"></span>' +
        '<p class="form-check-label">' + lv.name + '</p>' +
      '</label>'
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Add Qualification Modal ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
(function initAddQualificationModal() {

  var TYPE_LABELS = {
    standard:   'Standard',
    scheme:     'Scheme',
    testMethod: 'Test Method',
  };

  var formState = {
    qualificationType: '',
    standard:          '',
    standardId:        '',
    remarks:           '',
    limitations:       '',
    targetDate:        '',
    qualifiedDate:     '',
    verifiedBy:        '',
    verifiedByIds:     '',
    authorizedBy:      '',
    authorizedByIds:   '',
    level:             '',
    levelSubs:         [],
  };

  var _returningFromChild = false;

  function syncTypeLabels(type) {
    var label = TYPE_LABELS[type] || type;
    $('#standardFieldLabel').html(label + '<span class="text-danger">*</span>');
    $('#standardSelectModalTitle').text('Select ' + label);
  }

  function saveFormState() {
    formState.qualificationType = $('#qualifcationTypeList').val() || '';
    formState.standard          = $('#Standared').val();
    formState.standardId        = $('#Standared').attr('data-ref-id') || '';
    formState.remarks           = $('#remarksTxtarea').val();
    formState.limitations       = $('#limitationsTxtarea').val();
    formState.targetDate        = $('#targetAchieveDate').val();
    formState.qualifiedDate     = $('#qualifiedDate').val();
    formState.verifiedBy        = $('#toBeVerifiedByIp').val();
    formState.verifiedByIds     = $('#toBeVerifiedByIp').attr('data-emp-ids') || '';
    formState.authorizedBy      = $('#toBeAuthorizedByIp').val();
    formState.authorizedByIds   = $('#toBeAuthorizedByIp').attr('data-emp-ids') || '';
    formState.level             = $('input[name="qualificationLevel"]:checked').val() || '';
    formState.levelSubs         = $('input[name="qualificationLevelSub"]:checked')
                                    .map(function () { return $(this).val(); }).get();
  }

  function restoreFormState() {
    populateTypeSelectEl('qualifcationTypeList');
    populateLevelRadiosInto('qualificationLevelRadios', 'qualificationLevel');
    $('#qualifcationTypeList').val(formState.qualificationType);
    $('#Standared').val(formState.standard).attr('data-ref-id', formState.standardId || '');
    $('#remarksTxtarea').val(formState.remarks);
    $('#limitationsTxtarea').val(formState.limitations);
    $('#targetAchieveDate').val(formState.targetDate);
    $('#qualifiedDate').val(formState.qualifiedDate);
    $('#toBeVerifiedByIp').val(formState.verifiedBy).attr('data-emp-ids', formState.verifiedByIds);
    $('#toBeAuthorizedByIp').val(formState.authorizedBy).attr('data-emp-ids', formState.authorizedByIds);
    $('input[name="qualificationLevel"]').prop('checked', false);
    if (formState.level) {
      $('input[name="qualificationLevel"][value="' + formState.level + '"]').prop('checked', true);
    }
    $('input[name="qualificationLevelSub"]').prop('checked', false);
    formState.levelSubs.forEach(function (val) {
      $('input[name="qualificationLevelSub"][value="' + val + '"]').prop('checked', true);
    });
    syncTypeLabels(formState.qualificationType);
    if (formState.qualificationType) {
      $('.quaification-type-standard').show();
    } else {
      $('.quaification-type-standard').hide();
    }
    handleCheckboxVisibility();
  }

  function resetForm() {
    formState.qualificationType = '';
    formState.standard          = '';
    formState.standardId        = '';
    formState.remarks           = '';
    formState.limitations       = '';
    formState.targetDate        = '';
    formState.qualifiedDate     = '';
    formState.verifiedBy        = '';
    formState.verifiedByIds     = '';
    formState.authorizedBy      = '';
    formState.authorizedByIds   = '';
    formState.level             = '';
    formState.levelSubs         = [];
    $('#addQualificationModal .is-invalid').removeClass('is-invalid');
    var lc = document.getElementById('qualificationLevelRadios');
    if (lc) { lc.style.outline = ''; lc.classList.remove('is-invalid'); }
    var levelErr = document.getElementById('qualificationLevelError');
    if (levelErr) levelErr.style.display = 'none';
    restoreFormState();
  }

  $(document).on('show.bs.modal', '#addQualificationModal', function () {
    if (_returningFromChild) {
      _returningFromChild = false;
      restoreFormState();
    } else {
      resetForm();
    }
    initDatepickers();
  });

  function initDatepickers() {
    if (typeof $.fn.datepicker === 'undefined') {
      var retries = 0;
      var iv = setInterval(function () {
        retries++;
        if (typeof $.fn.datepicker !== 'undefined') {
          clearInterval(iv);
          bindDatepickers();
        } else if (retries >= 10) {
          clearInterval(iv);
        }
      }, 200);
      return;
    }
    bindDatepickers();
  }

  function bindDatepickers() {
    var dpOpts = {
      dateFormat: 'dd-mm-yy',
      beforeShow: function (input, inst) {
        $(inst.dpDiv).addClass('nemko-input-datepicker');
      },
    };
    var dpOptsTargetDate = $.extend({}, dpOpts, { minDate: 0 });
    if ($('#targetAchieveDate').hasClass('hasDatepicker')) $('#targetAchieveDate').datepicker('destroy');
    if ($('#qualifiedDate').hasClass('hasDatepicker'))     $('#qualifiedDate').datepicker('destroy');
    $('#targetAchieveDate').datepicker(dpOptsTargetDate);
    $('#qualifiedDate').datepicker(dpOpts);
  }

  $(document).on('change', '#qualifcationTypeList', function () {
    formState.qualificationType = $(this).val();
    syncTypeLabels(formState.qualificationType);
    formState.standard   = '';
    formState.standardId = '';
    formState.levelSubs  = [];
    $('#Standared').val('').attr('data-ref-id', '');
    $('[name="qualificationLevelSub"]').prop('checked', false);
    if (formState.qualificationType) {
      $('.quaification-type-standard').show();
      window.nemkoStandardItems = null;
      if (typeof window.nemkoFetchQualificationReferences === 'function') {
        window.nemkoFetchQualificationReferences(formState.qualificationType);
      }
    } else {
      $('.quaification-type-standard').hide();
    }
    handleCheckboxVisibility();
  });

  $(document).on('change', 'input[name="qualificationLevel"]', function () {
    formState.levelSubs = [];
    $('[name="qualificationLevelSub"]').prop('checked', false);
    handleCheckboxVisibility();
  });

  // When Report Approver is toggled for employee/Level 1, update Conformity Statement visibility
  $(document).on('change', '#addQualificationModal [name="qualificationLevelSub"][value="report-approver"]', function () {
    var selectedLevel = $('input[name="qualificationLevel"]:checked').val();
    if ((formState.qualificationType === 'standard' || formState.qualificationType === 'testMethod') &&
        (selectedLevel === 'employee' || selectedLevel === '1_test_associate')) {
      var $conformity = $('[name="qualificationLevelSub"][value="conformity-conformity"]');
      if (this.checked) {
        $conformity.prop('checked', true).closest('label').removeClass('d-flex').addClass('d-none');
      } else {
        $conformity.prop('checked', false).closest('label').removeClass('d-none').addClass('d-flex');
      }
    }
  });

  function handleCheckboxVisibility() {
    var selectedLevel = $('input[name="qualificationLevel"]:checked').val();
    var type          = formState.qualificationType;
    var isStandard    = type === 'standard';
    var isTestMethod  = type === 'testMethod';
    var isScheme      = type === 'scheme';

    // Reset visibility only — checked state is managed separately
    $('.qualificationLevelSub-container').hide();
    $('[name="qualificationLevelSub"]').closest('label').removeClass('d-flex').addClass('d-none');

    if (!selectedLevel) return;

    if (isStandard || isTestMethod) {
      if (selectedLevel === 'employee' || selectedLevel === '1_test_associate') {
        // Report Approver: show (user decides)
        // Conformity Statement: conditional — auto-Yes if Report Approver is checked, else show
        $('.qualificationLevelSub-container').show();
        $('[name="qualificationLevelSub"][value="report-approver"]').closest('label').removeClass('d-none').addClass('d-flex');
        var reportChecked = $('[name="qualificationLevelSub"][value="report-approver"]').prop('checked');
        if (reportChecked) {
          $('[name="qualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
        } else {
          $('[name="qualificationLevelSub"][value="conformity-conformity"]').closest('label').removeClass('d-none').addClass('d-flex');
        }
      } else if (selectedLevel === '2_project_handler') {
        // Report Approver: show (user decides) | Conformity Statement: always Yes (auto, hidden)
        $('.qualificationLevelSub-container').show();
        $('[name="qualificationLevelSub"][value="report-approver"]').closest('label').removeClass('d-none').addClass('d-flex');
        $('[name="qualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
      } else if (selectedLevel === '3_verifier' || selectedLevel === '4_verifier_assessor') {
        // Report Approver & Conformity: always Yes (auto, hidden — container stays hidden)
        $('[name="qualificationLevelSub"][value="report-approver"]').prop('checked', true);
        $('[name="qualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
      }
      // Certification Decision: always No, hidden (already reset above)
      return;
    }

    if (isScheme) {
      // Report Approver & Conformity Statement: always No, hidden
      if (selectedLevel === '3_verifier' || selectedLevel === '4_verifier_assessor') {
        // Certification Decision: show (user decides)
        $('.qualificationLevelSub-container').show();
        $('[name="qualificationLevelSub"][value="certification-decision"]').closest('label').removeClass('d-none').addClass('d-flex');
      }
      // Employee / Level 1 / Level 2: Certification Decision always No (already reset)
    }
  }

  function populateStandardsList() {
    var items = window.nemkoStandardItems;
    var $list = $('#standardSelectList');
    if (items === null || items === undefined) {
      $list.html('<div class="text-center py-3 text-color-3 text-sm">Loading...</div>');
      return;
    }
    if (!items.length) {
      $list.html('<div class="text-center py-3 text-color-3 text-sm">No items found.</div>');
      return;
    }
    $list.html(items.map(function (item) {
      return (
        '<label class="nemko-frm-radio d-flex align-items-center gap-2" data-item-id="' + item.id + '">' +
          '<input class="form-check-input" type="radio" name="selectStandaredRadio" value="' + item.id + '"' +
            (formState.standard === item.title ? ' data-was-checked="true"' : '') + '>' +
          '<span class="radio-icon radio-icon-lg"></span>' +
          '<p class="form-check-label">' + item.title + '</p>' +
        '</label>'
      );
    }).join(''));

    if (formState.standard) {
      $('#standardSelectList input[name="selectStandaredRadio"]').each(function () {
        if ($(this).closest('label').find('.form-check-label').text().trim() === formState.standard) {
          $(this).prop('checked', true).data('was-checked', true);
        }
      });
    }
  }

  function getTypeAndLevelIdsForField(fieldId) {
    var typeId  = '';
    var levelId = '';
    if (fieldId === 'toBeVerifiedByIp' || fieldId === 'toBeAuthorizedByIp') {
      // Add modal
      typeId  = String($('#qualifcationTypeList option:selected').attr('data-type-id') || '');
      levelId = String($('input[name="qualificationLevel"]:checked').attr('data-level-id') || '');
    } else {
      // Edit modal
      var $modal = $('#editQualificationModal');
      var $typeSelect = $modal.find('#editQualifcationTypeList');
      typeId  = String($typeSelect.attr('data-type-id') || $typeSelect.find('option:selected').attr('data-type-id') || '');
      var $updatedLevel = $modal.find('input[name="editQualificationLevelUpdated"]:checked');
      if ($updatedLevel.length) {
        levelId = String($updatedLevel.attr('data-level-id') || '');
      } else {
        // Fall back to the current (disabled) level radio's data-level-id
        levelId = String($modal.find('input[name="editQualificationLevel"]:checked').attr('data-level-id') || '');
      }
    }
    return { typeId: typeId, levelId: levelId };
  }

  function isVerifierField(fieldId) {
    return (fieldId || '').toLowerCase().indexOf('verified') !== -1;
  }

  function populateEmployeesList() {
    var fieldId    = $('#selectEmpModal').data('target-field') || '';
    var useVerifier = isVerifierField(fieldId);
    var items      = useVerifier ? (window.nemkoVerifierItems || []) : (window.nemkoAuthorizerItems || []);
    var $list      = $('#empSelectList');
    if (items.length === 0) {
      $list.html('<div class="text-center py-3 text-color-3 text-sm">No results found.</div>');
      return;
    }
    var currentIds  = fieldId ? ($('#' + fieldId).attr('data-emp-ids') || '') : '';
    if (!currentIds) {
      currentIds = fieldId === 'toBeVerifiedByIp'   ? formState.verifiedByIds :
                   fieldId === 'toBeAuthorizedByIp' ? formState.authorizedByIds : '';
    }
    var selectedIds = currentIds
      ? currentIds.split(',').map(function (id) { return id.trim(); }).filter(Boolean)
      : [];

    $list.html(items.map(function (item) {
      var isChecked = selectedIds.indexOf(String(item.id)) !== -1;
      return (
        '<label class="nemko-frm-chkbox d-flex align-items-center gap-2" data-item-id="' + item.id + '">' +
          '<input class="form-check-input" type="checkbox" name="checkboxDefault" value="' + item.id + '"' + (isChecked ? ' checked' : '') + '>' +
          '<span class="chkbox-icon' + (isChecked ? ' active' : '') + '"></span>' +
          '<p class="form-check-label">' + item.title + '</p>' +
        '</label>'
      );
    }).join(''));
  }

  $(document).on('click', '.select-standared-modal-btn', function () {
    saveFormState();
    _returningFromChild = true;
    var $current = $(this).closest('.modal');
    $('#standardSelectModal').data('prev-modal', $current);
    populateStandardsList();
    $current.one('hidden.bs.modal', function () { $('#standardSelectModal').modal('show'); });
    $current.modal('hide');
  });

  $(document).on('click', '#standardSelectList input[name="selectStandaredRadio"]', function () {
    if ($(this).data('was-checked')) {
      $(this).prop('checked', false).data('was-checked', false);
    } else {
      $('#standardSelectList input[name="selectStandaredRadio"]').data('was-checked', false);
      $(this).data('was-checked', true);
    }
  });

  $(document).on('click', '#standardSelectSaveBtn', function () {
    var $checked = $('#standardSelectList input[name="selectStandaredRadio"]:checked');
    if ($checked.length) {
      formState.standard   = $checked.closest('label').find('.form-check-label').text().trim();
      formState.standardId = String($checked.val() || '');
    } else {
      formState.standard   = '';
      formState.standardId = '';
    }
    window._editStandardName = formState.standard;
    window._editStandardId   = formState.standardId;
    $('#standardSelectModal').modal('hide');
  });

  $(document).on('click', '#standardSelectModal .nemko-btn-cancel', function () {
    $('#standardSelectModal').modal('hide');
  });

  $(document).on('hidden.bs.modal', '#standardSelectModal', function () {
    var $prev = $(this).data('prev-modal');
    if ($prev && $prev.length) { $prev.modal('show'); $(this).removeData('prev-modal'); }
  });

  var _standardSearchTimer = null;
  $(document).on('input', '#selectStandaredSearch', function () {
    var q = $(this).val();
    clearTimeout(_standardSearchTimer);
    $('#standardSelectList').html('<div class="text-center py-3 text-color-3 text-sm">Searching...</div>');
    _standardSearchTimer = setTimeout(function () {
      if (typeof window.nemkoFetchQualificationReferencesBySearch === 'function') {
        window.nemkoFetchQualificationReferencesBySearch(formState.qualificationType, q)
          .then(function () { populateStandardsList(); });
      }
    }, 300);
  });

  $(document).on('click', '.select-emp-modal-btn', function () {
    saveFormState();
    _returningFromChild = true;
    var $input  = $(this).siblings('input[type="text"]');
    var fieldId = $input.attr('id');
    $('#selectEmpModal').data('target-field', fieldId);
    var $current = $(this).closest('.modal');
    $('#selectEmpModal').data('prev-modal', $current);

    $('#empSelectList').html('<div class="text-center py-3 text-color-3 text-sm">Loading...</div>');
    var ids      = getTypeAndLevelIdsForField(fieldId);
    var fetchFn  = isVerifierField(fieldId) ? window.nemkoFetchVerifiers : window.nemkoFetchAuthorizers;
    if (typeof fetchFn === 'function') {
      fetchFn(ids.typeId, ids.levelId, '').then(function () { populateEmployeesList(); });
    }

    $current.one('hidden.bs.modal', function () { $('#selectEmpModal').modal('show'); });
    $current.modal('hide');
  });

  $(document).on('click', '#empSelectSaveBtn', function () {
    var selectedIds   = [];
    var selectedNames = [];
    $('#empSelectList input[name="checkboxDefault"]:checked').each(function () {
      selectedIds.push($(this).val());
      selectedNames.push($(this).closest('label').find('.form-check-label').text().trim());
    });
    var fieldId = $('#selectEmpModal').data('target-field');
    var idsStr  = selectedIds.join(',');
    var nameStr = selectedNames.join(', ');
    if (fieldId === 'toBeVerifiedByIp') {
      formState.verifiedBy    = nameStr;
      formState.verifiedByIds = idsStr;
    }
    if (fieldId === 'toBeAuthorizedByIp') {
      formState.authorizedBy    = nameStr;
      formState.authorizedByIds = idsStr;
    }
    $('#' + fieldId).val(nameStr).attr('data-emp-ids', idsStr);
    $('#selectEmpModal').modal('hide');
  });

  $(document).on('click', '#selectEmpModal .nemko-btn-cancel', function () {
    $('#selectEmpModal').modal('hide');
  });

  $(document).on('hidden.bs.modal', '#selectEmpModal', function () {
    $('#selectEmpSearch').val('');
    $('#empSelectList').html('');
    var $prev = $(this).data('prev-modal');
    if ($prev && $prev.length) {
      $prev.modal('show');
      $(this).removeData('prev-modal').removeData('target-input').removeData('target-field');
    }
  });

  var _empSearchTimer = null;
  $(document).on('input', '#selectEmpSearch', function () {
    var q = $(this).val();
    clearTimeout(_empSearchTimer);
    $('#empSelectList').html('<div class="text-center py-3 text-color-3 text-sm">Searching...</div>');
    _empSearchTimer = setTimeout(function () {
      var fieldId = $('#selectEmpModal').data('target-field') || '';
      var ids     = getTypeAndLevelIdsForField(fieldId);
      var fetchFn = isVerifierField(fieldId) ? window.nemkoFetchVerifiers : window.nemkoFetchAuthorizers;
      if (typeof fetchFn === 'function') {
        fetchFn(ids.typeId, ids.levelId, q).then(function () { populateEmployeesList(); });
      }
    }, 300);
  });

  $(document).on('click', '.frm-right-close-btn', function () {
    var $inp = $(this).siblings('input[type="text"]');
    $inp.val('');
    var id = $inp.attr('id');
    if (id === 'Standared') { formState.standard = ''; formState.standardId = ''; $inp.removeAttr('data-ref-id'); }
    if (id === 'toBeVerifiedByIp')   { formState.verifiedBy   = ''; formState.verifiedByIds   = ''; $inp.attr('data-emp-ids', ''); }
    if (id === 'toBeAuthorizedByIp') { formState.authorizedBy = ''; formState.authorizedByIds = ''; $inp.attr('data-emp-ids', ''); }
    if (id === 'editToBeVerifiedByIp' || id === 'editToBeAuthorizedByIp') { $inp.attr('data-emp-ids', ''); }
    if ($inp.hasClass('modal-search-input')) $inp.trigger('input');
  });

  $(document).on('click', '.modal-frm-search-top .frm-right-close-btn', function () {
    var $input = $(this).siblings('input');
    $input.val('').trigger('input');
  });

})(); // end initAddQualificationModal


// ─────────────────────────────────────────────────────────────────────────────
// ─── Edit Qualification Modal ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
(function initEditQualificationModal() {

  function normaliseLevelToRadioValue(raw) {
    if (!raw) return '';
    if (/^[0-9]_/.test(raw) || raw === 'employee') return raw.toLowerCase();
    var s = raw.toString().toLowerCase().trim();
    if (s === 'employee')    return 'employee';
    if (/^1/.test(s))        return '1_test_associate';
    if (/^2/.test(s))        return '2_project_handler';
    if (/^3/.test(s))        return '3_verifier';
    if (/^4/.test(s))        return '4_verifier_assessor';
    return s.replace(/[\s\-]+/g, '_');
  }

  function getSubsFromRow(row) {
    var subs = [];
    if ((row.report        || '').toString().toLowerCase() === 'yes') subs.push('report-approver');
    if ((row.conformity    || '').toString().toLowerCase() === 'yes') subs.push('conformity-conformity');
    if ((row.certification || '').toString().toLowerCase() === 'yes') subs.push('certification-decision');
    return subs;
  }

  function getRelevantSubsForTypeLevel(type, levelRadioVal) {
    var isStandard   = type === 'standard';
    var isTestMethod = type === 'testMethod';
    var isScheme     = type === 'scheme';

    if (isStandard || isTestMethod) {
      // All levels have report-approver and conformity-conformity applicable
      // (employee/L1 user-decided, L2/L3/L4 auto-Yes — show in readonly display regardless)
      if (levelRadioVal === 'employee'          || levelRadioVal === '1_test_associate' ||
          levelRadioVal === '2_project_handler' ||
          levelRadioVal === '3_verifier'        || levelRadioVal === '4_verifier_assessor') {
        return ['report-approver', 'conformity-conformity'];
      }
      return [];
    }
    if (isScheme) {
      if (levelRadioVal === '3_verifier' || levelRadioVal === '4_verifier_assessor') {
        return ['certification-decision'];
      }
      return [];
    }
    return [];
  }

  function renderCurrentLevelSubs(modal, type, levelRadioVal, tickedSubs) {
    var $container = $(modal).find('.edit-current-level-subs');
    if (!$container.length) return;
    var relevant = getRelevantSubsForTypeLevel(type, levelRadioVal);
    if (relevant.length === 0) { $container.hide().html(''); return; }

    var LABEL_MAP = {
      'report-approver':        'Report Approver',
      'conformity-conformity':  'Conformity Statement',
      'certification-decision': 'Certification Decision',
    };
    var html = relevant.map(function (val) {
      var isTicked = tickedSubs.indexOf(val) !== -1;
      return (
        '<label class="nemko-frm-chkbox d-flex align-items-center gap-2 opacity-75">' +
          '<input class="form-check-input" type="checkbox" value="' + val + '"' +
            ' name="currentLevelSub" disabled' + (isTicked ? ' checked' : '') + '>' +
          '<span class="chkbox-icon' + (isTicked ? ' active' : '') + '"></span>' +
          '<p class="form-check-label">' + LABEL_MAP[val] + '</p>' +
        '</label>'
      );
    }).join('');
    $container.html(html).show();
    // Force-apply checked state and active class — innerHTML alone may not
    // trigger custom checkbox styling that relies on JS-driven class toggling.
    $container.find('input[name="currentLevelSub"]').each(function () {
      var shouldBeChecked = tickedSubs.indexOf(this.value) !== -1;
      this.checked = shouldBeChecked;
      $(this).closest('label').find('.chkbox-icon').toggleClass('active', shouldBeChecked);
    });
  }

  function handleEditUpdatedCheckboxVisibility(modal) {
    var type          = $(modal).find('#editQualifcationTypeList').attr('data-type-key') || 'standard';
    var selectedLevel = $(modal).find('input[name="editQualificationLevelUpdated"]:checked').val() || '';
    var $container    = $(modal).find('.edit-updated-level-subs');
    if (!$container.length) return;
    var isStandard   = type === 'standard';
    var isTestMethod = type === 'testMethod';
    var isScheme     = type === 'scheme';

    // Reset visibility (checked state already cleared by the level-change listener)
    $container.find('[name="editQualificationLevelSub"]').closest('label').removeClass('d-flex').addClass('d-none');

    if (!selectedLevel) { $container.hide(); return; }

    if (isStandard || isTestMethod) {
      if (selectedLevel === 'employee' || selectedLevel === '1_test_associate') {
        // Report Approver: show | Conformity: conditional on Report Approver
        $container.show();
        $container.find('[name="editQualificationLevelSub"][value="report-approver"]')
          .closest('label').removeClass('d-none').addClass('d-flex');
        var reportChecked = $container.find('[name="editQualificationLevelSub"][value="report-approver"]').prop('checked');
        if (reportChecked) {
          $container.find('[name="editQualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
        } else {
          $container.find('[name="editQualificationLevelSub"][value="conformity-conformity"]')
            .closest('label').removeClass('d-none').addClass('d-flex');
        }
      } else if (selectedLevel === '2_project_handler') {
        // Report Approver: show | Conformity: always Yes (auto, hidden)
        $container.show();
        $container.find('[name="editQualificationLevelSub"][value="report-approver"]')
          .closest('label').removeClass('d-none').addClass('d-flex');
        $container.find('[name="editQualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
      } else if (selectedLevel === '3_verifier' || selectedLevel === '4_verifier_assessor') {
        // Report Approver & Conformity: always Yes (auto, hidden — container stays hidden)
        $container.find('[name="editQualificationLevelSub"][value="report-approver"]').prop('checked', true);
        $container.find('[name="editQualificationLevelSub"][value="conformity-conformity"]').prop('checked', true);
      }
      // Certification Decision: always No, hidden
      return;
    }

    if (isScheme) {
      // Report Approver & Conformity: always No, hidden
      if (selectedLevel === '3_verifier' || selectedLevel === '4_verifier_assessor') {
        $container.show();
        $container.find('[name="editQualificationLevelSub"][value="certification-decision"]')
          .closest('label').removeClass('d-none').addClass('d-flex');
      }
      // Employee / Level 1 / Level 2: Certification Decision always No
    }
  }

function populateEditModal(modal, item, tabId) {
    console.log("edit items:", item)
    modal._editItemId = item.id;
   
    modal.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });

    var typeSelect    = modal.querySelector('#editQualifcationTypeList');
    var standardIp    = modal.querySelector('#editStandared');
    var remarksEl     = modal.querySelector('#editRemarksTxtarea');
    var limitationsEl = modal.querySelector('#editLimitationsTxtarea');
    var targetDateEl  = modal.querySelector('#editTargetAchieveDate');
    var qualifiedEl   = modal.querySelector('#editQualifiedDate');
    var verifiedEl    = modal.querySelector('#editToBeVerifiedByIp');
    var authorizedEl  = modal.querySelector('#editToBeAuthorizedByIp');

    if (typeSelect) {
        typeSelect.value = item.qualificationType || '';
        typeSelect.setAttribute('data-type-key', item.qualificationType || '');
        typeSelect.setAttribute('data-type-id',  String(item.qualificationTypeIdNum || ''));
    }
    $(modal).find('.quaification-type-standard').show();
   
    populateLevelRadiosInto('editQualificationLevelCurrentRadios', 'editQualificationLevel');
    var currentLevelContainer = modal.querySelector('#editQualificationLevelCurrentRadios');
    if (currentLevelContainer) {
      currentLevelContainer.querySelectorAll('input[type="radio"]').forEach(function (r) { r.disabled = true; });
    }
    populateTypeSelectEl('editQualifcationTypeList')
    populateLevelRadiosInto('editQualificationLevelUpdatedRadios', 'editQualificationLevelUpdated');

    if (standardIp) {
      standardIp.value = item.qualifications || '';  
    }
    if (remarksEl)     remarksEl.value     = item.remarks           || '';
    if (limitationsEl) {
      limitationsEl.value = item.limitations || '';
      limitationsEl.disabled = (tabId !== 'authorized-table');
    }
    if (targetDateEl)  targetDateEl.value  = item.targetDate        || '';
    if (qualifiedEl)   qualifiedEl.value   = item.qualifiedDate     || '';
    if (verifiedEl) {
      verifiedEl.value = item.verifiedBy || '';
      verifiedEl.setAttribute('data-emp-ids', item.verifierIds || '');
    }
    if (authorizedEl) {
      authorizedEl.value = item.authorizedBy || '';
      authorizedEl.setAttribute('data-emp-ids', item.authorizerIds || '');
    }

    var currentLevelVal = normaliseLevelToRadioValue(item.level);
    modal.querySelectorAll('input[name="editQualificationLevel"]').forEach(function (r) {
      r.checked = (r.value === currentLevelVal);
    });

    var currentType = typeSelect ? (typeSelect.getAttribute('data-type-key') || 'standard') : 'standard';
    var tickedSubs  = getSubsFromRow(item);
    renderCurrentLevelSubs(modal, currentType, currentLevelVal, tickedSubs);

    modal.querySelectorAll('input[name="editQualificationLevelUpdated"]').forEach(function (r) {
      r.checked = false;
    });
    var $modal                = $(modal);
    var $updatedSubContainer  = $modal.find('.edit-updated-level-subs');
    if ($updatedSubContainer.length) {
      $updatedSubContainer.hide();
      $updatedSubContainer.find('[name="editQualificationLevelSub"]').closest('label')
        .removeClass('d-flex').addClass('d-none');
    }

    var $qualifiedRow = $(modal).find('#editQualifiedDate').closest('.col-12');
    if (tabId === 'requested-table') { $qualifiedRow.hide(); } else { $qualifiedRow.show(); }

    modal._editTabId = tabId;
    var withdrawBtn = modal.querySelector('.nemko-btn-withdraw');
    if (withdrawBtn) {
      var isWithdrawn   = item.withdrawn === true;
      var showWithdraw  = (tabId === 'authorized-table') && !isWithdrawn;
      withdrawBtn.style.display = showWithdraw ? '' : 'none';
    }
    var deleteBtn = modal.querySelector('.nemko-btn-delete');
    if (deleteBtn) {
      deleteBtn.style.display = (tabId === 'requested-table') ? '' : 'none';
    }

    initEditDatepickers(modal);
  }

  function initEditDatepickers(modal) {
    if (typeof $.fn.datepicker === 'undefined') {
      var retries = 0;
      var iv = setInterval(function () {
        retries++;
        if (typeof $.fn.datepicker !== 'undefined') { clearInterval(iv); bindEditDatepickers(modal); }
        else if (retries >= 10) { clearInterval(iv); }
      }, 200);
      return;
    }
    bindEditDatepickers(modal);
  }

  function bindEditDatepickers(modal) {
    var dpOpts = {
      dateFormat: 'dd-mm-yy',
      beforeShow: function (input, inst) { $(inst.dpDiv).addClass('nemko-input-datepicker'); },
    };
    var dpOptsTargetDate = $.extend({}, dpOpts, { minDate: 0 });
    var $target    = $(modal).find('#editTargetAchieveDate');
    var $qualified = $(modal).find('#editQualifiedDate');
    if ($target.hasClass('hasDatepicker'))    $target.datepicker('destroy');
    if ($qualified.hasClass('hasDatepicker')) $qualified.datepicker('destroy');
    $target.datepicker(dpOptsTargetDate);
    $qualified.datepicker(dpOpts);
  }

  $(document).on('change', '#editQualifcationTypeList', function () {
    var modal        = $(this).closest('#editQualificationModal')[0];
    if (!modal) return;
    var type         = $(this).val();
    var currentLevel = $(modal).find('input[name="editQualificationLevel"]:checked').val() || '';
    var tickedSubs   = [];
    $(modal).find('.edit-current-level-subs input[name="currentLevelSub"]').each(function () {
      if (this.checked) tickedSubs.push(this.value);
    });
    $(modal).find('[name="editQualificationLevelSub"]').prop('checked', false);
    renderCurrentLevelSubs(modal, type, currentLevel, tickedSubs);
    handleEditUpdatedCheckboxVisibility(modal);
  });

  $(document).on('change', 'input[name="editQualificationLevelUpdated"]', function () {
    var modal = $(this).closest('#editQualificationModal')[0];
    if (!modal) return;
    $(modal).find('[name="editQualificationLevelSub"]').prop('checked', false);
    // Clear verifier and authorizer fields since level changed
    var $verifiedEl   = $(modal).find('#editToBeVerifiedByIp');
    var $authorizedEl = $(modal).find('#editToBeAuthorizedByIp');
    $verifiedEl.val('').attr('data-emp-ids', '');
    $authorizedEl.val('').attr('data-emp-ids', '');
    handleEditUpdatedCheckboxVisibility(modal);
  });

  // When Report Approver toggled in updated-level section for employee/Level 1, update Conformity
  $(document).on('change', '#editQualificationModal [name="editQualificationLevelSub"][value="report-approver"]', function () {
    var modal = $(this).closest('#editQualificationModal')[0];
    if (!modal) return;
    var type = $(modal).find('#editQualifcationTypeList').attr('data-type-key') || 'standard';
    var selectedLevel = $(modal).find('input[name="editQualificationLevelUpdated"]:checked').val() || '';
    if ((type === 'standard' || type === 'testMethod') &&
        (selectedLevel === 'employee' || selectedLevel === '1_test_associate')) {
      var $container = $(modal).find('.edit-updated-level-subs');
      var $conformity = $container.find('[name="editQualificationLevelSub"][value="conformity-conformity"]');
      if (this.checked) {
        $conformity.prop('checked', true).closest('label').removeClass('d-flex').addClass('d-none');
      } else {
        $conformity.prop('checked', false).closest('label').removeClass('d-none').addClass('d-flex');
      }
    }
  });

  $(document).on('show.bs.modal', '#editQualificationModal', function () {
    if (window._returningFromChildEdit) {
      window._returningFromChildEdit = false;
      var modal = this;
      $(modal).find('#editStandared')
        .val(window._editStandardName || '')
        .attr('data-ref-id', window._editStandardId || '');
    }
  });

  $(document).on('click', '#editQualificationModal .nemko-btn-withdraw', function () {
    var modal = $(this).closest('#editQualificationModal')[0];
    if (!modal) return;
    var rowId = modal._editItemId;
    if (!rowId) { console.warn('[NEMKO] Withdraw: no rowId'); return; }
    if (typeof window.nemkoWithdrawQualification !== 'function') {
      console.error('[NEMKO] window.nemkoWithdrawQualification is not defined');
      return;
    }
    window.nemkoWithdrawQualification(rowId);
    if (typeof window.nemkoCloseModal === 'function') {
      window.nemkoCloseModal('editQualificationModal');
    } else {
      $(modal).modal('hide');
    }
  });

  window.nemkoOpenEditQualification = function (item, tabId) {
    var modal = (typeof window.nemkoGetModalElement === 'function')
      ? window.nemkoGetModalElement('editQualificationModal')
      : document.querySelector('#editQualificationModal');
    if (!modal) { console.error('[NEMKO] editQualificationModal not found'); return; }
    populateEditModal(modal, item, tabId);
    if (typeof window.nemkoOpenModal === 'function') {
      window.nemkoOpenModal('editQualificationModal');
    } else {
      $(modal).modal('show');
    }
  };

})(); // end initEditQualificationModal


// ─────────────────────────────────────────────────────────────────────────────
// ─── Details Qualification Modal ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
(function initDetailsQualificationModal() {

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var d = dateStr.split('T')[0].split('-');
    return d.length === 3 ? d[2] + '-' + d[1] + '-' + d[0] : dateStr;
  }

  function boolYesNo(val) {
    return (val === true ||
            String(val).toLowerCase() === 'true' ||
            String(val).toLowerCase() === 'yes') ? 'Yes' : 'No';
  }

  function setText(modal, id, val) {
    var el = modal.querySelector('#' + id);
    if (el) el.textContent = (val != null && val !== '') ? val : '-';
  }

  function setVal(modal, id, val) {
    var el = modal.querySelector('#' + id);
    if (el) el.value = val || '';
  }

  function setRadio(modal, name, isYes) {
    var yes = modal.querySelector('input[name="' + name + '"][value="yes"]');
    var no  = modal.querySelector('input[name="' + name + '"][value="no"]');
    if (yes) yes.checked = !!isYes;
    if (no)  no.checked  = !isYes;
  }

  function showState(modal, state) {
    modal.querySelector('#detailsModalLoading').style.display = (state === 'loading') ? 'block' : 'none';
    modal.querySelector('#detailsModalError').style.display   = (state === 'error')   ? 'block' : 'none';
    modal.querySelector('#detailsModalContent').style.display = (state === 'content') ? 'block' : 'none';
  }

  function populate(modal, data) {
    setVal(modal,  'detailsRequestedBy',       data.requestedBy      || '');
    setVal(modal,  'detailsReqEmail',          data.requestedByEmail || '');
    setVal(modal,  'localUnit',                data.localUnit        || '');
    setVal(modal,  'detailsQualificationId',   data.qualificationId  || '');
    setVal(modal,  'detailsQualificationRef',  (data.qualificationReference && data.qualificationReference.value) || '');
    setVal(modal,  'detailsQualificationLevel',(data.level && data.level.value) || '');
    setVal(modal,  'qualificationStatus',      (data.qualificationStatus && data.qualificationStatus.value) || '');
    setVal(modal,  'detailsReportApprover',    data.reportApprover    || '');
    setVal(modal,  'detailsConformityStatement', data.conformityStatement || '');
    setText(modal, 'detailsActiveQualification', (data.activeStatus && data.activeStatus.value) || '-');
    setText(modal, 'detailsRemarks',             data.remarks || '');
    setVal(modal,  'detailsLimitationsTxtarea',  data.limitations || '');
    setText(modal, 'detailsQualifiedDateReadonly', formatDate(data.authorizedDate));
    setVal(modal,  'detailsVerifiedBy',   (data.verifiedBy   && data.verifiedBy.name)   || '');
    setVal(modal,  'detailsAuthorizedBy', (data.authorizedBy && data.authorizedBy.name) || '');
  }

  function fetchDetails(modal, qualificationId) {
    showState(modal, 'loading');
    if (typeof window.nemkoFetchQualificationDetails !== 'function') {
      console.error('[NEMKO] nemkoFetchQualificationDetails is not defined');
      showState(modal, 'error');
      return;
    }
    window.nemkoFetchQualificationDetails(String(qualificationId))
      .then(function () {
        var data = window.nemkoQualificationDetail;
        if (data) { populate(modal, data); showState(modal, 'content'); }
        else       { showState(modal, 'error'); }
      })
      .catch(function (err) {
        console.error('[NEMKO] fetchDetails error:', err);
        showState(modal, 'error');
      });
  }

  window.nemkoOpenDetailsQualification = function (item, tabId) {
    var modal = (typeof window.nemkoGetModalElement === 'function')
      ? window.nemkoGetModalElement('detailsQualificationModal')
      : document.querySelector('#detailsQualificationModal');
    if (!modal) { console.error('[NEMKO] detailsQualificationModal not found'); return; }
    if (typeof window.nemkoOpenModal === 'function') {
      window.nemkoOpenModal('detailsQualificationModal');
    } else {
      $(modal).modal('show');
    }
    fetchDetails(modal, item.id);
  };

})(); // end initDetailsQualificationModal

})(); // end IIFE
