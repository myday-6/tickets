/* ============================================================
   utils.js - 유틸리티 함수 모음
   ============================================================ */

const Utils = (() => {
  // ─── ID 생성 ─────────────────────────────────────────────
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ─── 날짜 포맷 ───────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return dateStr; }
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  }

  function nowISO() {
    return new Date().toISOString();
  }

  // ─── 디바운스 ─────────────────────────────────────────────
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ─── 빈값 검증 ───────────────────────────────────────────
  function isEmpty(val) {
    return val === null || val === undefined || String(val).trim() === '';
  }

  function validateRequired(obj, fields) {
    const missing = fields.filter(f => isEmpty(obj[f]));
    return missing;
  }

  // ─── HTML 이스케이프 ──────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── 선택 옵션 ───────────────────────────────────────────
  const ID_TYPES       = ['네이버', '이메일', '기존인팍'];
  const ATTENDANCE     = ['직접참석', '판매'];
  const SALE_CHANNELS  = ['미진티베', '미나티베'];
  const SALE_RESULTS   = ['판매중', '판매완료'];
  const SALE_DETAILS   = ['미진티베완료', '미나티베완료', '번장', '오카'];

  // ─── 상태 배지 색상 ───────────────────────────────────────
  function getStatusBadgeClass(type, value) {
    const map = {
      attendanceType: {
        '직접참석': 'badge-lavender',
        '판매':     'badge-peach',
      },
      saleChannel: {
        '미진티베': 'badge-mint',
        '미나티베': 'badge-blue',
      },
      saleResult: {
        '판매중':   'badge-yellow',
        '판매완료': 'badge-pink',
      },
      saleCompletedDetail: {
        '미진티베완료': 'badge-pink',
        '미나티베완료': 'badge-mint',
        '번장':         'badge-lavender',
        '오카':         'badge-peach',
      },
      idType: {
        '네이버':   'badge-mint',
        '이메일':   'badge-blue',
        '기존인팍': 'badge-peach',
      },
    };
    return (map[type] && map[type][value]) ? map[type][value] : 'badge-gray';
  }

  // ─── select 옵션 HTML 생성 ────────────────────────────────
  function buildOptions(options, selectedValue, placeholder = '') {
    let html = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
    options.forEach(opt => {
      const sel = opt === selectedValue ? ' selected' : '';
      html += `<option value="${escapeHtml(opt)}"${sel}>${escapeHtml(opt)}</option>`;
    });
    return html;
  }

  return {
    generateId, formatDate, formatDateTime, nowISO,
    debounce, isEmpty, validateRequired, escapeHtml,
    buildOptions, getStatusBadgeClass,
    ID_TYPES, ATTENDANCE, SALE_CHANNELS, SALE_RESULTS, SALE_DETAILS,
  };
})();
