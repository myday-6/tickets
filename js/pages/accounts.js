/* ============================================================
   accounts.js - 계정 관리 페이지
   ============================================================ */

const AccountsPage = (() => {
  const el = () => document.getElementById('page-accounts');

  function render() {
    const accounts = Store.getAccounts();
    el().innerHTML = `
      <div class="page-header">
        <h2 class="page-title">👤 계정 관리</h2>
        <button class="btn btn-primary" id="add-account-btn">+ 계정 추가</button>
      </div>
      ${accounts.length === 0
        ? `<div class="empty-state"><span class="empty-icon">👤</span><p>등록된 계정이 없습니다.</p></div>`
        : `<div class="card-grid">${accounts.map(renderCard).join('')}</div>`
      }
    `;
    bindEvents();
  }

  function renderCard(acc) {
    const badge = Utils.getStatusBadgeClass('idType', acc.idType);
    return `
      <div class="data-card" data-id="${acc.id}">
        <div class="data-card-header">
          <span class="data-card-title">${Utils.escapeHtml(acc.accountName)}</span>
          <span class="badge ${badge}">${Utils.escapeHtml(acc.idType)}</span>
        </div>
        <div class="data-card-meta">
          <span>생성: ${Utils.formatDateTime(acc.createdAt)}</span>
        </div>
        <div class="data-card-actions">
          <button class="btn btn-sm btn-outline edit-account-btn" data-id="${acc.id}">✏️ 수정</button>
          <button class="btn btn-sm btn-danger-outline delete-account-btn" data-id="${acc.id}">🗑️ 삭제</button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    document.getElementById('add-account-btn')?.addEventListener('click', openAddModal);

    el().querySelectorAll('.edit-account-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    el().querySelectorAll('.delete-account-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
  }

  function openAddModal() {
    Modal.open({
      title: '계정 추가',
      body: buildForm({}),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-account-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-account-btn').addEventListener('click', async () => {
          const data = getFormData();
          if (!data) return;
          try {
            Loader.show('저장 중...');
            await Store.addAccount(data);
            Modal.close();
            render();
            Toast.success('계정이 추가되었습니다.');
          } catch (e) {
            Toast.error('저장 실패: ' + e.message);
          } finally {
            Loader.hide();
          }
        });
      }
    });
  }

  function openEditModal(id) {
    const acc = Store.getAccountById(id);
    if (!acc) return;
    Modal.open({
      title: '계정 수정',
      body: buildForm(acc),
      footer: `
        <button class="btn btn-ghost" onclick="Modal.close()">취소</button>
        <button class="btn btn-primary" id="save-account-btn">저장</button>
      `,
      onOpen() {
        document.getElementById('save-account-btn').addEventListener('click', async () => {
          const data = getFormData();
          if (!data) return;
          try {
            Loader.show('저장 중...');
            await Store.editAccount({ ...acc, ...data });
            Modal.close();
            render();
            Toast.success('계정이 수정되었습니다.');
          } catch (e) {
            Toast.error('수정 실패: ' + e.message);
          } finally {
            Loader.hide();
          }
        });
      }
    });
  }

  async function handleDelete(id) {
    const acc = Store.getAccountById(id);
    if (!acc) return;

    const tickets = Store.getTickets().filter(t => t.accountId === id);
    const msg = tickets.length > 0
      ? `"${acc.accountName}" 계정을 삭제하면 연결된 티켓 ${tickets.length}건도 함께 삭제됩니다.\n정말 삭제하시겠습니까?`
      : `"${acc.accountName}" 계정을 삭제하시겠습니까?`;

    const ok = await Modal.confirm(msg, '계정 삭제');
    if (!ok) return;

    try {
      Loader.show('삭제 중...');
      await Store.removeAccount(id);
      render();
      Toast.success('계정이 삭제되었습니다.');
    } catch (e) {
      Toast.error('삭제 실패: ' + e.message);
    } finally {
      Loader.hide();
    }
  }

  function buildForm(acc = {}) {
    return `
      <div class="form-group">
        <label class="form-label" for="acc-name">계정이름 <span class="required">*</span></label>
        <input class="form-input" id="acc-name" type="text" placeholder="계정이름 입력"
               value="${Utils.escapeHtml(acc.accountName || '')}">
      </div>
      <div class="form-group">
        <label class="form-label" for="acc-type">아이디유형 <span class="required">*</span></label>
        <select class="form-select" id="acc-type">
          <option value="">선택하세요</option>
          ${Utils.buildOptions(Utils.ID_TYPES, acc.idType)}
        </select>
      </div>
    `;
  }

  function getFormData() {
    const name = document.getElementById('acc-name')?.value.trim();
    const type = document.getElementById('acc-type')?.value;
    if (!name) { Toast.warning('계정이름을 입력해주세요.'); return null; }
    if (!type) { Toast.warning('아이디유형을 선택해주세요.'); return null; }
    return { accountName: name, idType: type };
  }

  return { render };
})();
