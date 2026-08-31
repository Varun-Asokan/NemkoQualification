(function () {

  // ─── Table Config (injected by WpEmployeesWebPart before this script runs) ───
  const tables = window.__employeeTableConfig || {};

  const SORT_CYCLE = ['asc', 'desc', 'default'];

  // ─── Server-side API filter state ────────────────────────────────────────────
  const apiFilter = {
    sortBy:             null,
    sortOrder:          null,
    personalStatusId:   null,
    columnTextSearches: [],
  };

  // ─── Server-side fetch & re-render ───────────────────────────────────────────
  function applyServerFilters(tabId, page) {
    const fetchFn = window.nemkoFetchEmployeesAdminPage;
    if (typeof fetchFn !== 'function') return;
    const config = tables[tabId];
    if (!config) return;

    fetchFn(
      page || 1,
      apiFilter.sortBy,
      apiFilter.sortOrder,
      apiFilter.personalStatusId,
      apiFilter.columnTextSearches.length ? apiFilter.columnTextSearches : null
    ).then(function () {
      const incoming   = window.nemkoEmployeeAdminRows       || [];
      config.rows      = [...incoming];
      config._allRows  = [...incoming];
      config.paginationMeta = window.nemkoEmployeeAdminPagination || null;
      renderTable(tabId);
    });
  }

  // ─── Sort Logic ───────────────────────────────────────────────────────────────
  // Server handles actual ordering; getSortedRows returns rows as-is.
  function getSortedRows(config) {
    return config.rows.slice();
  }

  function cycleSort(tabId, key) {
    const config = tables[tabId];
    const { sortState } = config;
    if (sortState.key !== key) {
      sortState.key = key;
      sortState.direction = 'asc';
    } else {
      const currentIndex = SORT_CYCLE.indexOf(sortState.direction);
      sortState.direction = SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length];
      if (sortState.direction === 'default') sortState.key = null;
    }
    // Resolve the API sort field from the column's sortApiKey (falls back to key)
    const sortCol = config.columns.find(function (c) { return c.key === sortState.key; });
    const apiSortBy = (sortState.direction !== 'default' && sortCol && sortCol.sortApiKey)
      ? sortCol.sortApiKey
      : null;
    apiFilter.sortBy    = apiSortBy;
    apiFilter.sortOrder = sortState.direction !== 'default' ? sortState.direction : null;
    renderTable(tabId);  // immediate arrow feedback before API responds
    applyServerFilters(tabId, 1);
  }

  window.cycleSort = cycleSort;

  // ─── Sort Icon Helpers ────────────────────────────────────────────────────────
  function getSortClass(sortState, key) {
    return sortState.key === key ? `sort-${sortState.direction}` : '';
  }

  function getSortTitle(sortState, key) {
    if (sortState.key !== key || sortState.direction === 'default') return 'Click to sort ascending';
    if (sortState.direction === 'asc') return 'Click to sort descending';
    return 'Click to reset sort';
  }

  function getSortSVG(sortState, key) {
    const isActive   = sortState.key === key;
    const dir        = isActive ? sortState.direction : 'default';
    const active     = 'var(--color-primary, #006e8c)';
    const inactive   = '#C0C0C0';
    const upFill     = (isActive && dir === 'asc')  ? active : inactive;
    const downFill   = (isActive && dir === 'desc') ? active : inactive;
    return `
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 1L1 5H9L5 1Z"   fill="${upFill}"   />
        <path d="M5 13L1 9H9L5 13Z" fill="${downFill}" />
      </svg>`;
  }

  // ─── Render Table ─────────────────────────────────────────────────────────────
  function renderTable(tabId) {
    const config    = tables[tabId];
    const container = document.getElementById(tabId);
    if (!container) return;
    const table = container.querySelector(config.tableSelector);
    if (!table) return;
    const visCols = config.columns.filter(c => c.visible);
    const rows    = getSortedRows(config);

    // thead
    const theadTr = table.querySelector('thead tr');
    theadTr.innerHTML =
      `<th class="table-chkbox-col">
        <label class="nemko-frm-chkbox d-flex">
          <input type="checkbox" id="select-all-${tabId}" class="form-check-input d-none" />
          <span class="chkbox-icon"></span>
        </label>
      </th>` +
      visCols.map(col => col.sortable
        ? `<th class="sortable-col" data-table-id="${tabId}" data-col-key="${col.key}"
              style="cursor:pointer;" title="${getSortTitle(config.sortState, col.key)}">
            <div class="w-100 d-flex justify-content-between align-items-center gap-1"
                style="flex-wrap:nowrap;pointer-events:none;">
              <p class="text-color-3 font-medium text-sm lg-text-base" style="margin:0;">${col.label}</p>
              <span class="sort-icon ${getSortClass(config.sortState, col.key)}"
                  style="display:inline-flex;flex-shrink:0;align-items:center;">
                ${getSortSVG(config.sortState, col.key)}
              </span>
            </div>
          </th>`
        : `<th>
            <div class="w-100 d-flex align-items-center">
              <p class="text-color-3 font-medium text-sm lg-text-base">${col.label}</p>
            </div>
          </th>`
      ).join('');

    theadTr.querySelectorAll('.sortable-col').forEach(th => {
      th.addEventListener('click', function () {
        const tId = th.dataset.tableId;
        const key = th.dataset.colKey;
        if (tId && key) cycleSort(tId, key);
      });
    });

    // tbody
    const tbody = table.querySelector('tbody');

    if (!rows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="999" class="text-center text-muted">No records found.</td>
        </tr>`;
    } else {
      tbody.innerHTML = rows.map((row, i) => `
        <tr class="emp-table-row" data-index="${i}" style="cursor:pointer;">
          <td class="table-chkbox-col">
            <label class="nemko-frm-chkbox d-flex">
              <input type="checkbox" class="row-checkbox form-check-input d-none" data-index="${i}" />
              <span class="chkbox-icon"></span>
            </label>
          </td>
          ${visCols.map(col => `<td>${row[col.key] ?? ''}</td>`).join('')}
        </tr>
      `).join('');

      // Row click → open Edit modal
      table.querySelectorAll('.emp-table-row').forEach(tr => {
        tr.addEventListener('click', function (e) {
          if (e.target.closest('.table-chkbox-col')) return;
          openEditModal(tabId, parseInt(this.dataset.index, 10));
        });
      });

      // Select-All checkbox
      if (table._checkboxAbort) table._checkboxAbort.abort();
      table._checkboxAbort = new AbortController();
      const signal = table._checkboxAbort.signal;

      const selectAll     = table.querySelector(`#select-all-${tabId}`);
      const rowCheckboxes = () => table.querySelectorAll('.row-checkbox');

      if (selectAll) {
        selectAll.addEventListener('change', function () {
          rowCheckboxes().forEach(cb => cb.checked = this.checked);
        }, { signal });

        table.addEventListener('change', function (e) {
          if (!e.target.classList.contains('row-checkbox')) return;
          const all = [...rowCheckboxes()];
          selectAll.checked       = all.every(cb => cb.checked);
          selectAll.indeterminate = !selectAll.checked && all.some(cb => cb.checked);
        }, { signal });
      }
    }

    // Render server-side pagination
    renderPagination(tabId);
  }

  // ─── Render Pagination ────────────────────────────────────────────────────────
  function renderPagination(tabId) {
    const config    = tables[tabId];
    const container = document.getElementById(tabId);
    if (!container) return;
    const paginationEl = container.querySelector('.nemko-pagination');
    if (!paginationEl) return;

    const meta    = config.paginationMeta || {};
    const page    = meta.pageNumber     || 1;
    const last    = meta.lastPageNumber || 1;
    const total   = meta.totalCount     || 0;
    const size    = meta.pageSize       || 0;
    const hasBack = !!meta.hasBack;
    const hasMore = !!meta.hasMore;

    const start = total === 0 ? 0 : (page - 1) * size + 1;
    const end   = size > 0 ? Math.min(page * size, total) : total;

    paginationEl.innerHTML =
      `<li class="page-item ${!hasBack ? 'disabled' : 'cursor-pointer'}" data-page="first">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.72266 4.53745L8.16766 0.60786L8.16766 8.46704L2.72266 4.53745Z" fill="#989898"/>
          <rect width="1.815" height="8.1675" fill="#989898"/>
        </svg>
      </li>
      <li class="page-item ${!hasBack ? 'disabled' : 'cursor-pointer'}" data-page="prev">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M-1.9834e-07 4.53745L5.445 0.60786L5.445 8.46704L-1.9834e-07 4.53745Z" fill="#989898"/>
          <path d="M6.35352 4.53745L11.7985 0.60786L11.7985 8.46704L6.35352 4.53745Z" fill="#989898"/>
        </svg>
      </li>
      <li class="page-item">
        <span class="font-medium font-inter text-black text-xs">${start} to ${end} of ${total}</span>
      </li>
      <li class="page-item ${!hasMore ? 'disabled' : 'cursor-pointer'}" data-page="next">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M13.6125 4.53745L8.1675 0.60786L8.1675 8.46704L13.6125 4.53745Z" fill="#989898"/>
          <path d="M7.25898 4.53745L1.81398 0.60786L1.81398 8.46704L7.25898 4.53745Z" fill="#989898"/>
        </svg>
      </li>
      <li class="page-item ${!hasMore ? 'disabled' : 'cursor-pointer'}" data-page="last">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M7.25984 4.53751L1.81484 0.607921L1.81484 8.4671L7.25984 4.53751Z" fill="#989898"/>
          <rect width="1.815" height="8.1675" transform="matrix(-1 0 0 1 9.9825 0)" fill="#989898"/>
        </svg>
      </li>`;

    paginationEl.querySelectorAll('.page-item:not(.disabled)').forEach(item => {
      item.addEventListener('click', function () {
        const action  = item.dataset.page;
        let   newPage = page;
        if (action === 'first') newPage = 1;
        if (action === 'prev')  newPage = Math.max(1, page - 1);
        if (action === 'next')  newPage = Math.min(last, page + 1);
        if (action === 'last')  newPage = last;
        if (newPage === page) return;
        const fetchFn = window.nemkoFetchEmployeesAdminPage;
        if (typeof fetchFn !== 'function') return;
        const config = tables[tabId];
        fetchFn(
          newPage,
          apiFilter.sortBy,
          apiFilter.sortOrder,
          apiFilter.personalStatusId,
          apiFilter.columnTextSearches.length ? apiFilter.columnTextSearches : null
        ).then(function () {
          const incoming = window.nemkoEmployeeAdminRows || [];
          config.rows = [...incoming];
          config._allRows = [...incoming];
          config.paginationMeta = window.nemkoEmployeeAdminPagination || null;
          renderTable(tabId);
        });
      });
    });
  }

  // ─── Build Column-Visibility Dropdown ────────────────────────────────────────
  function buildDropdown(tabId) {
    const config = tables[tabId];
    const ddMenu = document.getElementById(config.dropdownId);
    if (!ddMenu) return;
    const ddCols = config.columns.filter(c => c.dropdown);

    ddMenu.innerHTML = ddCols.map(col => `
      <li class="py-10">
        <label class="dropdown-item d-flex align-items-center gap-2" data-col-key="${col.key}">
          <input type="checkbox" ${col.visible ? 'checked' : ''} class="d-none" name="col-heading" />
          <span class="chkbox-icon ${col.visible ? 'active' : ''}"></span>
          <p class="font-medium text-sm md-text-base text-color-3">${col.label.replace('<br/>', '')}</p>
        </label>
      </li>
    `).join('');

    ddMenu.querySelectorAll('input[name="col-heading"]').forEach(cb => {
      cb.addEventListener('change', function () {
        const key = this.closest('label').dataset.colKey;
        const col = config.columns.find(c => c.key === key);
        if (!col) return;
        col.visible = this.checked;
        this.closest('label').querySelector('.chkbox-icon').classList.toggle('active', this.checked);
        renderTable(tabId);
      });
    });
  }

  // ─── Populate Personal Status Dropdowns from API ──────────────────────────────
  function populateStatusDropdowns() {
    const statuses = window.nemkoPersonalStatuses || [];

    // Filter bar dropdown
    const filterSel = document.getElementById('empStatusFilter');
    if (filterSel) {
      const current = filterSel.value;
      filterSel.innerHTML = '<option value="">All</option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value       = String(s.id);
        opt.textContent = s.name;
        if (String(s.id) === current) opt.selected = true;
        filterSel.appendChild(opt);
      });
    }

    // New employee modal
    const newSel = document.getElementById('personalStatus');
    if (newSel) {
      newSel.innerHTML = '<option value="" disabled selected></option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value       = String(s.id);
        opt.textContent = s.name;
        newSel.appendChild(opt);
      });
    }

    // Edit employee modal
    const editSel = document.getElementById('editPersonalStatus');
    if (editSel) {
      const current = editSel.value;
      editSel.innerHTML = '<option value="" disabled selected></option>';
      statuses.forEach(s => {
        const opt = document.createElement('option');
        opt.value       = String(s.id);
        opt.textContent = s.name;
        if (String(s.id) === current) opt.selected = true;
        editSel.appendChild(opt);
      });
    }
  }

  // ─── Search & Reset (server-side) ────────────────────────────────────────────
  function initSearch(tabId) {
    const config  = tables[tabId];
    const wrapper = document.getElementById(tabId);
    if (!wrapper) return;

    config._allRows = [...config.rows];

    const searchBtn = wrapper.querySelector('.ao-filter-right-btns .nemko-btn-save');
    const resetBtn  = wrapper.querySelector('.ao-filter-right-btns .nemko-btn-cancel');
    if (!searchBtn || !resetBtn) return;

    // Clone to remove any previously attached listeners
    const newSearch = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newSearch, searchBtn);
    const newReset = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newReset, resetBtn);

    newSearch.addEventListener('click', function () {
      const searches = [];
      wrapper.querySelectorAll('[data-emp-column]').forEach(inp => {
        const col = inp.dataset.empColumn;
        const val = inp.value.trim();
        if (col && val) searches.push({ columnName: col, searchText: val });
      });
      apiFilter.columnTextSearches = searches;

      const statusSel = wrapper.querySelector('#empStatusFilter');
      apiFilter.personalStatusId = (statusSel && statusSel.value)
        ? Number(statusSel.value)
        : null;

      applyServerFilters(tabId, 1);
    });

    newReset.addEventListener('click', function () {
      wrapper.querySelectorAll('[data-emp-column]').forEach(inp => inp.value = '');
      const statusSel = wrapper.querySelector('#empStatusFilter');
      if (statusSel) statusSel.value = '';

      apiFilter.columnTextSearches = [];
      apiFilter.personalStatusId   = null;
      apiFilter.sortBy             = null;
      apiFilter.sortOrder          = null;

      Object.keys(tables).forEach(tid => {
        tables[tid].sortState.key       = null;
        tables[tid].sortState.direction = 'default';
      });

      applyServerFilters(tabId, 1);
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────
  function initDelete(tabId) {
    const config  = tables[tabId];
    const wrapper = document.getElementById(tabId);
    if (!wrapper) return;

    let btnDelete    = wrapper.querySelector('.ao-table-top-btn .nemko-btn-cancel');
    let btnDeleteAll = wrapper.querySelector('.ao-table-top-btn .nemko-btn-reject');
    if (!btnDelete || !btnDeleteAll) return;

    // Clone to remove any previously attached listeners (same pattern as initSearch)
    const newBtnDelete = btnDelete.cloneNode(true);
    btnDelete.parentNode.replaceChild(newBtnDelete, btnDelete);
    btnDelete = newBtnDelete;
    const newBtnDeleteAll = btnDeleteAll.cloneNode(true);
    btnDeleteAll.parentNode.replaceChild(newBtnDeleteAll, btnDeleteAll);
    btnDeleteAll = newBtnDeleteAll;

    btnDelete.addEventListener('click', function () {
      const container = document.getElementById(tabId);
      const table     = container.querySelector(config.tableSelector);
      const checkedIndexes = [...table.querySelectorAll('.row-checkbox:checked')]
        .map(function(cb) { return parseInt(cb.dataset.index, 10); });
      if (!checkedIndexes.length) { alert('Please select a row to delete.'); return; }

      const rowIds = checkedIndexes
        .map(function(i) { return config.rows[i] && config.rows[i].id; })
        .filter(function(id) { return id; });

      if (!rowIds.length) { alert('Selected row has no valid ID.'); return; }

      if (!confirm('Delete ' + rowIds.length + ' employee' + (rowIds.length > 1 ? 's' : '') + '?')) return;

      const deleteFn = window.nemkoDeleteEmployee;
      if (typeof deleteFn !== 'function') return;

      const btn = this;
      btn.disabled = true;

      deleteFn(rowIds)
        .then(function () {
          var currentPage = (config.paginationMeta && config.paginationMeta.pageNumber) || 1;
          applyServerFilters(tabId, currentPage);
        })
        .catch(function () {
          // error already alerted inside nemkoDeleteEmployee
        })
        .finally(function () {
          btn.disabled = false;
        });
    });

    btnDeleteAll.addEventListener('click', function () {
      var total = (config.paginationMeta && config.paginationMeta.totalCount) || config.rows.length;
      if (!total) { alert('No employees to delete.'); return; }

      if (!confirm('Delete all ' + total + ' employee' + (total !== 1 ? 's' : '') + '? This cannot be undone.')) return;

      var deleteAllFn = window.nemkoDeleteAllEmployees;
      if (typeof deleteAllFn !== 'function') return;

      const btn = this;
      btn.disabled = true;

      deleteAllFn()
        .then(function () {
          applyServerFilters(tabId, 1);
        })
        .catch(function () {
          // error already alerted inside nemkoDeleteAllEmployees
        })
        .finally(function () {
          btn.disabled = false;
        });
    });

  }

  // ─── Edit Modal field helpers ─────────────────────────────────────────────────
  function setField(modalEl, id, val) {
    const el = modalEl.querySelector('#' + id);
    if (el) el.value = val ?? '';
  }

  function setSelectById(modalEl, id, numId) {
    var el = modalEl.querySelector('#' + id);
    if (!el) return;
    if (numId == null) { el.selectedIndex = 0; }
    else {
      var opt = [...el.options].find(function(o) { return Number(o.value) === Number(numId); });
      el.selectedIndex = opt ? opt.index : 0;
    }
    if ($(el).hasClass('select2-hidden-accessible')) $(el).trigger('change');
  }

  function setSelectByText(modalEl, id, text) {
    var el = modalEl.querySelector('#' + id);
    if (!el) return;
    var opt = [...el.options].find(function(o) { return o.text === text || o.value === text; });
    el.selectedIndex = opt ? opt.index : 0;
    if ($(el).hasClass('select2-hidden-accessible')) $(el).trigger('change');
  }

  // Populate edit-modal dropdowns from cached reference data
  function populateEditSelects(modalEl) {
    function fillSelect(id, items) {
      var el = modalEl.querySelector('#' + id);
      if (!el) return;
      var currentVal = el.value;
      el.innerHTML = '<option value=""></option>';
      (items || []).forEach(function(item) {
        var opt = document.createElement('option');
        opt.value = String(item.id);
        opt.textContent = item.name;
        el.appendChild(opt);
      });
      if (currentVal) el.value = currentVal;
      if ($(el).hasClass('select2-hidden-accessible')) $(el).trigger('change');
    }
    fillSelect('editOffice',          window.nemkoRefOffices          || []);
    fillSelect('editApprovalManager', window.nemkoRefApprovalManagers || []);
    fillSelect('editDirectManger',    window.nemkoRefDirectManagers   || []);
    fillSelect('editLocalGMList',     window.nemkoRefLocalGMs         || []);
    fillSelect('editQualityManger',   window.nemkoRefQualityManagers  || []);
    fillSelect('editHRContact',       window.nemkoRefHRContacts       || []);
    fillSelect('editEmployeeType',    window.nemkoRefEmployeeTypes    || []);
  }

  function populateNewSelects(modalEl) {
    function fillSelect(id, items) {
      var el = modalEl.querySelector('#' + id);
      if (!el) return;
      var currentVal = el.value;
      el.innerHTML = '<option value=""></option>';
      (items || []).forEach(function(item) {
        var opt = document.createElement('option');
        opt.value = String(item.id);
        opt.textContent = item.name;
        el.appendChild(opt);
      });
      if (currentVal) el.value = currentVal;
      if ($(el).hasClass('select2-hidden-accessible')) $(el).trigger('change');
    }
    fillSelect('office',           window.nemkoRefOffices          || []);
    fillSelect('approvalManager',  window.nemkoRefApprovalManagers || []);
    fillSelect('directManger',     window.nemkoRefDirectManagers   || []);
    fillSelect('localGMList',      window.nemkoRefLocalGMs         || []);
    fillSelect('qualityManger',    window.nemkoRefQualityManagers  || []);
    fillSelect('HR-contact',       window.nemkoRefHRContacts       || []);
    fillSelect('newEmployeeType',  window.nemkoRefEmployeeTypes    || []);
  }

  // Populate from the API detail response (rich nested objects)
  function populateEditFromDetail(modalEl, d) {
    setField(modalEl, 'editFullName',  d.name);
    setField(modalEl, 'editEmailIp',   d.email);
    setField(modalEl, 'editLocation',  d.location?.name);
    setSelectById(modalEl, 'editEmployeeType', d.employeeType?.id);

    setSelectById(modalEl, 'editPersonalStatus',  d.personalStatus?.id);
    setSelectById(modalEl, 'editOffice',           d.office?.id);
    setSelectById(modalEl, 'editApprovalManager',  d.approvalManager?.id);
    setSelectById(modalEl, 'editDirectManger',     d.directManager?.id);
    setSelectById(modalEl, 'editLocalGMList',      d.localGM?.id);
    setSelectById(modalEl, 'editQualityManger',    d.qualityManager?.id);
    setSelectById(modalEl, 'editHRContact',        d.hrContact?.id);

    var radios = modalEl.querySelectorAll('input[name="editLeadershipFunction"]');
    if (radios.length >= 2) {
      radios[0].checked = !!d.leadershipFunction;
      radios[1].checked = !d.leadershipFunction;
    }

    var adminRadios = modalEl.querySelectorAll('input[name="editIsAdmin"]');
    if (adminRadios.length >= 2) {
      adminRadios[0].checked = !!d.isAdmin;
      adminRadios[1].checked = !d.isAdmin;
    }

    setField(modalEl, 'editEmployeeId', d.id);
  }

  // Fallback: populate from the table row data (no manager IDs available)
  function populateEditFromRow(modalEl, row) {
    setField(modalEl, 'editFullName', row.name);
    setField(modalEl, 'editEmailIp',  row.email);
    setField(modalEl, 'editLocation', row.location);
    setSelectByText(modalEl, 'editEmployeeType', row.employee_type);

    setSelectByText(modalEl, 'editPersonalStatus',  row.personal_status);
    setSelectByText(modalEl, 'editOffice',           row.office);
    setSelectByText(modalEl, 'editApprovalManager',  row.approval_manager);
    setSelectByText(modalEl, 'editDirectManger',     row.direct_manager);
    setSelectByText(modalEl, 'editLocalGMList',      row.localGM);
    setSelectByText(modalEl, 'editQualityManger',    row.quality_manager);
    setSelectByText(modalEl, 'editHRContact',        row.HR_contact);

    setField(modalEl, 'editEmployeeId', row.id || '');
  }

  // ─── Open Edit Modal ──────────────────────────────────────────────────────────
  function openEditModal(tabId, rowIndex) {
    const config  = tables[tabId];
    const modalEl = document.getElementById('empEditModal');
    if (!modalEl) { console.error('[Employees] #empEditModal not found'); return; }
    if (rowIndex < 0 || rowIndex >= config.rows.length) {
      console.warn('[Employees] openEditModal: invalid rowIndex', rowIndex);
      return;
    }

    config.editingIndex = rowIndex;
    const row = config.rows[rowIndex];

    // Show modal immediately; dim body while the detail API loads
    if (typeof window.showModal === 'function') window.showModal('empEditModal');

    const modalBody = modalEl.querySelector('.modal-body');
    function setLoading(on) {
      if (!modalBody) return;
      modalBody.style.opacity       = on ? '0.5' : '';
      modalBody.style.pointerEvents = on ? 'none' : '';
    }

    setLoading(true);

    var refFetchFn  = window.nemkoFetchEditRefData;
    var refPromise  = typeof refFetchFn  === 'function' ? refFetchFn()         : Promise.resolve();

    var fetchFn     = window.nemkoFetchEmployeeDetail;
    var detailPromise = (row.id && typeof fetchFn === 'function')
      ? fetchFn(row.id)
      : Promise.resolve();

    Promise.all([refPromise, detailPromise])
      .then(function () {
        populateEditSelects(modalEl);
        var detail = window.nemkoEmployeeDetail;
        if (detail) populateEditFromDetail(modalEl, detail);
        else        populateEditFromRow(modalEl, row);
      })
      .catch(function () {
        populateEditSelects(modalEl);
        populateEditFromRow(modalEl, row);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  // ─── Modal – Edit Employee ────────────────────────────────────────────────────
  function initEditModal(tabId) {
    const config  = tables[tabId];
    const modalEl = document.getElementById('empEditModal');
    if (!modalEl) return;

    // Edit button — re-attach on every init (clone to drop stale listeners)
    const editBtn = document.getElementById('emp-edit-btn');
    if (editBtn) {
      const freshBtn = editBtn.cloneNode(true);
      editBtn.parentNode.replaceChild(freshBtn, editBtn);

      freshBtn.addEventListener('click', function () {
        const container = document.getElementById(tabId);
        if (!container) return;
        const table = container.querySelector('table');
        if (!table) return;
        const checked = table.querySelector('.row-checkbox:checked');
        if (checked) {
          openEditModal(tabId, parseInt(checked.dataset.index, 10));
        } else {
          alert('Please select a row to edit.');
        }
      });
    }

    // Save / hidden listeners — attach only once
    if (modalEl.dataset.editListenerFor === tabId) return;
    modalEl.dataset.editListenerFor = tabId;

    const saveBtn = modalEl.querySelector('.modal-footer .nemko-btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        const id = Number(modalEl.querySelector('#editEmployeeId')?.value);
        if (!id) { console.warn('[Employees] editEmployeeId missing'); return; }

        const getText = function (fieldId) {
          return (modalEl.querySelector('#' + fieldId)?.value ?? '').trim();
        };
        const getNum = function (fieldId) {
          var v = modalEl.querySelector('#' + fieldId)?.value;
          return (v && v !== '') ? Number(v) : null;
        };

        var isValid = true;

        var nameEl = modalEl.querySelector('#editFullName');
        if (!getText('editFullName')) {
          nameEl && nameEl.classList.add('is-invalid');
          isValid = false;
        } else {
          nameEl && nameEl.classList.remove('is-invalid');
        }

        var emailEl = modalEl.querySelector('#editEmailIp');
        if (!getText('editEmailIp')) {
          emailEl && emailEl.classList.add('is-invalid');
          isValid = false;
        } else {
          emailEl && emailEl.classList.remove('is-invalid');
        }

        var psEl = modalEl.querySelector('#editPersonalStatus');
        if (!psEl || !psEl.value) {
          psEl && psEl.classList.add('is-invalid');
          isValid = false;
        } else {
          psEl && psEl.classList.remove('is-invalid');
        }

        var officeEl = modalEl.querySelector('#editOffice');
        var officeFb = officeEl && officeEl.closest('.form-control-col') && officeEl.closest('.form-control-col').querySelector('.invalid-feedback');
        if (!officeEl || !officeEl.value) {
          officeEl && officeEl.classList.add('is-invalid');
          if (officeFb) officeFb.style.display = 'block';
          isValid = false;
        } else {
          officeEl && officeEl.classList.remove('is-invalid');
          if (officeFb) officeFb.style.display = '';
        }

        var dmEl = modalEl.querySelector('#editDirectManger');
        var dmFb = dmEl && dmEl.closest('.form-control-col') && dmEl.closest('.form-control-col').querySelector('.invalid-feedback');
        if (!dmEl || !dmEl.value) {
          dmEl && dmEl.classList.add('is-invalid');
          if (dmFb) dmFb.style.display = 'block';
          isValid = false;
        } else {
          dmEl && dmEl.classList.remove('is-invalid');
          if (dmFb) dmFb.style.display = '';
        }

        if (!isValid) return;

        var radios = modalEl.querySelectorAll('input[name="editLeadershipFunction"]');
        var leadershipFunction = radios.length > 0 ? radios[0].checked : false;

        var adminRadios = modalEl.querySelectorAll('input[name="editIsAdmin"]');
        var isAdmin = adminRadios.length > 0 ? adminRadios[0].checked : false;

        var payload = {
          name:               getText('editFullName'),
          email:              getText('editEmailIp'),
          personalStatusId:   getNum('editPersonalStatus'),
          officeId:           getNum('editOffice'),
          approvalManagerId:  getNum('editApprovalManager'),
          directManagerId:    getNum('editDirectManger'),
          localGMId:          getNum('editLocalGMList'),
          qualityManagerId:   getNum('editQualityManger'),
          hrContactId:        getNum('editHRContact'),
          leadershipFunction: leadershipFunction,
          isAdmin:            isAdmin,
          employeeTypeId:     getNum('editEmployeeType'),
        };

        var saveFn = window.nemkoUpdateEmployee;
        if (typeof saveFn !== 'function') {
          console.warn('[Employees] window.nemkoUpdateEmployee not registered');
          return;
        }

        saveBtn.disabled = true;

        saveFn(id, payload)
          .then(function () {
            if (typeof window.hideModal === 'function') window.hideModal('empEditModal');
            var currentPage = (config.paginationMeta && config.paginationMeta.pageNumber) || 1;
            applyServerFilters(tabId, currentPage);
            alert('Employee "' + payload.name + '" successfully updated.')
          })
          .catch(function () {
            
          })
          .finally(function () {
            saveBtn.disabled = false;
          });
      });
    }

    modalEl.addEventListener('hidden.bs.modal', function () {
      config.editingIndex = -1;
      modalEl.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
      modalEl.querySelectorAll('.invalid-feedback').forEach(function (el) { el.style.display = ''; });
    });
  }

  // ─── Modal – New Employee ─────────────────────────────────────────────────────
  function resetNewModal(modalEl) {
    modalEl.querySelectorAll('input[type="text"], input[type="email"]').forEach(function (el) { el.value = ''; });
    modalEl.querySelectorAll('select').forEach(function (el) {
      el.selectedIndex = 0;
      if ($(el).hasClass('select2-hidden-accessible')) $(el).val(null).trigger('change');
    });
    var radios = modalEl.querySelectorAll('input[name="radioDefault2"]');
    radios.forEach(function (r) { r.checked = false; });
    if (radios.length) radios[radios.length - 1].checked = true;
    var adminRadios = modalEl.querySelectorAll('input[name="newIsAdmin"]');
    adminRadios.forEach(function (r) { r.checked = false; });
    if (adminRadios.length) adminRadios[adminRadios.length - 1].checked = true;
    modalEl.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
    modalEl.querySelectorAll('.invalid-feedback').forEach(function (el) { el.style.display = ''; });
  }

  function openNewModal(tabId) {
    var modalEl = document.getElementById('empNewModal');
    if (!modalEl) { console.error('[Employees] #empNewModal not found'); return; }

    resetNewModal(modalEl);
    if (typeof window.showModal === 'function') window.showModal('empNewModal');

    var modalBody = modalEl.querySelector('.modal-body');
    function setLoading(on) {
      if (!modalBody) return;
      modalBody.style.opacity       = on ? '0.5' : '';
      modalBody.style.pointerEvents = on ? 'none' : '';
    }

    setLoading(true);

    var refFetchFn = window.nemkoFetchEditRefData;
    var refPromise = typeof refFetchFn === 'function' ? refFetchFn() : Promise.resolve();

    refPromise
      .then(function () {
        populateNewSelects(modalEl);
        // Populate personal-status dropdown (same source as edit modal)
        var statuses = window.nemkoPersonalStatuses || [];
        var statusEl = modalEl.querySelector('#personalStatus');
        if (statusEl) {
          statusEl.innerHTML = '<option value="" disabled selected></option>';
          statuses.forEach(function (s) {
            var opt = document.createElement('option');
            opt.value = String(s.id);
            opt.textContent = s.name;
            statusEl.appendChild(opt);
          });
        }
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }

  function initNewModal(tabId) {
    const modalEl = document.getElementById('empNewModal');
    if (!modalEl) {
      console.error('[Employees] #empNewModal not found — check moveModalsToBody()');
      return;
    }

    // New button — clone to drop stale listeners (same pattern as edit button)
    var newBtn = document.getElementById('emp-new-btn');
    if (newBtn) {
      var freshBtn = newBtn.cloneNode(true);
      newBtn.parentNode.replaceChild(freshBtn, newBtn);
      freshBtn.addEventListener('click', function () { openNewModal(tabId); });
    }

    // Save / hidden listeners — attach only once
    if (modalEl.dataset.newListenerFor === tabId) return;
    modalEl.dataset.newListenerFor = tabId;

    var saveBtn = modalEl.querySelector('.modal-footer .nemko-btn-save');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function () {
      const fullName = (modalEl.querySelector('#fullName')?.value ?? '').trim();
      const email    = (modalEl.querySelector('#emailIp')?.value  ?? '').trim();

      var isValid = true;

      var nameEl = modalEl.querySelector('#fullName');
      if (!fullName) {
        nameEl && nameEl.classList.add('is-invalid');
        isValid = false;
      } else {
        nameEl && nameEl.classList.remove('is-invalid');
      }

      var emailEl = modalEl.querySelector('#emailIp');
      if (!email) {
        emailEl && emailEl.classList.add('is-invalid');
        isValid = false;
      } else {
        emailEl && emailEl.classList.remove('is-invalid');
      }

      var psEl = modalEl.querySelector('#personalStatus');
      if (!psEl || !psEl.value) {
        psEl && psEl.classList.add('is-invalid');
        isValid = false;
      } else {
        psEl && psEl.classList.remove('is-invalid');
      }

      var officeEl = modalEl.querySelector('#office');
      var officeFb = officeEl && officeEl.closest('.form-control-col') && officeEl.closest('.form-control-col').querySelector('.invalid-feedback');
      if (!officeEl || !officeEl.value) {
        officeEl && officeEl.classList.add('is-invalid');
        if (officeFb) officeFb.style.display = 'block';
        isValid = false;
      } else {
        officeEl && officeEl.classList.remove('is-invalid');
        if (officeFb) officeFb.style.display = '';
      }

      var dmEl = modalEl.querySelector('#directManger');
      var dmFb = dmEl && dmEl.closest('.form-control-col') && dmEl.closest('.form-control-col').querySelector('.invalid-feedback');
      if (!dmEl || !dmEl.value) {
        dmEl && dmEl.classList.add('is-invalid');
        if (dmFb) dmFb.style.display = 'block';
        isValid = false;
      } else {
        dmEl && dmEl.classList.remove('is-invalid');
        if (dmFb) dmFb.style.display = '';
      }

      if (!isValid) return;

      const getNum = function (id) {
        var el = modalEl.querySelector('#' + id);
        return (el && el.value && el.value !== '') ? Number(el.value) : null;
      };

      var leadershipRadios = modalEl.querySelectorAll('input[name="radioDefault2"]');
      var leadershipFunction = leadershipRadios.length > 0 ? leadershipRadios[0].checked : false;

      var adminRadios = modalEl.querySelectorAll('input[name="newIsAdmin"]');
      var isAdmin = adminRadios.length > 0 ? adminRadios[0].checked : false;

      var payload = {
        name:               fullName,
        email:              email,
        personalStatusId:   getNum('personalStatus'),
        officeId:           getNum('office'),
        approvalManagerId:  getNum('approvalManager'),
        directManagerId:    getNum('directManger'),
        localGMId:          getNum('localGMList'),
        employeeTypeId:     getNum('newEmployeeType'),
        qualityManagerId:   getNum('qualityManger'),
        hrContactId:        getNum('HR-contact'),
        leadershipFunction: leadershipFunction,
        isAdmin:            isAdmin,
      };

      var createFn = window.nemkoCreateEmployee;
      if (typeof createFn !== 'function') {
        console.warn('[Employees] window.nemkoCreateEmployee not registered');
        return;
      }

      saveBtn.disabled = true;

      createFn(payload)
        .then(function () {
          if (typeof window.hideModal === 'function') window.hideModal('empNewModal');
          applyServerFilters(tabId, 1);
          alert('Employee "' + payload.name + '" successfully created.')
        })
        .catch(function () {
          // error already alerted inside nemkoCreateEmployee
        })
        .finally(function () {
          saveBtn.disabled = false;
        });
    });

    modalEl.addEventListener('hidden.bs.modal', function () {
      resetNewModal(modalEl);
    });
  }

  // ─── Tab Switch ───────────────────────────────────────────────────────────────
  // Namespaced so WpEmployeesWebPart.dispose() can remove it during SPA navigation
  $(document).on('click.nemkoEmployees', '.submenu-list-btn, .nemko-tab-btn', function () {
    const tabId = $(this).data('tab-id');
    $('.submenu-list-btn').removeClass('active-submenu');
    $('.nemko-tab-btn').removeClass('nemko-tab-btn-active');
    $('.nemko-data-table-wrapper').hide();
    $(`[data-tab-id="${tabId}"]`).each(function () {
      if ($(this).hasClass('submenu-list-btn')) $(this).addClass('active-submenu');
      if ($(this).hasClass('nemko-tab-btn'))    $(this).addClass('nemko-tab-btn-active');
    });
    $(`#${tabId}`).fadeIn();
  });

  // ─── Init All Tables ──────────────────────────────────────────────────────────
  function initAllTables() {
    // Seed pagination meta from window before first render
    const initPagination = window.nemkoEmployeeAdminPagination || null;
    Object.keys(tables).forEach(tabId => {
      if (!tables[tabId].paginationMeta) {
        tables[tabId].paginationMeta = initPagination;
      }
    });

    populateStatusDropdowns();

    Object.keys(tables).forEach(tabId => {
      buildDropdown(tabId);
      renderTable(tabId);
      initSearch(tabId);
      initDelete(tabId);
      initNewModal(tabId);
      initEditModal(tabId);
    });
  }

  initAllTables();

  // ─── External hooks (called by WpEmployeesWebPart after cached script hit) ───
  window.__initEmployeeTables = initAllTables;

  window.__reloadEmployeeTable = function () {
    const incoming   = window.nemkoEmployeeAdminRows       || window.__employeeTableData || [];
    const pagination = window.nemkoEmployeeAdminPagination || null;
    Object.keys(tables).forEach(tabId => {
      tables[tabId].rows          = [...incoming];
      tables[tabId]._allRows      = [...incoming];
      tables[tabId].paginationMeta = pagination;
      renderTable(tabId);
    });
    populateStatusDropdowns();
  };

  // ─── Select2 ─────────────────────────────────────────────────────────────────
  $(".select2-common").select2({
    placeholder: "",
    selectionCssClass: "nemko-select-2",
    dropdownCssClass:  "nemko-select-2-dropdown"
  });

  document.querySelectorAll(".frm-right-close-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const parent = this.closest(".form-control-col");
      parent.querySelectorAll("select").forEach(select => {
        [...select.options].forEach(option => { option.selected = false; });
        if ($(select).hasClass("select2-hidden-accessible")) {
          $(select).val([]).trigger("change");
        }
      });
    });
  });

})();
