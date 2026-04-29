/* ============================================================
   loader.js - 로딩 인디케이터 컴포넌트
   ============================================================ */

const Loader = (() => {
  function show(msg = '처리 중...') {
    const el = document.getElementById('loader');
    const txt = document.getElementById('loader-text');
    if (txt) txt.textContent = msg;
    el?.classList.remove('hidden');
  }

  function hide() {
    document.getElementById('loader')?.classList.add('hidden');
  }

  return { show, hide };
})();
