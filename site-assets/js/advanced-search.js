(function () {
  'use strict';

  console.log('[NEMKO JS] advanced-search.js EXECUTING');

  // ─── Config ───────────────────────────────────────────────────────────────────
  var SORT_CYCLE = ['asc', 'desc', 'default'];

  var tables = {

    // ── Advanced Search tab ──────────────────────────────────────────────────────
    'advanced-search-table': {
      tableSelector: '.my-qualifcation-table .table',
      dropdownId: 'authorized-col-visibility',
      viewDetailsModal: 'detailsQualificationModal',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'employee', label: 'Employee', sortable: true, visible: true, dropdown: true, sortKey: 'employee' },
        { key: 'office', label: 'Office', sortable: true, visible: true, dropdown: true, sortKey: 'office' },
        { key: 'type', label: 'Type', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationtypeid' },
        { key: 'qualifications', label: 'Qualifications', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationreference' },
        { key: 'level', label: 'Level', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationlevel' },
        { key: 'verifiedBy', label: 'Verified by', sortable: true, visible: false, dropdown: true, sortKey: 'verifier' },
        { key: 'authorizedBy', label: 'Authorized by', sortable: true, visible: true, dropdown: true, sortKey: 'authorizer' },
        { key: 'report', label: 'Report <br/> Approver', sortable: true, visible: true, dropdown: true, sortKey: 'reportapprover' },
        { key: 'certification', label: 'Certification <br/> Decision', sortable: true, visible: true, dropdown: true, sortKey: 'certificationdecision' },
        { key: 'limitations', label: 'Limitations', sortable: true, visible: true, dropdown: true, sortKey: 'limitations' },
        { key: 'remarks', label: 'Remarks', sortable: true, visible: false, dropdown: true, sortKey: 'remarks' },
        { key: 'conformity', label: 'Conformity <br/> Statement', sortable: true, visible: false, dropdown: true, sortKey: 'conformitystatement' },
        { key: 'withdrawnDate', label: 'Withdrawn Date', sortable: true, visible: false, dropdown: true, sortKey: 'withdrawndate' },
      ],
      rows: [],
    },

    // ── Standard ─────────────────────────────────────────────────────────────────
    'standared-table': {
      tableSelector: '#standared-table .nemko-table-container .table',
      dropdownId: 'standared-col-visibility',
      editModalTarget: '#editStandaredModal',
      editRowsKey: 'nemkoDbStandardRows',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'title', label: 'Title', sortable: true, visible: true, dropdown: true, sortKey: 'title' },
        { key: 'productCategory', label: 'Category', sortable: true, visible: true, dropdown: true, sortKey: 'productcategory' },
      ],
      rows: [],
    },

    // ── Schemes ───────────────────────────────────────────────────────────────────
    'schemes-table': {
      tableSelector: '#schemes-table .nemko-table-container .table',
      dropdownId: 'schemes-col-visibility',
      editModalTarget: '#editSchemeModal',
      editRowsKey: 'nemkoDbSchemeRows',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'name', label: 'Name', sortable: true, visible: true, dropdown: true, sortKey: 'name' },
        { key: 'refStandared', label: 'Reference Standard', sortable: true, visible: true, dropdown: true, sortKey: 'referencestandard' },
      ],
      rows: [],
    },

    // ── Test Method ───────────────────────────────────────────────────────────────
    'test-method-table': {
      tableSelector: '#test-method-table .nemko-table-container .table',
      dropdownId: 'test-method-col-visibility',
      editModalTarget: '#editTestmethodModal',
      editRowsKey: 'nemkoDbTestMethodRows',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'name', label: 'Name', sortable: true, visible: true, dropdown: true, sortKey: 'name' },
        { key: 'pdctCategory', label: 'Product Category', sortable: true, visible: true, dropdown: true, sortKey: 'productcategory' },
        { key: 'refStandared', label: 'Reference Standard', sortable: true, visible: true, dropdown: true, sortKey: 'referencestandard' },
      ],
      rows: [],
    },

    // ── Employees ─────────────────────────────────────────────────────────────────
    'employees-table': {
      tableSelector: '#employees-table .nemko-table-container .table',
      dropdownId: 'employees-col-visibility',
      viewDetailsModal: 'empDetailsModal',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'name', label: 'Name', sortable: true, visible: true, dropdown: true, sortKey: 'name' },
        { key: 'job_title', label: 'Job Title', sortable: true, visible: true, dropdown: true, sortKey: 'jobtitle' },
        { key: 'subsidiary', label: 'Subsidiary', sortable: true, visible: true, dropdown: true, sortKey: 'subsidiary' },
        { key: 'manager', label: 'Manager', sortable: true, visible: true, dropdown: true, sortKey: 'manager' },
        { key: 'personal_status', label: 'Personal Status', sortable: true, visible: true, dropdown: true, sortKey: 'personalstatus' },
      ],
      rows: [],
    },

    // ── Employee Details (modal sub-table) ────────────────────────────────────────
    'emp-details-table': {
      tableSelector: '.emp-details-table .table',
      dropdownId: 'emp-details-col-visibility',
      sortState: { key: null, direction: 'default' },
      paginationMeta: null,
      columns: [
        { key: 'qualifications', label: 'Qualifications', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationreference' },
        { key: 'type', label: 'Type', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationtypeid' },
        { key: 'level', label: 'Level', sortable: true, visible: true, dropdown: true, sortKey: 'qualificationlevel' },
        { key: 'qual_date', label: 'Qualified Date', sortable: true, visible: true, dropdown: true, sortKey: 'qualifieddate' },
        { key: 'withdrawn_date', label: 'Withdrawn Date', sortable: true, visible: true, dropdown: true, sortKey: 'withdrawndate' },
        { key: 'qual_by', label: 'Qualified By', sortable: true, visible: true, dropdown: true, sortKey: 'authorizer' },
      ],
      rows: [],
    },

  };

  // ─── Category Helpers ─────────────────────────────────────────────────────────
  function getProductCategories() {
    return window.nemkoProductCategories || [];
  }

  function getCategoryName(id) {
    var cats = getProductCategories();
    var found = cats.find(function (c) { return c.id === String(id); });
    return found ? found.name : (id || '');
  }

  function populateCategorySelect(selectEl, selectedId) {
    if (!selectEl) return;
    var cats = getProductCategories();
    selectEl.innerHTML = '<option value="">Select a category</option>';
    cats.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (String(cat.id) === String(selectedId)) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  // ─── DB-tab → table-id mapping ───────────────────────────────────────────────
  var DB_TAB_TABLE_MAP = {
    'db-tab-standared': 'standared-table',
    'db-tab-schemes': 'schemes-table',
    'db-tab-test-method': 'test-method-table',
    'db-tab-employees': 'employees-table',
  };

  // ─── API filter state per table ───────────────────────────────────────────────
  var qualificationApiFilter = {
    search: '',
    sortBy: null,
    sortOrder: null,
    status: null,
    conformityStatement: null,
    certificationDecision: null,
    qualificationLevel: null,
    reportApprover: null,
    standard: [],
    scheme: [],
    testMethod: [],
    employee: [],
    office: [],
    columnTextSearches: []
  };

  var standardApiFilter = { search: '', sortBy: null, sortOrder: null };
  var schemeApiFilter = { search: '', sortBy: null, sortOrder: null };
  var testMethodApiFilter = { search: '', sortBy: null, sortOrder: null, categoryFilter: '' };
  var officeApiFilter = { search: '', sortBy: null, sortOrder: null };
  var employeeApiFilter = { search: '', sortBy: null, sortOrder: null };
  var empDetailsApiFilter = { search: '', sortBy: null, sortOrder: null, employeeId: null };

  // ─── Apply filter functions (call API, update rows/pagination, render) ─────────
  function applyQualificationFilters(page) {
    var fetchFn = window.nemkoFetchQualificationsPage;
    if (typeof fetchFn !== 'function') return;
    fetchFn(page || 1, qualificationApiFilter).then(function () {
      tables['advanced-search-table'].rows = window.nemkoTableRows || [];
      tables['advanced-search-table'].paginationMeta = window.nemkoTablePagination || null;
      renderTable('advanced-search-table');
    });
  }

  function applyStandardFilters(page) {
    var fetchFn = window.nemkoFetchStandardsPage;
    if (typeof fetchFn !== 'function') return;
    fetchFn(page || 1, standardApiFilter.sortBy, standardApiFilter.sortOrder, standardApiFilter.search).then(function () {
      tables['standared-table'].rows = window.nemkoDbStandardRows || [];
      tables['standared-table'].paginationMeta = window.nemkoDbStandardPagination || null;
      renderTable('standared-table');
    });
  }

  function applySchemeFilters(page) {
    var fetchFn = window.nemkoFetchSchemesPage;
    if (typeof fetchFn !== 'function') return;
    fetchFn(page || 1, schemeApiFilter.sortBy, schemeApiFilter.sortOrder, schemeApiFilter.search).then(function () {
      tables['schemes-table'].rows = window.nemkoDbSchemeRows || [];
      tables['schemes-table'].paginationMeta = window.nemkoDbSchemePagination || null;
      renderTable('schemes-table');
    });
  }

  function applyTestMethodFilters(page) {
    var fetchFn = window.nemkoFetchTestMethodsPage;
    if (typeof fetchFn !== 'function') return;
    fetchFn(page || 1, testMethodApiFilter.sortBy, testMethodApiFilter.sortOrder, testMethodApiFilter.search, testMethodApiFilter.categoryFilter).then(function () {
      tables['test-method-table'].rows = window.nemkoDbTestMethodRows || [];
      tables['test-method-table'].paginationMeta = window.nemkoDbTestMethodPagination || null;
      renderTable('test-method-table');
      populateTestMethodCategories();
    });
  }

  function applyEmployeeFilters(page) {
    var fetchFn = window.nemkoFetchEmployeesPage;
    if (typeof fetchFn !== 'function') return;
    fetchFn(page || 1, employeeApiFilter.sortBy, employeeApiFilter.sortOrder, employeeApiFilter.search).then(function () {
      tables['employees-table'].rows = window.nemkoDbEmployeeRows || [];
      tables['employees-table'].paginationMeta = window.nemkoDbEmployeePagination || null;
      renderTable('employees-table');
    });
  }

  function applyEmpDetailsFilters(page) {
    var fetchFn = window.nemkoFetchEmployeeDetails;
    console.log('[NEMKO] applyEmpDetailsFilters called, employeeId:', empDetailsApiFilter.employeeId, 'fetchFn:', typeof fetchFn);
    if (typeof fetchFn !== 'function') return;
    fetchFn(empDetailsApiFilter.employeeId, page || 1, empDetailsApiFilter.sortBy, empDetailsApiFilter.sortOrder, empDetailsApiFilter.search).then(function () {
      var rows = window.nemkoEmployeeDetailQualifications || [];
      console.log('[NEMKO] emp-details rows received:', rows.length, rows);
      tables['emp-details-table'].rows = rows;
      tables['emp-details-table'].paginationMeta = window.nemkoEmployeeDetailPagination || null;
      var container = document.getElementById('emp-details-table');
      console.log('[NEMKO] emp-details container:', container);
      if (container) {
        var tbl = container.querySelector('.emp-details-table .table');
        console.log('[NEMKO] emp-details table el:', tbl);
      }
      renderTable('emp-details-table');
    });
  }

  var TABLE_APPLY_MAP = {
    'advanced-search-table': applyQualificationFilters,
    'standared-table': applyStandardFilters,
    'schemes-table': applySchemeFilters,
    'test-method-table': applyTestMethodFilters,
    'employees-table': applyEmployeeFilters,
    'emp-details-table': applyEmpDetailsFilters,
  };

  // ─── Rows (API already handles sort/filter — return as-is) ───────────────────
  function getSortedRows(config) {
    return config.rows.slice();
  }

  // ─── Sort (server-side) ───────────────────────────────────────────────────────
  function cycleSort(tabId, key) {
    var config = tables[tabId];
    if (!config) return;
    var sortState = config.sortState;

    if (sortState.key !== key) {
      sortState.key = key;
      sortState.direction = 'asc';
    } else {
      var idx = SORT_CYCLE.indexOf(sortState.direction);
      sortState.direction = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
      if (sortState.direction === 'default') sortState.key = null;
    }

    var col = config.columns.find(function (c) { return c.key === key; });
    var apiKey = (col && col.sortKey) ? col.sortKey : key;
    var sortBy = sortState.direction !== 'default' ? apiKey : null;
    var sortOrder = sortState.direction !== 'default' ? sortState.direction : null;

    if (tabId === 'advanced-search-table') {
      qualificationApiFilter.sortBy = sortBy;
      qualificationApiFilter.sortOrder = sortOrder;
      applyQualificationFilters(1);
      return;
    }
    if (tabId === 'standared-table') {
      standardApiFilter.sortBy = sortBy;
      standardApiFilter.sortOrder = sortOrder;
      applyStandardFilters(1);
      return;
    }
    if (tabId === 'schemes-table') {
      schemeApiFilter.sortBy = sortBy;
      schemeApiFilter.sortOrder = sortOrder;
      applySchemeFilters(1);
      return;
    }
    if (tabId === 'test-method-table') {
      testMethodApiFilter.sortBy = sortBy;
      testMethodApiFilter.sortOrder = sortOrder;
      applyTestMethodFilters(1);
      return;
    }
    if (tabId === 'employees-table') {
      employeeApiFilter.sortBy = sortBy;
      employeeApiFilter.sortOrder = sortOrder;
      applyEmployeeFilters(1);
      return;
    }
    if (tabId === 'emp-details-table') {
      empDetailsApiFilter.sortBy = sortBy;
      empDetailsApiFilter.sortOrder = sortOrder;
      applyEmpDetailsFilters(1);
      return;
    }
    renderTable(tabId);
  }

  // ─── Sort SVG helpers ─────────────────────────────────────────────────────────
  function getSortSVG(sortState, key) {
    var isActive = (sortState.key === key);
    var dir = isActive ? sortState.direction : 'default';
    var primary = 'var(--color-primary, #006e8c)';
    var muted = '#C0C0C0';
    var upFill = (isActive && dir === 'asc') ? primary : muted;
    var downFill = (isActive && dir === 'desc') ? primary : muted;

    return (
      '<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5 1L1 5H9L5 1Z"  fill="' + upFill + '" />' +
      '<path d="M5 13L1 9H9L5 13Z" fill="' + downFill + '" />' +
      '</svg>'
    );
  }

  function getSortTitle(sortState, key) {
    if (sortState.key !== key || sortState.direction === 'default') return 'Click to sort ascending';
    if (sortState.direction === 'asc') return 'Click to sort descending';
    return 'Click to clear sort';
  }

  // ─── Render Pagination (server-side, reads paginationMeta) ────────────────────
  function renderPagination(tabId) {
    var config = tables[tabId];
    var container = getContainer(tabId);
    if (!container) return;
    var pagination = container.querySelector('.nemko-pagination');
    if (!pagination) return;

    var meta = config.paginationMeta || {};
    var pageNumber = meta.pageNumber || 1;
    var lastPage = meta.lastPageNumber || 1;
    var totalCount = meta.totalCount || 0;
    var pageSize = meta.pageSize || 0;
    var hasBack = !!meta.hasBack;
    var hasMore = !!meta.hasMore;

    var startNum = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    var endNum = pageSize > 0 ? Math.min(pageNumber * pageSize, totalCount) : totalCount;

    pagination.innerHTML =
      '<li class="page-item ' + (!hasBack ? 'disabled' : 'cursor-pointer') + '" data-page="first">' +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898"/><rect width="1.815" height="8.1675" fill="#989898"/></svg>' +
      '</li>' +
      '<li class="page-item ' + (!hasBack ? 'disabled' : 'cursor-pointer') + '" data-page="prev">' +
      '<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898"/><path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898"/></svg>' +
      '</li>' +
      '<li class="page-item">' +
      '<span class="font-medium font-inter text-black text-xs">' + startNum + ' to ' + endNum + ' of ' + totalCount + '</span>' +
      '</li>' +
      '<li class="page-item ' + (!hasMore ? 'disabled' : 'cursor-pointer') + '" data-page="next">' +
      '<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898"/><path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898"/></svg>' +
      '</li>' +
      '<li class="page-item ' + (!hasMore ? 'disabled' : 'cursor-pointer') + '" data-page="last">' +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898"/><rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898"/></svg>' +
      '</li>';

    var applyFn = TABLE_APPLY_MAP[tabId];

    pagination.querySelectorAll('.page-item:not(.disabled)').forEach(function (item) {
      item.addEventListener('click', function () {
        var action = item.dataset.page;
        var newPage = pageNumber;
        if (action === 'first') newPage = 1;
        if (action === 'prev') newPage = Math.max(1, pageNumber - 1);
        if (action === 'next') newPage = Math.min(lastPage, pageNumber + 1);
        if (action === 'last') newPage = lastPage;
        if (newPage === pageNumber) return;
        if (typeof applyFn === 'function') applyFn(newPage);
      });
    });
  }

  // ─── Container Resolver ───────────────────────────────────────────────────────
  function getContainer(tabId) {
    return document.getElementById(tabId);
  }

  // ─── Details Modal Population ─────────────────────────────────────────────────
  function populateQualificationDetailsModal(detail) {
    var loadingEl = document.getElementById('detailsModalLoading');
    var contentEl = document.getElementById('detailsModalContent');
    var errorEl = document.getElementById('detailsModalError');

    if (!detail) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.style.display = '';
      return;
    }

    // Input fields
    var reqByEl = document.getElementById('detailsRequestedBy');
    var reqEmailEl = document.getElementById('detailsReqEmail');
    var localUnitEl = document.getElementById('localUnit');
    var qIdEl = document.getElementById('detailsQualificationId');
    var qRefEl = document.getElementById('detailsQualificationRef');
    var qLevelEl = document.getElementById('detailsQualificationLevel');
    var statusEl = document.getElementById('qualificationStatus');
    var raEl = document.getElementById('detailsReportApprover');
    var csEl = document.getElementById('detailsConformityStatement');
    var verByEl = document.getElementById('detailsVerifiedBy');
    var authByEl = document.getElementById('detailsAuthorizedBy');

    if (reqByEl) reqByEl.value = detail.requestedBy || '';
    if (reqEmailEl) reqEmailEl.value = detail.requestedByEmail || '';
    if (localUnitEl) localUnitEl.value = detail.localUnit || '';
    if (qIdEl) qIdEl.value = detail.qualificationId || '';
    if (qRefEl) qRefEl.value = (detail.qualificationReference && detail.qualificationReference.value) || '';
    if (qLevelEl) qLevelEl.value = (detail.level && detail.level.value) || '';
    if (statusEl) statusEl.value = (detail.qualificationStatus && detail.qualificationStatus.value) || '';
    if (raEl) raEl.value = detail.reportApprover || '';
    if (csEl) csEl.value = detail.conformityStatement || '';
    if (verByEl) verByEl.value = (detail.verifiedBy && detail.verifiedBy.name) || '';
    if (authByEl) authByEl.value = (detail.authorizedBy && detail.authorizedBy.name) || '';

    // Paragraph / readonly fields
    var activeEl = document.getElementById('detailsActiveQualification');
    var remEl = document.getElementById('detailsRemarks');
    var dateEl = document.getElementById('detailsQualifiedDateReadonly');

    if (activeEl) activeEl.textContent = (detail.activeStatus && detail.activeStatus.value) || '-';
    if (remEl) remEl.textContent = detail.remarks || '-';
    if (dateEl) dateEl.textContent = detail.authorizedDate || '-';

    // Textarea
    var limTEl = document.getElementById('detailsLimitationsTxtarea');
    if (limTEl) limTEl.value = detail.limitations || '';

    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = '';
    if (errorEl) errorEl.style.display = 'none';
  }

  // ─── Render Table ─────────────────────────────────────────────────────────────
  function renderTable(tabId) {
    var config = tables[tabId];
    if (!config) return;
    var container = getContainer(tabId);
    if (!container) return;

    var table = container.querySelector(config.tableSelector) ||
      container.querySelector('.nemko-table-container .table');
    if (!table) return;

    var visCols = config.columns.filter(function (c) { return c.visible; });
    var pagedRows = getSortedRows(config);

    // thead
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
        ' data-col-key="' + col.key + '"' +
        ' style="cursor:pointer;"' +
        ' title="' + getSortTitle(config.sortState, col.key) + '">' +
        '<div class="w-100 d-flex justify-content-between align-items-center gap-1" style="flex-wrap:nowrap;pointer-events:none;">' +
        '<p class="text-color-3 font-medium text-sm lg-text-base" style="margin:0;min-width:0;">' + col.label + '</p>' +
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

    // tbody
    var tbody = table.querySelector('tbody');

    if (pagedRows.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="' + visCols.length + '" ' +
        'class="text-center py-4 text-color-3 text-sm font-medium">' +
        'No records found.</td></tr>';
      renderPagination(tabId);
      return;
    }

    var viewDetails = config.viewDetailsModal || null;
    var editTarget = config.editModalTarget || null;

    tbody.innerHTML = pagedRows.map(function (row) {
      var trAttrs;
      if (viewDetails) {
        trAttrs = 'style="cursor:pointer;" data-row-id="' + (row.id || '') + '" data-details-modal="' + viewDetails + '"';
      } else if (editTarget) {
        trAttrs = 'style="cursor:pointer;" data-bs-toggle="modal" data-bs-target="' + editTarget +
          '" data-row-id="' + (row.id || '') + '" data-table-id="' + tabId + '"';
      } else {
        trAttrs = '';
      }
      return (
        '<tr ' + trAttrs + '>' +
        visCols.map(function (col) {
          var val = (row[col.key] != null) ? row[col.key] : '';
          /*if (col.key === 'pdctCategory') val = getCategoryName(val);*/
          return '<td>' + val + '</td>';
        }).join('') +
        '</tr>'
      );
    }).join('');

    renderPagination(tabId);
  }

  // ─── Build Column-Visibility Dropdown ────────────────────────────────────────
  function buildDropdown(tabId) {
    var config = tables[tabId];
    if (!config) return;
    var ddMenu = document.getElementById(config.dropdownId);
    if (!ddMenu) return;

    ddMenu.innerHTML = config.columns
      .filter(function (c) { return c.dropdown; })
      .map(function (col) {
        return (
          '<li class="py-10">' +
          '<label class="dropdown-item d-flex align-items-center gap-2" data-col-key="' + col.key + '">' +
          '<input type="checkbox" ' + (col.visible ? 'checked' : '') + ' class="d-none" name="col-heading" />' +
          '<span class="chkbox-icon ' + (col.visible ? 'active' : '') + '"></span>' +
          '<p class="font-medium text-sm md-text-base text-color-3">' + col.label.replace('<br/>', ' ') + '</p>' +
          '</label>' +
          '</li>'
        );
      }).join('');

    ddMenu.querySelectorAll('input[name="col-heading"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var key = this.closest('label').dataset.colKey;
        var col = config.columns.find(function (c) { return c.key === key; });
        if (!col) return;

        var visibleCount = config.columns.filter(function (c) { return c.visible; }).length;
        if (visibleCount === 1 && !this.checked) { this.checked = true; return; }

        col.visible = this.checked;
        this.closest('label').querySelector('.chkbox-icon').classList.toggle('active', this.checked);

        if (!col.visible && config.sortState.key === col.key) {
          config.sortState.key = null;
          config.sortState.direction = 'default';
        }
        renderTable(tabId);
      });
    });
  }

  // ─── Populate Test Method Category Filter ────────────────────────────────────
  function populateTestMethodCategories() {
    var sel = document.querySelector('[data-table="test-method-table"][data-filter-key="pdctCategory"]');
    if (!sel) return;
    var cats = getProductCategories();
    var currentVal = sel.value;
    sel.innerHTML = '<option value="">All</option>';
    cats.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = String(cat.id);
      opt.textContent = cat.name;
      if (String(cat.id) === currentVal) opt.selected = true;
      sel.appendChild(opt);
    });
  }


  function populateLevelFilterSelect() {
    var levels = window.nemkoQualificationLevels || [];
    if (!levels.length) return;
    var sel = document.getElementById('f-level');
    if (!sel) return;
    sel.querySelectorAll('option:not([value=""])').forEach(function (o) {
      o.parentNode.removeChild(o);
    });
    levels.forEach(function (lv) {
      var opt = document.createElement('option');
      opt.value = String(lv.id);
      opt.textContent = lv.name;
      sel.appendChild(opt);
    });
  }

  // ─── Edit Modal Population ────────────────────────────────────────────────────
  function initEditModalListeners() {
    var modalMap = {
      'editStandaredModal': {
        rowsKey: 'nemkoDbStandardRows',
        populate: function (item) {
          var idEl = document.getElementById('editStandaredId');
          if (idEl) idEl.value = item.id || '';

          if (typeof window.nemkoFetchStandardDetails === 'function' && item.id) {
            window.nemkoFetchStandardDetails(item.id).then(function () {
              var d = window.nemkoStandardDetail || {};
              var titleEl = document.getElementById('editStandaredTitle');
              var icsEl = document.getElementById('editIcsCode');
              var iafEl = document.getElementById('editIAF');
              var naceEl = document.getElementById('editNACE');
              var catEl = document.getElementById('editPdctCategoryStd');
              var linkEl = document.getElementById('editLinkToWorkBench');
              if (titleEl) titleEl.value = d.standardTitle || item.standardTitle || '';
              if (icsEl) icsEl.value = d.icsCode || item.icsCode || '';
              if (iafEl) iafEl.value = d.iaf || item.iaf || '';
              if (naceEl) naceEl.value = d.nace || item.nace || '';
              if (catEl) catEl.value = String(d.productCategoryId || item.productCategoryId || '');
              if (linkEl) linkEl.value = d.linkToWorkbench || item.linkToWorkbench || '';
              var accredited = d.accreditedStandard ?? item.accreditedStandard ?? false;
              var radios = document.querySelectorAll('input[name="editAccreditedRadio"]');
              if (radios[0]) radios[0].checked = !!accredited;
              if (radios[1]) radios[1].checked = !accredited;
            });
          } else {
            var titleEl = document.getElementById('editStandaredTitle');
            var icsEl = document.getElementById('editIcsCode');
            var iafEl = document.getElementById('editIAF');
            var naceEl = document.getElementById('editNACE');
            var catEl = document.getElementById('editPdctCategoryStd');
            var linkEl = document.getElementById('editLinkToWorkBench');
            if (titleEl) titleEl.value = item.title || '';
            if (icsEl) icsEl.value = item.icsCode || '';
            if (iafEl) iafEl.value = item.iaf || '';
            if (naceEl) naceEl.value = item.nace || '';
            if (catEl) catEl.value = item.productCategory || '';
            if (linkEl) linkEl.value = item.linkToWorkbench || '';
            var radios = document.querySelectorAll('input[name="editAccreditedRadio"]');
            if (radios[0]) radios[0].checked = !!item.accreditedStandard;
            if (radios[1]) radios[1].checked = !item.accreditedStandard;
          }
        }
      },

      'editSchemeModal': {
        rowsKey: 'nemkoDbSchemeRows',
        populate: function (item) {
          var idEl = document.getElementById('editSchemeId');
          if (idEl) idEl.value = item.id || '';

          if (typeof window.nemkoFetchSchemeDetails === 'function' && item.id) {
            window.nemkoFetchSchemeDetails(item.id).then(function () {
              var d = window.nemkoSchemeDetail || {};
              var nameEl = document.getElementById('editSchemeNameIp');
              var refEl = document.getElementById('editRefStandaredTxtarea');
              if (nameEl) nameEl.value = d.name || item.name || '';
              if (refEl) refEl.value = d.referenceStandard || item.referenceStandard || '';
            });
          } else {
            var nameEl = document.getElementById('editSchemeNameIp');
            var refEl = document.getElementById('editRefStandaredTxtarea');
            if (nameEl) nameEl.value = item.name || '';
            if (refEl) refEl.value = item.referenceStandard || '';
          }
        }
      },

      'editTestmethodModal': {
        rowsKey: 'nemkoDbTestMethodRows',
        populate: function (item) {
          var idEl = document.getElementById('editTestmethodId');
          if (idEl) idEl.value = item.id || '';

          if (typeof window.nemkoFetchTestMethodDetails === 'function' && item.id) {
            window.nemkoFetchTestMethodDetails(item.id).then(function () {
              var d = window.nemkoTestMethodDetail || {};
              var nameEl = document.getElementById('editMethodNameIp');
              var catEl = document.getElementById('editPdctCategoryTm');
              var refEl = document.getElementById('editRefStandaredTmTxtarea');
              if (nameEl) nameEl.value = d.name || item.name || '';
              if (refEl) refEl.value = d.referenceStandard || item.referenceStandard || '';
              var catId = String(d.productCategoryId || item.productCategoryId || '');
              populateCategorySelect(catEl, catId);
            });
          } else {
            var nameEl = document.getElementById('editMethodNameIp');
            var catEl = document.getElementById('editPdctCategoryTm');
            var refEl = document.getElementById('editRefStandaredTmTxtarea');
            if (nameEl) nameEl.value = item.name || '';
            if (refEl) refEl.value = item.referenceStandard || '';
            populateCategorySelect(catEl, item.productCategoryId);
          }
        }
      }
    };

    Object.keys(modalMap).forEach(function (modalId) {
      var modalEl = document.getElementById(modalId);
      if (!modalEl || modalEl.dataset.editListenerInit === '1') return;
      modalEl.dataset.editListenerInit = '1';
      modalEl.addEventListener('show.bs.modal', function (e) {
        var tr = e.relatedTarget;
        if (!tr) return;
        var rowId = tr.dataset.rowId;
        var cfg = modalMap[modalId];
        var rows = window[cfg.rowsKey] || [];
        var item = rows.find(function (r) { return String(r.id) === String(rowId); });
        if (item) cfg.populate(item);
      });
    });
  }

  // ─── Main Tab Switch ──────────────────────────────────────────────────────────
  function initTabSwitch() {
    document.querySelectorAll('.nemko-tab-btn').forEach(function (btn) {
      if (btn.dataset.tabSwitchInit === '1') return;
      btn.dataset.tabSwitchInit = '1';
      btn.addEventListener('click', function () {
        var tabId = this.dataset.tabId;
        if (!tabId) return;
        document.querySelectorAll('.nemko-tab-btn').forEach(function (b) { b.classList.remove('nemko-tab-btn-active'); });
        document.querySelectorAll('.nemko-data-table-wrapper:not(#emp-details-table)').forEach(function (t) { t.style.display = 'none'; });
        this.classList.add('nemko-tab-btn-active');
        var target = document.getElementById(tabId);
        if (target) target.style.display = 'block';
        var exportBtn = document.querySelector('.export-excel-btn');
        if (exportBtn) exportBtn.style.display = (tabId === 'advanced-search-table') ? '' : 'none';
      });
    });
  }

  // ─── Database Sub-tab Switch ──────────────────────────────────────────────────
  function initDbTabSwitch() {
    document.querySelectorAll('.db-tab-title').forEach(function (btn) {
      if (btn.dataset.dbTabInit === '1') return;
      btn.dataset.dbTabInit = '1';
      btn.addEventListener('click', function () {
        var dbTabId = this.dataset.dbTabid;
        if (!dbTabId) return;
        document.querySelectorAll('.db-tab-title').forEach(function (b) { b.classList.remove('db-tab-title-active'); });
        document.querySelectorAll('.db-tab-view').forEach(function (v) { v.style.display = 'none'; });
        this.classList.add('db-tab-title-active');
        var view = document.getElementById(dbTabId);
        if (view) view.style.display = 'block';
        var tableId = DB_TAB_TABLE_MAP[dbTabId];
        if (tableId && tables[tableId]) renderTable(tableId);
      });
    });
  }

  // ─── Search / Filter Wiring (server-side, Enter key triggers API) ─────────────
  function initSearchFilters() {
    document.querySelectorAll('.nemko-filter-search[data-table]').forEach(function (input) {
      if (input.dataset.searchInit === '1') return;
      input.dataset.searchInit = '1';
      var tableId = input.dataset.table;
      if (!tables[tableId]) return;

      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var query = this.value;
        if (tableId === 'standared-table') { standardApiFilter.search = query; applyStandardFilters(1); }
        if (tableId === 'schemes-table') { schemeApiFilter.search = query; applySchemeFilters(1); }
        if (tableId === 'test-method-table') { testMethodApiFilter.search = query; applyTestMethodFilters(1); }
        if (tableId === 'employees-table') { employeeApiFilter.search = query; applyEmployeeFilters(1); }
        if (tableId === 'emp-details-table') { empDetailsApiFilter.search = query; applyEmpDetailsFilters(1); }
      });
    });

    // Test method category filter
    var tmCatSel = document.querySelector('[data-table="test-method-table"][data-filter-key="pdctCategory"]');
    if (tmCatSel && !tmCatSel.dataset.filterInit) {
      tmCatSel.dataset.filterInit = '1';
      tmCatSel.addEventListener('change', function () {
        testMethodApiFilter.categoryFilter = this.value;
        applyTestMethodFilters(1);
      });
    }

    // Qualification level filter 
    var levelSel = document.getElementById('f-level');
    if (levelSel && !levelSel.dataset.filterInit) {
      levelSel.dataset.filterInit = '1';
      levelSel.addEventListener('change', function () {
        qualificationApiFilter.qualificationLevel = this.value
          ? parseInt(this.value, 10)   // ← sends the ID as number e.g. 1, 2, 3
          : null;                       // ← null = not sent in payload (All)
      });
    }



    // Employee activate-all button
    var empActivateAll = document.querySelector('.db-employee-activate-all-btn');
    if (empActivateAll && !empActivateAll.dataset.activateInit) {
      empActivateAll.dataset.activateInit = '1';
      empActivateAll.addEventListener('click', function () {
        var confirmed = window.confirm('Are you sure you want to activate all employees?');
        if (!confirmed) return;
        var activateFn = window.nemkoActivateAllEmployees;
        if (typeof activateFn !== 'function') return;
        empActivateAll.disabled = true;
        empActivateAll.textContent = 'Activating...';
        activateFn().then(function () {
          empActivateAll.disabled = false;
          empActivateAll.textContent = 'Activate All';
          applyEmployeeFilters(1);
        }).catch(function () {
          empActivateAll.disabled = false;
          empActivateAll.textContent = 'Activate All';
        });
      });
    }
  }

  // ─── Shared Select Modal (Advanced Search field pickers) ──────────────────────
  var FIELD_CONFIG = {
    standard: { title: 'Select Standard', multi: true, itemsKey: 'nemkoFilterStandardItems', searchFn: 'nemkoFetchFilterStandardsBySearch' },
    scheme: { title: 'Select Scheme', multi: true, itemsKey: 'nemkoFilterSchemeItems', searchFn: 'nemkoFetchFilterSchemesBySearch' },
    testmethod: { title: 'Select Test Method', multi: true, itemsKey: 'nemkoFilterTestMethodItems', searchFn: 'nemkoFetchFilterTestMethodsBySearch' },
    employee: { title: 'Select Employee', multi: true, itemsKey: 'nemkoFilterEmployeeItems', searchFn: 'nemkoFetchFilterEmployeesBySearch' },
    office: { title: 'Select Office', multi: true, itemsKey: 'nemkoFilterOfficeItems', searchFn: 'nemkoFetchFilterOfficesBySearch' },
  };

  var fieldSelections = { standard: [], scheme: [], testmethod: [], employee: [], office: [] };
  var activeField = null;
  var tempSel = [];
  var modalSearchDebounce = null;

  function getFieldItems(field) {
    var cfg = FIELD_CONFIG[field];
    if (cfg.itemsKey && window[cfg.itemsKey]) {
      return window[cfg.itemsKey].map(function (i) { return i.title; });
    }
    return [];
  }

  function updateAdvancedSearchFilters() {
    var stdEl = document.getElementById('f-standard');
    var tmEl = document.getElementById('f-testmethod');
    var schEl = document.getElementById('f-scheme');
    var hasStd = stdEl && stdEl.value.trim() !== '';
    var hasTm = tmEl && tmEl.value.trim() !== '';
    var hasSch = schEl && schEl.value.trim() !== '';
    var showStdTm = hasStd || hasTm;
    var raEl = document.getElementById('report_approver');
    var csEl = document.getElementById('conformity_statement');
    var cdEl = document.getElementById('certificate_decision');
    if (raEl) raEl.style.display = showStdTm ? '' : 'none';
    if (csEl) csEl.style.display = showStdTm ? '' : 'none';
    if (cdEl) cdEl.style.display = hasSch ? '' : 'none';
  }

  function renderModalItems(query) {
    var cfg = FIELD_CONFIG[activeField];
    var allItems = getFieldItems(activeField);
    var filtered = allItems.filter(function (i) {
      return i.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    var list = document.getElementById('sharedModalList');
    if (!list) return;
    list.innerHTML = '';
    if (filtered.length === 0) {
      list.insertAdjacentHTML('beforeend',
        '<p class="text-center text-color-3 font-medium text-sm py-3 mb-0">No items found.</p>');
      return;
    }
    filtered.forEach(function (item) {
      var sel = tempSel.indexOf(item) !== -1;
      if (!cfg.multi) {
        list.insertAdjacentHTML('beforeend',
          '<label class="nemko-frm-radio d-flex align-items-center gap-2 modal-item-row" data-value="' + item + '">' +
          '<input class="form-check-input" type="radio" name="sharedModalRadio" ' + (sel ? 'checked' : '') + '>' +
          '<span class="radio-icon radio-icon-lg ' + (sel ? 'selected' : '') + '"></span>' +
          '<p class="form-check-label">' + item + '</p>' +
          '</label>');
      } else {
        list.insertAdjacentHTML('beforeend',
          '<label class="nemko-frm-chkbox d-flex align-items-center gap-2 modal-item-row" data-value="' + item + '">' +
          '<input class="form-check-input" type="checkbox" name="sharedModalChk" ' + (sel ? 'checked' : '') + '>' +
          '<span class="chkbox-icon ' + (sel ? 'active' : '') + '"></span>' +
          '<p class="form-check-label">' + item + '</p>' +
          '</label>');
      }
    });
  }

  // ─── Build qualification POST body from current form state ────────────────────
  function buildQualificationFilterFromForm() {
    function mapSelections(field, filterItemsKey) {
      var names = fieldSelections[field] || [];
      if (!names.length) return [];
      var items = window[filterItemsKey] || [];
      return names.map(function (name) {
        var found = items.find(function (i) { return i.title === name; });
        return found ? { id: parseInt(found.id, 10) || 0, value: name } : null;
      }).filter(Boolean);
    }

    qualificationApiFilter.standard = mapSelections('standard', 'nemkoFilterStandardItems');
    qualificationApiFilter.scheme = mapSelections('scheme', 'nemkoFilterSchemeItems');
    qualificationApiFilter.testMethod = mapSelections('testmethod', 'nemkoFilterTestMethodItems');
    qualificationApiFilter.employee = mapSelections('employee', 'nemkoFilterEmployeeItems');
    qualificationApiFilter.office = mapSelections('office', 'nemkoFilterOfficeItems');

    // Build columnTextSearches for fields that were typed, not selected from modal
    var fieldColumnMap = {
      standard: 'standard',
      scheme: 'scheme',
      testmethod: 'testmethod',
      employee: 'employee',
      office: 'office'
    };
    qualificationApiFilter.columnTextSearches = [];
    Object.keys(fieldColumnMap).forEach(function (field) {
      var inputEl = document.getElementById('f-' + field);
      var typedValue = inputEl ? inputEl.value.trim() : '';
      var hasModalSelection = fieldSelections[field] && fieldSelections[field].length > 0;
      if (typedValue && !hasModalSelection) {
        qualificationApiFilter.columnTextSearches.push({
          columnName: fieldColumnMap[field],
          searchText: typedValue
        });
      }
    });

    function selectToBool(id) {
      var el = document.getElementById(id);
      if (!el || el.value === '') return null;
      return el.value === 'true';
    }

    qualificationApiFilter.status = selectToBool('f-status');
    qualificationApiFilter.conformityStatement = selectToBool('f-conformity');
    qualificationApiFilter.reportApprover = selectToBool('f-reportApprover');
    qualificationApiFilter.certificationDecision = selectToBool('f-certDecision');
  }

  // ─── Export to Excel ─────────────────────────────────────────────────────────
  function escapeXml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function downloadExcel(rows) {
    var EXPORT_COLS = [
      { label: 'Qualification ID', key: 'qualificationId' },
      { label: 'Employee', key: 'employee' },
      { label: 'Employee Email Address', key: 'employeeEmail' },
      { label: 'Office', key: 'office' },
      { label: 'Qualification', key: 'qualifications' },
      { label: 'Level', key: 'level' },
      { label: 'Type', key: 'type' },
      { label: 'Qualified Date', key: 'qualifiedDate' },
      { label: 'Verified By', key: 'verifiedBy' },
      { label: 'Verifier Email Address', key: 'verifierEmail' },
      { label: 'Authorized By', key: 'authorizedBy' },
      { label: 'Authorizer Email Address', key: 'authorizerEmail' },
      { label: 'Report Approver', key: 'report' },
      { label: 'Certification Decision', key: 'certification' },
      { label: 'Limitations', key: 'limitations' },
    ];

    var parts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
      ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
      '<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/></Style></Styles>',
      '<Worksheet ss:Name="Qualifications"><Table>',
      '<Row>'
    ];

    EXPORT_COLS.forEach(function (col) {
      parts.push('<Cell ss:StyleID="hdr"><Data ss:Type="String">' + escapeXml(col.label) + '</Data></Cell>');
    });
    parts.push('</Row>');

    rows.forEach(function (row) {
      parts.push('<Row>');
      EXPORT_COLS.forEach(function (col) {
        parts.push('<Cell><Data ss:Type="String">' + escapeXml(String(row[col.key] ?? '')) + '</Data></Cell>');
      });
      parts.push('</Row>');
    });

    parts.push('</Table></Worksheet></Workbook>');

    var blob = new Blob([parts.join('')], { type: 'application/vnd.ms-excel' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'qualifications-' + new Date().toISOString().slice(0, 10) + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function exportQualificationsToExcel() {
    var exportFn = window.nemkoExportQualifications;
    if (typeof exportFn !== 'function') return;

    var btn = document.querySelector('.export-excel-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Exporting...'; }

    try {
      await exportFn(qualificationApiFilter);
    } catch (err) {
      console.error('[NEMKO] Export error:', err);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Export To Excel'; }
    }
  }

  // ─── Document-level Event Listeners (registered once) ─────────────────────────
  if (!window._nemkoAdvSearchListeners) {
    window._nemkoAdvSearchListeners = true;

    // Open shared select modal
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.field-select-btn');
      if (!btn) return;
      activeField = btn.dataset.field;
        var cfg = FIELD_CONFIG[activeField];
        if (!cfg) return;
        // If the DOM input is empty but fieldSelections has values, the DOM was
        // re-created (SPA navigation) without clearing the closure state.
        // Trust the DOM as the source of truth — if it's empty, clear the selection.
        var domInput = document.getElementById('f-' + activeField);
        if (domInput && domInput.value.trim() === '' && fieldSelections[activeField].length > 0) {
        fieldSelections[activeField] = [];
        }
        tempSel = fieldSelections[activeField].slice();
      var titleEl = document.getElementById('sharedModalTitle');
      if (titleEl) titleEl.textContent = cfg.title;
      var searchInput = document.getElementById('sharedModalSearch');
      if (searchInput) searchInput.value = '';
      var listEl = document.getElementById('sharedModalList');
      if (cfg.searchFn && typeof window[cfg.searchFn] === 'function') {
        if (listEl) listEl.innerHTML = '<p class="text-center text-color-3 font-medium text-sm fy-3 mb-0">Loading...</p>';
        window[cfg.searchFn]('').then(function () { renderModalItems(''); });
      } else {
        renderModalItems('');
      }
    });

    // Radio / checkbox changes inside shared modal
    document.addEventListener('change', function (e) {
      if (e.target.name === 'sharedModalRadio') {
        tempSel = [e.target.closest('.modal-item-row').dataset.value];
      }
      if (e.target.name === 'sharedModalChk') {
        var val = e.target.closest('.modal-item-row').dataset.value;
        if (e.target.checked) {
          if (tempSel.indexOf(val) === -1) tempSel.push(val);
        } else {
          tempSel = tempSel.filter(function (v) { return v !== val; });
        }
        if (e.target.nextElementSibling) {
          e.target.nextElementSibling.classList.toggle('active', e.target.checked);
        }
      }
    });

    // Clear individual field
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.field-clear-btn');
      if (!btn) return;
      var field = btn.dataset.field;
      fieldSelections[field] = [];
      var input = document.getElementById('f-' + field);
      if (input) input.value = '';
      updateAdvancedSearchFilters();
    });

    // Modal search input — server-side API search with debounce
    document.addEventListener('input', function (e) {
      if (e.target.id !== 'sharedModalSearch') return;
      var query = e.target.value;
      var cfg = FIELD_CONFIG[activeField];
      clearTimeout(modalSearchDebounce);
      if (cfg && cfg.searchFn && typeof window[cfg.searchFn] === 'function') {
        modalSearchDebounce = setTimeout(function () {
          window[cfg.searchFn](query).then(function () {
            renderModalItems('');
          });
        }, 300);
      } else {
        renderModalItems(query);
      }
    });

    // Show/hide additional filters when typing in standard/scheme/testmethod inputs
    document.addEventListener('input', function (e) {

      var map = {
        'f-standard': 'standard',
        'f-scheme': 'scheme',
        'f-testmethod': 'testmethod',
        'f-employee': 'employee',
        'f-office': 'office'
      };

      var field = map[e.target.id];

      if (!field) return;

      fieldSelections[field] = [];

      updateAdvancedSearchFilters();
    });

    // Modal search clear
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#sharedModalSearchClear')) return;
      var input = document.getElementById('sharedModalSearch');
      if (!input) return;
      input.value = '';
      var cfg = FIELD_CONFIG[activeField];
      if (cfg && cfg.searchFn && typeof window[cfg.searchFn] === 'function') {
        window[cfg.searchFn]('').then(function () { renderModalItems(''); });
      } else {
        renderModalItems('');
      }
    });

    // Modal Save
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#sharedModalSave')) return;
      if (!activeField) return;
      fieldSelections[activeField] = tempSel.slice();
      var input = document.getElementById('f-' + activeField);
      if (input) input.value = tempSel.join(', ');
      setTimeout(updateAdvancedSearchFilters, 0);
    });

    // "Search" button → fetch qualification table from API with all current filters
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.advanced-search-filter-wrapper .nemko-btn-save');
      if (!btn) return;
      buildQualificationFilterFromForm();
      applyQualificationFilters(1);
    });

    // "Reset All" button → clear all filters and re-fetch
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.advanced-search-filter-wrapper .nemko-btn-cancel');
      if (!btn) return;
      Object.keys(fieldSelections).forEach(function (field) {
        fieldSelections[field] = [];
        var input = document.getElementById('f-' + field);
        if (input) input.value = '';
      });
      document.querySelectorAll('.advanced-search-filter-wrapper select').forEach(function (sel) {
        sel.selectedIndex = 0;
      });
      updateAdvancedSearchFilters();
      qualificationApiFilter.columnTextSearches = [];
      qualificationApiFilter.standard = [];
      qualificationApiFilter.scheme = [];
      qualificationApiFilter.testMethod = [];
      qualificationApiFilter.employee = [];
      qualificationApiFilter.office = [];
      qualificationApiFilter.status = null;
      qualificationApiFilter.conformityStatement = null;
      qualificationApiFilter.certificationDecision = null;
      qualificationApiFilter.qualificationLevel = null;
      qualificationApiFilter.reportApprover = null;
      applyQualificationFilters(1);
    });

    // "Export To Excel" button
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.export-excel-btn')) return;
      exportQualificationsToExcel();
    });

    // Row click → open details modal (qualification or employee)
    document.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-row-id][data-details-modal]');
      if (!tr) return;
      var rowId = tr.dataset.rowId;
      var modalId = tr.dataset.detailsModal;
      if (!rowId || !modalId) return;

      // ── Employee details ──
      if (modalId === 'empDetailsModal') {
        var nameEl = document.getElementById('empDetailsName');
        var empRows = window.nemkoDbEmployeeRows || [];
        var empRow = empRows.find(function (r) { return String(r.id) === String(rowId); });
        if (nameEl) nameEl.textContent = (empRow && empRow.name) ? empRow.name : '';

        empDetailsApiFilter.employeeId = rowId;
        empDetailsApiFilter.search = '';
        empDetailsApiFilter.sortBy = null;
        empDetailsApiFilter.sortOrder = null;
        tables['emp-details-table'].sortState = { key: null, direction: 'default' };
        tables['emp-details-table'].rows = [];
        tables['emp-details-table'].paginationMeta = null;

        var empSearchInput = document.querySelector('#empDetailsModal .nemko-filter-search');
        if (empSearchInput) empSearchInput.value = '';

        if (typeof window.nemkoOpenModal === 'function') {
          window.nemkoOpenModal(modalId);
        }
        applyEmpDetailsFilters(1);
        return;
      }

      // ── Qualification details ──
      var loadingEl = document.getElementById('detailsModalLoading');
      var contentEl = document.getElementById('detailsModalContent');
      var errorEl = document.getElementById('detailsModalError');
      if (loadingEl) loadingEl.style.display = '';
      if (contentEl) contentEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      if (typeof window.nemkoOpenModal === 'function') {
        window.nemkoOpenModal(modalId);
      }

      if (typeof window.nemkoFetchQualificationDetails !== 'function') return;
      window.nemkoFetchQualificationDetails(rowId)
        .then(function () {
          populateQualificationDetailsModal(window.nemkoQualificationDetail);
        })
        .catch(function () {
          if (loadingEl) loadingEl.style.display = 'none';
          if (errorEl) errorEl.style.display = '';
        });
    });

  }

  // ─── Main Init ────────────────────────────────────────────────────────────────
  function initAdvancedSearch() {
  // Reset modal/filter state on every init so SPA navigation back starts clean.
  // fieldSelections lives in the closure and survives navigation — the DOM
  // inputs are re-created empty, but the closure still holds old values,
  // causing the modal to show previously-checked items against blank inputs.
  fieldSelections = { standard: [], scheme: [], testmethod: [], employee: [], office: [] };
  tempSel = [];
  activeField = null;
  qualificationApiFilter.search = '';
  qualificationApiFilter.sortBy = null;
  qualificationApiFilter.sortOrder = null;
  qualificationApiFilter.status = null;
  qualificationApiFilter.conformityStatement = null;
  qualificationApiFilter.certificationDecision = null;
  qualificationApiFilter.qualificationLevel = null;
  qualificationApiFilter.reportApprover = null;
  qualificationApiFilter.standard = [];
  qualificationApiFilter.scheme = [];
  qualificationApiFilter.testMethod = [];
  qualificationApiFilter.employee = [];
  qualificationApiFilter.office = [];
  qualificationApiFilter.columnTextSearches = [];

  tables['advanced-search-table'].rows = window.nemkoTableRows || [];
    tables['advanced-search-table'].paginationMeta = window.nemkoTablePagination || null;
    tables['standared-table'].rows = window.nemkoDbStandardRows || [];
    tables['standared-table'].paginationMeta = window.nemkoDbStandardPagination || null;
    tables['schemes-table'].rows = window.nemkoDbSchemeRows || [];
    tables['schemes-table'].paginationMeta = window.nemkoDbSchemePagination || null;
    tables['test-method-table'].rows = window.nemkoDbTestMethodRows || [];
    tables['test-method-table'].paginationMeta = window.nemkoDbTestMethodPagination || null;
    tables['employees-table'].rows = window.nemkoDbEmployeeRows || [];
    tables['employees-table'].paginationMeta = window.nemkoDbEmployeePagination || null;

    Object.keys(tables).forEach(function (tabId) {
      buildDropdown(tabId);
    });

    renderTable('advanced-search-table');
    renderTable('standared-table');

    populateTestMethodCategories();
    populateLevelFilterSelect();

    var createCatEl = document.getElementById('pdctCategoryTm');
    populateCategorySelect(createCatEl, '');

    initTabSwitch();
    initDbTabSwitch();
    initSearchFilters();
    initEditModalListeners();
  }

  // ─── Public API ───────────────────────────────────────────────────────────────
  window.initAdvancedSearch = initAdvancedSearch;
  window._nemkoAdvSearch = {
    cycleSort: cycleSort,

    renderStandards: function () {
      tables['standared-table'].rows = window.nemkoDbStandardRows || [];
      tables['standared-table'].paginationMeta = window.nemkoDbStandardPagination || null;
      tables['standared-table'].sortState = { key: null, direction: 'default' };
      standardApiFilter.sortBy = null;
      standardApiFilter.sortOrder = null;
      renderTable('standared-table');
    },

    renderSchemes: function () {
      tables['schemes-table'].rows = window.nemkoDbSchemeRows || [];
      tables['schemes-table'].paginationMeta = window.nemkoDbSchemePagination || null;
      tables['schemes-table'].sortState = { key: null, direction: 'default' };
      schemeApiFilter.sortBy = null;
      schemeApiFilter.sortOrder = null;
      renderTable('schemes-table');
    },

    renderTestMethods: function () {
      tables['test-method-table'].rows = window.nemkoDbTestMethodRows || [];
      tables['test-method-table'].paginationMeta = window.nemkoDbTestMethodPagination || null;
      tables['test-method-table'].sortState = { key: null, direction: 'default' };
      testMethodApiFilter.sortBy = null;
      testMethodApiFilter.sortOrder = null;
      renderTable('test-method-table');
      populateTestMethodCategories();
    },
  };

})();
