/* ============================================================
   toast.js - 토스트 알림 컴포넌트
   ============================================================ */

const Toast = (() => {
  function show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const id = 'toast-' + Date.now();

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = id;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${Utils.escapeHtml(message)}</span>
      <button class="toast-close" onclick="document.getElementById('${id}')?.remove()">✕</button>
    `;

    container.appendChild(toast);
    // 애니메이션 진입
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  const success = (msg) => show(msg, 'success');
  const error   = (msg) => show(msg, 'error', 5000);
  const info    = (msg) => show(msg, 'info');
  const warning = (msg) => show(msg, 'warning');

  return { show, success, error, info, warning };
})();
