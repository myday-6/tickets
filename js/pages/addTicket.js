/* ============================================================
   addTicket.js - 티켓 추가 페이지
   ============================================================ */

const AddTicketPage = (() => {
  const el = () => document.getElementById('page-add-ticket');
  let keepValues = {}; // 연속 입력 시 유지할 값

  function render() {
    const accounts     = Store.getAccounts();
    const concerts     = Store.getConcerts();

    el().innerHTML = `
      <div class="page-header">
        <h2 class="page-title">➕ 티켓 추가</h2>
      </div>
      <div class="add-ticket-container">
        <div class="form-card">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="tk-account">계정 <span class="required">*</span></label>
              <select class="form-select" id="tk-account">
                <option value="">계정 선택</option>
                ${accounts.map(a => `<option value="${a.id}" ${keepValues.accountId === a.id ? 'selected' : ''}>${Utils.escapeHtml(a.accountName)} (${Utils.escapeHtml(a.idType)})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="tk-concert">콘서트 <span class="required">*</span></label>
              <select class="form-select" id="tk-concert">
                <option value="">콘서트 선택</option>
                ${concerts.map(c => `<option value="${c.id}" ${keepValues.concertId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.concertName)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="tk-date">공연날짜 <span class="required">*</span></label>
            <select class="form-select" id="tk-date">
              <option value="">콘서트를 먼저 선택하세요</option>
            </select>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="tk-section">구역 <span class="required">*</span></label>
              <input class="form-input" id="tk-section" type="text" placeholder="예: A구역">
            </div>
            <div class="form-group">
              <label class="form-label" for="tk-row">열</label>
              <input class="form-input" id="tk-row" type="text" placeholder="예: 5열">
            </div>
            <div class="form-group">
              <label class="form-label" for="tk-seat">좌석번호 <span class="required">*</span></label>
              <input class="form-input" id="tk-seat" type="text" placeholder="예: 12">
            </div>
          </div>

          <div class="form-actions-row">
            <button class="btn btn-primary btn-lg" id="save-ticket-btn">💾 저장</button>
            <button class="btn btn-outline btn-lg" id="save-continue-btn">💾 저장 후 계속 추가</button>
            <button class="btn btn-ghost" id="reset-ticket-btn">🔄 초기화</button>
          </div>

          <div class="ticket-tip">
            <span class="tip-icon">💡</span>
            <span>"저장 후 계속 추가"를 누르면 계정·콘서트·날짜가 유지된 채 새 티켓을 추가할 수 있습니다.</span>
          </div>
        </div>
      </div>
    `;

    // 이전에 선택된 콘서트가 있으면 날짜 로드
    if (keepValues.concertId) {
      loadDates(keepValues.concertId, keepValues.concertDateId);
    }

    bindEvents();
  }

  function loadDates(concertId, selectedDateId = '') {
    const dates  = Store.getDatesByConcert(concertId);
    const sorted = [...dates].sort((a, b) => a.concertDate.localeCompare(b.concertDate));
    const sel    = document.getElementById('tk-date');
    if (!sel) return;
    sel.innerHTML = `<option value="">날짜 선택</option>` +
      sorted.map(d => `<option value="${d.id}" ${d.id === selectedDateId ? 'selected' : ''}>${Utils.escapeHtml(d.concertDate)}</option>`).join('');
  }

  function bindEvents() {
    document.getElementById('tk-concert')?.addEventListener('change', e => {
      loadDates(e.target.value);
    });

    document.getElementById('save-ticket-btn')?.addEventListener('click', () => saveTicket(false));
    document.getElementById('save-continue-btn')?.addEventListener('click', () => saveTicket(true));
    document.getElementById('reset-ticket-btn')?.addEventListener('click', () => {
      keepValues = {};
      render();
    });
  }

  async function saveTicket(keepContinue) {
    const accountId     = document.getElementById('tk-account')?.value;
    const concertId     = document.getElementById('tk-concert')?.value;
    const concertDateId = document.getElementById('tk-date')?.value;
    const section       = document.getElementById('tk-section')?.value.trim();
    const row           = document.getElementById('tk-row')?.value.trim();
    const seatNumber    = document.getElementById('tk-seat')?.value.trim();

    if (!accountId)     { Toast.warning('계정을 선택해주세요.'); return; }
    if (!concertId)     { Toast.warning('콘서트를 선택해주세요.'); return; }
    if (!concertDateId) { Toast.warning('공연날짜를 선택해주세요.'); return; }
    if (!section)       { Toast.warning('구역을 입력해주세요.'); return; }
    if (!seatNumber)    { Toast.warning('좌석번호를 입력해주세요.'); return; }

    try {
      Loader.show('저장 중...');
      await Store.addTicket({
        accountId,
        concertId,
        concertDateId,
        section,
        row,
        seatNumber,
        attendanceType: '',
        saleChannel: '',
        saleResult: '',
        saleCompletedDetail: '',
        memo: '',
      });

      Toast.success('티켓이 추가되었습니다. 🎫');

      if (keepContinue) {
        keepValues = { accountId, concertId, concertDateId };
        render();
      } else {
        keepValues = {};
        render();
      }
    } catch (e) {
      Toast.error('저장 실패: ' + e.message);
    } finally {
      Loader.hide();
    }
  }

  return { render };
})();
