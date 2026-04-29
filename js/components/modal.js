/* ============================================================
   modal.js - 공통 모달 컴포넌트
   ============================================================ */

const Modal = (() => {
  let _resolveConfirm = null;

  function _getEls() {
    return {
      overlay: document.getElementById('modal-overlay'),
      title:   document.getElementById('modal-title'),
      body:    document.getElementById('modal-body'),
      footer:  document.getElementById('modal-footer'),
    };
  }

  // 일반 모달 열기
  function open({ title = '', body = '', footer = '', onOpen }) {
    const { overlay, title: t, body: b, footer: f } = _getEls();
    t.textContent = title;
    b.innerHTML   = body;
    f.innerHTML   = footer;
    overlay.classList.remove('hidden');
    overlay.classList.add('modal-open');
    if (typeof onOpen === 'function') onOpen();
  }

  // 모달 닫기
  function close() {
    const { overlay } = _getEls();
    overlay.classList.remove('modal-open');
    overlay.classList.add('hidden');
    if (_resolveConfirm) { _resolveConfirm(false); _resolveConfirm = null; }
  }

  // 확인 모달 (Promise 기반)
  function confirm(message, title = '확인') {
    return new Promise(resolve => {
      _resolveConfirm = resolve;
      open({
        title,
        body: `<p class="confirm-message">${Utils.escapeHtml(message)}</p>`,
        footer: `
          <button class="btn btn-ghost" id="modal-cancel-btn">취소</button>
          <button class="btn btn-danger" id="modal-confirm-btn">삭제</button>
        `,
        onOpen() {
          document.getElementById('modal-confirm-btn').onclick = () => { resolve(true); _resolveConfirm = null; close(); };
          document.getElementById('modal-cancel-btn').onclick  = () => { resolve(false); _resolveConfirm = null; close(); };
        }
      });
    });
  }

  // ESC 키로 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  return { open, close, confirm };
})();
