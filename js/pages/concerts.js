/* ============================================================
   concerts.js - 콘서트 & 공연날짜 관리 페이지
   ============================================================ */

const ConcertsPage = (() => {
  const el = () => document.getElementById('page-concerts');

  function render() {
    const concerts = Store.getConcerts();
    el().innerHTML = `
      <div class="page-header">
        <h2 class="page-title">🎵 콘서트 관리</h2>
        <button class="btn btn-primary" id="add-concert-btn">+ 콘서트 추가</button>
      </div>
      ${concerts.length === 0
        ? `<div class="empty-state"><span class="empty-icon">🎵</span><p>등록된 콘서트가 없습니다.</p></div>`
        : `<div class="concert-list">${concerts.map(renderConcertCard).join('')}</div>`
      }
    `;
    bindEvents();
  }

  function renderConcertCard(concert) {
    const dates  = Store.getDatesByConcert(concert.id);
    const sorted = [...dates].sort((a, b) => a.concertDate.localeCompare(b.concertDate));

    return `
      <div class="concert-card" data-id="${concert.id}">
        <div class="concert-card-header">
          <div class="concert-card-title-row">
            <span class="concert-name">${Utils.escapeHtml(concert.concertName)}</span>
            <span class="badge badge-lavender">${dates.length}회차</span>
          </div>
          <div class="concert-card-actions">
            <button class="btn btn-sm btn-outline edit-concert-btn" data-id="${concert.id}">✏️ 수정</button>
            <button class="btn btn-sm btn-danger-outline delete-concert-btn" data-id="${concert.id}">🗑️ 삭제</button>
          </div>
        </div>

        <div class="date-list">
          ${sorted.length === 0
            ? '<p class="date-empty">공연날짜가 없습니다.</p>'
            : sorted.map(d => renderDateRow(d)).join('')
          }
        </div>
        <button class="btn btn-sm btn-outline add-date-btn" data-concert-id="${concert.id}">
          + 공연날짜 추가
        </button>
      </div>
    `;
  }

  function renderDateRow(date) {
    return `
      <div class="date-row" data-date-id="${date.id}">
        <span class="date-text">📅 ${Utils.escapeHtml(date.concertDate)}</span>
        <div class="date-actions">
          <button class="btn btn-xs btn-outline edit-date-btn" data-id="${date.id}">✏️</button>
          <button class="btn btn-xs btn-danger-outline delete-date-btn" data-id="${date.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('add-concert-btn')?.addEventListener('click', openAddConcertModal);

    el().querySelectorAll('.edit-concert-btn').forEach(btn =>
      btn.addEventListener('click', () => openEditConcertModal(btn.dataset.id)));

    el().querySelectorAll('.delete-concert-btn').forEach(btn =>
      btn.addEventListener('click', () => handleDeleteConcert(btn.dataset.id)));

    el().querySelectorAll('.add-date-btn').forEach(btn =>
      btn.addEventListener('click', () => openAddDateModal(btn.dataset.concertId)));

    el().querySelectorAll('.edit-date-btn').forEach(btn =>
      btn.addEventListener('click', () => openEditDateModal(btn.dataset.id)));

    el().querySelectorAll('.delete-date-btn').forEach(btn =>
      btn.addEventListener('click', () => handleDeleteDate(btn.dataset.id)));
  }

  // ─── 콘서트 모달 ──────────────────────────────────────────
  function openAddConcertModal() {
    Modal.open({
      title: '콘서트 추가',
      body: buildConcertForm({}),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-concert-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-concert-btn').addEventListener('click', async () => {
          const name = document.getElementById('concert-name')?.value.trim();
          if (!name) { Toast.warning('콘서트 이름을 입력해주세요.'); return; }
          try {
            Loader.show('저장 중...');
            await Store.addConcert({ concertName: name });
            Modal.close();
            render();
            Toast.success('콘서트가 추가되었습니다.');
          } catch (e) {
            Toast.error('저장 실패: ' + e.message);
          } finally { Loader.hide(); }
        });
      }
    });
  }

  function openEditConcertModal(id) {
    const concert = Store.getConcertById(id);
    if (!concert) return;
    Modal.open({
      title: '콘서트 수정',
      body: buildConcertForm(concert),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-concert-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-concert-btn').addEventListener('click', async () => {
          const name = document.getElementById('concert-name')?.value.trim();
          if (!name) { Toast.warning('콘서트 이름을 입력해주세요.'); return; }
          try {
            Loader.show('저장 중...');
            await Store.editConcert({ ...concert, concertName: name });
            Modal.close();
            render();
            Toast.success('콘서트가 수정되었습니다.');
          } catch (e) {
            Toast.error('수정 실패: ' + e.message);
          } finally { Loader.hide(); }
        });
      }
    });
  }

  async function handleDeleteConcert(id) {
    const concert = Store.getConcertById(id);
    if (!concert) return;
    const dates   = Store.getDatesByConcert(id);
    const tickets = Store.getTickets().filter(t => t.concertId === id);

    let msg = `"${concert.concertName}"을(를) 삭제하시겠습니까?`;
    if (dates.length || tickets.length) {
      msg += `\n\n연결된 공연날짜 ${dates.length}건, 티켓 ${tickets.length}건이 함께 삭제됩니다.`;
    }

    const ok = await Modal.confirm(msg, '콘서트 삭제');
    if (!ok) return;
    try {
      Loader.show('삭제 중...');
      await Store.removeConcert(id);
      render();
      Toast.success('콘서트가 삭제되었습니다.');
    } catch (e) {
      Toast.error('삭제 실패: ' + e.message);
    } finally { Loader.hide(); }
  }

  function buildConcertForm(concert = {}) {
    return `
      <div class="form-group">
        <label class="form-label" for="concert-name">콘서트 이름 <span class="required">*</span></label>
        <input class="form-input" id="concert-name" type="text" placeholder="콘서트 이름 입력"
               value="${Utils.escapeHtml(concert.concertName || '')}">
      </div>
    `;
  }

  // ─── 공연날짜 모달 ────────────────────────────────────────
  function openAddDateModal(concertId) {
    const concert = Store.getConcertById(concertId);
    if (!concert) return;
    Modal.open({
      title: `공연날짜 추가 — ${concert.concertName}`,
      body: buildDateForm({}),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-date-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-date-btn').addEventListener('click', async () => {
          const date = document.getElementById('concert-date')?.value;
          if (!date) { Toast.warning('공연날짜를 입력해주세요.'); return; }
          try {
            Loader.show('저장 중...');
            await Store.addConcertDate({ concertId, concertDate: date });
            Modal.close();
            render();
            Toast.success('공연날짜가 추가되었습니다.');
          } catch (e) {
            Toast.error('저장 실패: ' + e.message);
          } finally { Loader.hide(); }
        });
      }
    });
  }

  function openEditDateModal(id) {
    const dateObj = Store.getConcertDateById(id);
    if (!dateObj) return;
    const concert = Store.getConcertById(dateObj.concertId);
    Modal.open({
      title: `공연날짜 수정 — ${concert?.concertName || ''}`,
      body: buildDateForm(dateObj),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-date-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-date-btn').addEventListener('click', async () => {
          const date = document.getElementById('concert-date')?.value;
          if (!date) { Toast.warning('공연날짜를 입력해주세요.'); return; }
          try {
            Loader.show('저장 중...');
            await Store.editConcertDate({ ...dateObj, concertDate: date });
            Modal.close();
            render();
            Toast.success('공연날짜가 수정되었습니다.');
          } catch (e) {
            Toast.error('수정 실패: ' + e.message);
          } finally { Loader.hide(); }
        });
      }
    });
  }

  async function handleDeleteDate(id) {
    const dateObj = Store.getConcertDateById(id);
    if (!dateObj) return;
    const tickets = Store.getTickets().filter(t => t.concertDateId === id);

    let msg = `"${dateObj.concertDate}" 공연날짜를 삭제하시겠습니까?`;
    if (tickets.length > 0) {
      msg += `\n연결된 티켓 ${tickets.length}건이 함께 삭제됩니다.`;
    }

    const ok = await Modal.confirm(msg, '공연날짜 삭제');
    if (!ok) return;
    try {
      Loader.show('삭제 중...');
      await Store.removeConcertDate(id);
      render();
      Toast.success('공연날짜가 삭제되었습니다.');
    } catch (e) {
      Toast.error('삭제 실패: ' + e.message);
    } finally { Loader.hide(); }
  }

  function buildDateForm(dateObj = {}) {
    return `
      <div class="form-group">
        <label class="form-label" for="concert-date">공연날짜 <span class="required">*</span></label>
        <input class="form-input" id="concert-date" type="date"
               value="${Utils.escapeHtml(dateObj.concertDate || '')}">
      </div>
    `;
  }

  return { render };
})();
