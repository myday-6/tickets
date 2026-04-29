/* ============================================================
   app.js - 앱 초기화 & 라우팅
   ============================================================ */

const App = (() => {
  const pages = {
    dashboard:    DashboardPage,
    accounts:     AccountsPage,
    concerts:     ConcertsPage,
    'add-ticket': AddTicketPage,
  };

  // ─── 공통 이벤트 바인딩 ─────────────────────────────────
  function bindCommonEvents() {
    document.getElementById('modal-close')?.addEventListener('click', () => Modal.close());
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') Modal.close();
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
  }

  async function init() {
    document.title = CONFIG.APP_NAME;
    const titleEl = document.querySelector('.app-title');
    if (titleEl) titleEl.textContent = CONFIG.APP_NAME;

    bindCommonEvents();

    // GAS URL 미설정 시 경고 배너 + 빈 화면 렌더
    if (!CONFIG.GAS_URL) {
      document.getElementById('config-banner')?.classList.remove('hidden');
      navigateTo('dashboard');
      return;
    }

    // 데이터 로드
    try {
      await Store.loadAll();
    } catch (e) {
      Toast.error('데이터 로드 실패: ' + e.message);
    }

    navigateTo('dashboard');
  }

  function navigateTo(page) {
    if (!pages[page]) return;

    document.querySelectorAll('.page').forEach(p => {
      p.classList.add('hidden');
      p.classList.remove('active');
    });

    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    pages[page].render();
  }

  window.App = { navigateTo };
  return { init, navigateTo };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
