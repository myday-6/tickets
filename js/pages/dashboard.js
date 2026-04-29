/* ============================================================
   dashboard.js - 티켓 리스트 & 인라인 편집 페이지
   ============================================================ */

const DashboardPage = (() => {
  const el = () => document.getElementById('page-dashboard');

  let viewMode  = 'table'; // 'table' | 'card'
  let filters   = { concert: '', date: '', account: '', status: '', search: '' };
  let sortKey   = 'concert'; // 'concert' | 'concertDate' | 'status'
  let dirtyRows = {}; // { ticketId: patchedData }
  let colorMap  = null; // 콘서트/날짜 컬러 맵

  // ─── 렌더 ─────────────────────────────────────────────────
  function render() {
    // 컬러 맵 매 렌더마다 재빌드 (콘서트 추가/변경 반영)
    colorMap = Utils.buildColorMap(Store.getConcerts(), Store.getConcertDates());

    el().innerHTML = `
      <div class="page-header">
        <h2 class="page-title">📋 티켓 리스트</h2>
        <div class="view-toggle">
          <button class="view-btn ${viewMode === 'table' ? 'active' : ''}" id="view-table-btn" title="테이블 보기">☰</button>
          <button class="view-btn ${viewMode === 'card'  ? 'active' : ''}" id="view-card-btn"  title="카드 보기">⊞</button>
        </div>
      </div>

      ${renderColorLegend()}
      ${renderFilterBar()}

      <div id="ticket-list-area">
        ${renderTicketList()}
      </div>
    `;
    bindEvents();
  }

  // ─── 컬러 범례 ────────────────────────────────────────────
  function renderColorLegend() {
    const concerts = Store.getConcerts();
    if (concerts.length === 0) return '';

    const items = concerts.map(c => {
      const def = colorMap.getColorDef(c.id);
      return `
        <span class="legend-item" style="border-left: 3px solid ${def.border}; background: ${def.light}; color: ${def.text};">
          <span class="legend-dot" style="background:${def.border};"></span>
          ${Utils.escapeHtml(c.concertName)}
        </span>
      `;
    }).join('');

    return `
      <div class="concert-legend">
        <span class="legend-label">🎨 콘서트별 색상</span>
        <div class="legend-items">${items}</div>
        <span class="legend-hint">※ 같은 콘서트 내 밝은/진한 배경 = 날짜 구분</span>
      </div>
    `;
  }

  // ─── 필터 바 ──────────────────────────────────────────────
  function renderFilterBar() {
    const concerts = Store.getConcerts();
    const dates    = Store.getConcertDates();
    const accounts = Store.getAccounts();

    const concertDatesForFilter = filters.concert
      ? dates.filter(d => d.concertId === filters.concert)
      : dates;

    return `
      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">콘서트</label>
            <select class="filter-select" id="f-concert">
              <option value="">전체</option>
              ${concerts.map(c => {
                const def = colorMap.getColorDef(c.id);
                return `<option value="${c.id}" ${filters.concert === c.id ? 'selected' : ''}
                  style="background:${def.light}; color:${def.text};">${Utils.escapeHtml(c.concertName)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">공연날짜</label>
            <select class="filter-select" id="f-date">
              <option value="">전체</option>
              ${concertDatesForFilter.map(d => {
                const bg = colorMap.getDateBg(d.concertId, d.id);
                return `<option value="${d.id}" ${filters.date === d.id ? 'selected' : ''}
                  style="background:${bg};">${Utils.escapeHtml(d.concertDate)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">계정</label>
            <select class="filter-select" id="f-account">
              <option value="">전체</option>
              ${accounts.map(a => `<option value="${a.id}" ${filters.account === a.id ? 'selected' : ''}>${Utils.escapeHtml(a.accountName)}</option>`).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">상태</label>
            <select class="filter-select" id="f-status">
              <option value="">전체</option>
              ${Utils.ATTENDANCE.map(v  => `<option value="${v}" ${filters.status === v ? 'selected' : ''}>${Utils.escapeHtml(v)}</option>`).join('')}
              ${Utils.SALE_RESULTS.map(v => `<option value="${v}" ${filters.status === v ? 'selected' : ''}>${Utils.escapeHtml(v)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-group filter-search">
            <label class="filter-label">검색</label>
            <input class="filter-input" id="f-search" type="text" placeholder="구역, 좌석번호, 메모 검색..."
                   value="${Utils.escapeHtml(filters.search)}">
          </div>
          <div class="filter-group">
            <label class="filter-label">정렬</label>
            <select class="filter-select" id="f-sort">
              <option value="concert"     ${sortKey === 'concert'     ? 'selected' : ''}>콘서트별</option>
              <option value="concertDate" ${sortKey === 'concertDate' ? 'selected' : ''}>콘서트+날짜별</option>
              <option value="status"      ${sortKey === 'status'      ? 'selected' : ''}>상태별</option>
            </select>
          </div>
          <button class="btn btn-ghost btn-sm" id="clear-filters-btn">필터 초기화</button>
        </div>
      </div>
    `;
  }

  function renderTicketList() {
    const tickets = getFilteredSortedTickets();

    if (tickets.length === 0) {
      return `<div class="empty-state"><span class="empty-icon">🎫</span><p>표시할 티켓이 없습니다.</p></div>`;
    }

    const countBadge = `<div class="result-count">${tickets.length}건</div>`;
    return viewMode === 'table'
      ? countBadge + renderTable(tickets)
      : countBadge + renderCards(tickets);
  }

  // ─── 테이블 뷰 ────────────────────────────────────────────
  function renderTable(tickets) {
    const rows = tickets.map(t => renderTableRow(t)).join('');
    return `
      <div class="table-wrapper">
        <table class="ticket-table">
          <thead>
            <tr>
              <th>콘서트</th>
              <th>공연날짜</th>
              <th>계정</th>
              <th>유형</th>
              <th>구역</th>
              <th>열</th>
              <th>좌석</th>
              <th>상태</th>
              <th>판매경로</th>
              <th>판매결과</th>
              <th>완료상세</th>
              <th>메모</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderTableRow(t) {
    const dirty   = dirtyRows[t.id] || {};
    const current = { ...t, ...dirty };

    const concert     = Store.getConcertById(t.concertId);
    const concertDate = Store.getConcertDateById(t.concertDateId);
    const account     = Store.getAccountById(t.accountId);
    const colorDef    = colorMap.getColorDef(t.concertId);

    const isSale      = current.attendanceType === '판매';
    const isCompleted = current.saleResult === '판매완료';
    const isDirty     = !!dirtyRows[t.id];

    // 날짜별 배경 + 콘서트별 왼쪽 테두리
    const rowStyle = isDirty
      ? `border-left: 4px solid ${colorDef.border};`
      : colorMap.getConcertStyle(t.concertId, t.concertDateId);

    return `
      <tr data-id="${t.id}" class="${isDirty ? 'row-dirty' : ''}" style="${rowStyle}">
        <td class="td-concert" style="color:${colorDef.text}; font-weight:700;">
          ${Utils.escapeHtml(concert?.concertName || '-')}
        </td>
        <td class="td-nowrap">
          <span class="date-chip" style="background:${colorDef.border}22; color:${colorDef.text}; border:1px solid ${colorDef.border};">
            ${Utils.escapeHtml(concertDate?.concertDate || '-')}
          </span>
        </td>
        <td>${Utils.escapeHtml(account?.accountName || '-')}</td>
        <td><span class="badge ${Utils.getStatusBadgeClass('idType', account?.idType)}">${Utils.escapeHtml(account?.idType || '-')}</span></td>
        <td>${Utils.escapeHtml(current.section    || '-')}</td>
        <td>${Utils.escapeHtml(current.row        || '-')}</td>
        <td>${Utils.escapeHtml(current.seatNumber || '-')}</td>

        <td>
          <select class="inline-select" data-field="attendanceType" data-id="${t.id}">
            <option value="">-</option>
            ${Utils.buildOptions(Utils.ATTENDANCE, current.attendanceType)}
          </select>
        </td>

        <td>
          ${isSale ? `
            <select class="inline-select" data-field="saleChannel" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_CHANNELS, current.saleChannel)}
            </select>
          ` : '<span class="td-disabled">-</span>'}
        </td>

        <td>
          ${isSale ? `
            <select class="inline-select" data-field="saleResult" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_RESULTS, current.saleResult)}
            </select>
          ` : '<span class="td-disabled">-</span>'}
        </td>

        <td>
          ${(isSale && isCompleted) ? `
            <select class="inline-select" data-field="saleCompletedDetail" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_DETAILS, current.saleCompletedDetail)}
            </select>
          ` : '<span class="td-disabled">-</span>'}
        </td>

        <td>
          <input class="inline-input" type="text" placeholder="메모"
                 data-field="memo" data-id="${t.id}"
                 value="${Utils.escapeHtml(current.memo || '')}">
        </td>

        <td class="td-actions">
          ${isDirty ? `<button class="btn btn-xs btn-primary save-row-btn" data-id="${t.id}">💾</button>` : ''}
          <button class="btn btn-xs btn-danger-outline delete-ticket-btn" data-id="${t.id}">🗑️</button>
        </td>
      </tr>
    `;
  }

  // ─── 카드 뷰 ──────────────────────────────────────────────
  function renderCards(tickets) {
    return `<div class="ticket-cards">${tickets.map(t => renderTicketCard(t)).join('')}</div>`;
  }

  function renderTicketCard(t) {
    const concert     = Store.getConcertById(t.concertId);
    const concertDate = Store.getConcertDateById(t.concertDateId);
    const account     = Store.getAccountById(t.accountId);
    const dirty       = dirtyRows[t.id] || {};
    const current     = { ...t, ...dirty };
    const isSale      = current.attendanceType === '판매';
    const isCompleted = current.saleResult === '판매완료';
    const isDirty     = !!dirtyRows[t.id];

    const colorDef = colorMap.getColorDef(t.concertId);
    const bgColor  = colorMap.getDateBg(t.concertId, t.concertDateId);

    return `
      <div class="ticket-card ${isDirty ? 'card-dirty' : ''}" data-id="${t.id}"
           style="border-top: 4px solid ${colorDef.border}; background: ${bgColor};">

        <!-- 콘서트 + 날짜 헤더 -->
        <div class="ticket-card-header">
          <div>
            <div class="ticket-card-concert" style="color:${colorDef.text};">
              ${Utils.escapeHtml(concert?.concertName || '-')}
            </div>
            <div class="ticket-card-date">
              <span class="date-chip" style="background:${colorDef.border}33; color:${colorDef.text}; border:1px solid ${colorDef.border};">
                📅 ${Utils.escapeHtml(concertDate?.concertDate || '-')}
              </span>
            </div>
          </div>
          <div class="ticket-card-seat">
            <span class="seat-section" style="background:${colorDef.border}44; color:${colorDef.text};">
              ${Utils.escapeHtml(current.section || '-')}
            </span>
            ${current.row ? `<span class="seat-row">${Utils.escapeHtml(current.row)}열</span>` : ''}
            <span class="seat-num">${Utils.escapeHtml(current.seatNumber || '-')}번</span>
          </div>
        </div>

        <div class="ticket-card-account">
          <span>${Utils.escapeHtml(account?.accountName || '-')}</span>
          <span class="badge ${Utils.getStatusBadgeClass('idType', account?.idType)}">${Utils.escapeHtml(account?.idType || '-')}</span>
        </div>

        <div class="ticket-card-fields" style="background:rgba(255,255,255,0.55); border-radius:10px; padding:10px;">
          <div class="card-field">
            <label>상태</label>
            <select class="inline-select" data-field="attendanceType" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.ATTENDANCE, current.attendanceType)}
            </select>
          </div>
          ${isSale ? `
          <div class="card-field">
            <label>판매경로</label>
            <select class="inline-select" data-field="saleChannel" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_CHANNELS, current.saleChannel)}
            </select>
          </div>
          <div class="card-field">
            <label>판매결과</label>
            <select class="inline-select" data-field="saleResult" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_RESULTS, current.saleResult)}
            </select>
          </div>
          ` : ''}
          ${(isSale && isCompleted) ? `
          <div class="card-field">
            <label>완료상세</label>
            <select class="inline-select" data-field="saleCompletedDetail" data-id="${t.id}">
              <option value="">-</option>
              ${Utils.buildOptions(Utils.SALE_DETAILS, current.saleCompletedDetail)}
            </select>
          </div>
          ` : ''}
          <div class="card-field card-field-full">
            <label>메모</label>
            <input class="inline-input" type="text" placeholder="메모 입력"
                   data-field="memo" data-id="${t.id}"
                   value="${Utils.escapeHtml(current.memo || '')}">
          </div>
        </div>

        <div class="ticket-card-actions">
          ${isDirty ? `<button class="btn btn-sm btn-primary save-row-btn" data-id="${t.id}">💾 저장</button>` : ''}
          <button class="btn btn-sm btn-danger-outline delete-ticket-btn" data-id="${t.id}">🗑️ 삭제</button>
        </div>
      </div>
    `;
  }

  // ─── 필터 & 정렬 ──────────────────────────────────────────
  function getFilteredSortedTickets() {
    let tickets = Store.getTickets();

    if (filters.concert)  tickets = tickets.filter(t => t.concertId === filters.concert);
    if (filters.date)     tickets = tickets.filter(t => t.concertDateId === filters.date);
    if (filters.account)  tickets = tickets.filter(t => t.accountId === filters.account);
    if (filters.status) {
      tickets = tickets.filter(t =>
        t.attendanceType === filters.status ||
        t.saleResult     === filters.status
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tickets = tickets.filter(t =>
        (t.section    || '').toLowerCase().includes(q) ||
        (t.seatNumber || '').toLowerCase().includes(q) ||
        (t.memo       || '').toLowerCase().includes(q) ||
        (t.row        || '').toLowerCase().includes(q)
      );
    }

    tickets.sort((a, b) => {
      const cA = Store.getConcertById(a.concertId)?.concertName || '';
      const cB = Store.getConcertById(b.concertId)?.concertName || '';
      const dA = Store.getConcertDateById(a.concertDateId)?.concertDate || '';
      const dB = Store.getConcertDateById(b.concertDateId)?.concertDate || '';

      if (sortKey === 'concert')     return cA.localeCompare(cB, 'ko');
      if (sortKey === 'concertDate') { const c = cA.localeCompare(cB, 'ko'); return c !== 0 ? c : dA.localeCompare(dB); }
      if (sortKey === 'status')      return (a.attendanceType || '').localeCompare(b.attendanceType || '', 'ko');
      return 0;
    });

    return tickets;
  }

  // ─── 이벤트 바인딩 ────────────────────────────────────────
  function bindEvents() {
    document.getElementById('view-table-btn')?.addEventListener('click', () => {
      viewMode = 'table';
      refreshList();
      document.getElementById('view-table-btn')?.classList.add('active');
      document.getElementById('view-card-btn')?.classList.remove('active');
    });
    document.getElementById('view-card-btn')?.addEventListener('click', () => {
      viewMode = 'card';
      refreshList();
      document.getElementById('view-card-btn')?.classList.add('active');
      document.getElementById('view-table-btn')?.classList.remove('active');
    });

    document.getElementById('f-concert')?.addEventListener('change', e => {
      filters.concert = e.target.value;
      filters.date    = '';
      render();
    });
    document.getElementById('f-date')?.addEventListener('change', e => {
      filters.date = e.target.value; refreshList();
    });
    document.getElementById('f-account')?.addEventListener('change', e => {
      filters.account = e.target.value; refreshList();
    });
    document.getElementById('f-status')?.addEventListener('change', e => {
      filters.status = e.target.value; refreshList();
    });

    const debouncedSearch = Utils.debounce(e => {
      filters.search = e.target.value; refreshList();
    }, 300);
    document.getElementById('f-search')?.addEventListener('input', debouncedSearch);

    document.getElementById('f-sort')?.addEventListener('change', e => {
      sortKey = e.target.value; refreshList();
    });

    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
      filters   = { concert: '', date: '', account: '', status: '', search: '' };
      sortKey   = 'concert';
      dirtyRows = {};
      render();
    });

    bindListEvents();
  }

  // ─── 인라인 편집 이벤트 ────────────────────────────────────
  function onFieldChange(target) {
    const id    = target.dataset.id;
    const field = target.dataset.field;
    const val   = target.value;

    if (!dirtyRows[id]) {
      const orig = Store.getTickets().find(t => t.id === id);
      dirtyRows[id] = orig ? { ...orig } : {};
    }

    dirtyRows[id][field] = val;

    // 상태 연동 UX
    if (field === 'attendanceType' && val !== '판매') {
      dirtyRows[id].saleChannel = '';
      dirtyRows[id].saleResult  = '';
      dirtyRows[id].saleCompletedDetail = '';
    }
    if (field === 'saleChannel' && val) {
      dirtyRows[id].saleResult = '판매중';
    }
    if (field === 'saleResult' && val !== '판매완료') {
      dirtyRows[id].saleCompletedDetail = '';
    }

    // 조건부 필드가 바뀌면 전체 리프레시 (드롭다운 show/hide)
    if (['attendanceType', 'saleResult'].includes(field)) {
      refreshList();
    } else {
      refreshSaveBtns();
    }
  }

  function refreshSaveBtns() {
    el().querySelectorAll('tr[data-id], .ticket-card[data-id]').forEach(row => {
      const id      = row.dataset.id;
      const isDirty = !!dirtyRows[id];
      row.classList.toggle('row-dirty', isDirty);
      row.classList.toggle('card-dirty', isDirty);

      const existingBtn = row.querySelector('.save-row-btn');
      const actionsEl   = row.querySelector('.td-actions, .ticket-card-actions');
      if (isDirty && !existingBtn && actionsEl) {
        const btn = document.createElement('button');
        btn.className   = 'btn btn-xs btn-primary save-row-btn';
        btn.dataset.id  = id;
        btn.textContent = '💾';
        btn.addEventListener('click', () => saveRow(id));
        actionsEl.insertBefore(btn, actionsEl.firstChild);
      } else if (!isDirty && existingBtn) {
        existingBtn.remove();
      }
    });
  }

  function refreshList() {
    const area = document.getElementById('ticket-list-area');
    if (area) area.innerHTML = renderTicketList();
    bindListEvents();
  }

  function bindListEvents() {
    el().querySelectorAll('select.inline-select').forEach(sel => {
      sel.addEventListener('change', e => onFieldChange(e.target));
    });
    el().querySelectorAll('input.inline-input').forEach(inp => {
      inp.addEventListener('input', Utils.debounce(e => onFieldChange(e.target), 300));
    });
    el().querySelectorAll('.save-row-btn').forEach(btn => {
      btn.addEventListener('click', () => saveRow(btn.dataset.id));
    });
    el().querySelectorAll('.delete-ticket-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
  }

  // ─── 저장 ─────────────────────────────────────────────────
  async function saveRow(id) {
    const data = dirtyRows[id];
    if (!data) return;
    try {
      Loader.show('저장 중...');
      await Store.editTicket(data);
      delete dirtyRows[id];
      refreshList();
      Toast.success('저장되었습니다.');
    } catch (e) {
      Toast.error('저장 실패: ' + e.message);
    } finally {
      Loader.hide();
    }
  }

  // ─── 삭제 ─────────────────────────────────────────────────
  async function handleDelete(id) {
    const ticket = Store.getTickets().find(t => t.id === id);
    if (!ticket) return;

    const concert     = Store.getConcertById(ticket.concertId);
    const concertDate = Store.getConcertDateById(ticket.concertDateId);
    const account     = Store.getAccountById(ticket.accountId);

    const msg = [
      `아래 티켓을 삭제하시겠습니까?`,
      `콘서트: ${concert?.concertName || '-'}`,
      `날짜: ${concertDate?.concertDate || '-'}`,
      `계정: ${account?.accountName || '-'} / 구역: ${ticket.section} ${ticket.row}열 ${ticket.seatNumber}번`,
    ].join('\n');

    const ok = await Modal.confirm(msg, '티켓 삭제');
    if (!ok) return;

    try {
      Loader.show('삭제 중...');
      await Store.removeTicket(id);
      delete dirtyRows[id];
      refreshList();
      Toast.success('티켓이 삭제되었습니다.');
    } catch (e) {
      Toast.error('삭제 실패: ' + e.message);
    } finally {
      Loader.hide();
    }
  }

  return { render };
})();
