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

  function formatShortDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch { return dateStr; }
  }

  function formatInputDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
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
  const SALE_CHANNELS  = ['미진티베', '미나티베', '번장', '트위터'];
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

  // ─── 콘서트/날짜 컬러 팔레트 ─────────────────────────────
  // 각 콘서트에 자동 배정되는 파스텔 8색 팔레트
  const CONCERT_COLOR_PALETTE = [
    { light: '#FFF0F3', mid: '#FFD8E2', border: '#F08090', text: '#C0405A', emoji: '🌸' }, // 핑크
    { light: '#F0FAF6', mid: '#D8F2E8', border: '#5ABDA0', text: '#1E7A60', emoji: '🌿' }, // 민트
    { light: '#F2F4FB', mid: '#DDE2F7', border: '#7080CC', text: '#3848A0', emoji: '💜' }, // 라벤더
    { light: '#FFF7F0', mid: '#FFE8D4', border: '#E09060', text: '#A05020', emoji: '🍊' }, // 피치
    { light: '#FEFEF0', mid: '#FDFBD8', border: '#C0A020', text: '#806000', emoji: '⭐' }, // 옐로우
    { light: '#F0F8FA', mid: '#D8EFF4', border: '#4090A8', text: '#1A6070', emoji: '🩵' }, // 블루
    { light: '#FAF0FC', mid: '#F0D8F8', border: '#A060C0', text: '#703090', emoji: '🌂' }, // 퍼플
    { light: '#F4FBF0', mid: '#E0F4D0', border: '#60A838', text: '#306820', emoji: '🌱' }, // 그린
  ];

  /**
   * 콘서트/날짜별 색상 매핑 빌드
   * @param {Array} concerts - 전체 콘서트 목록
   * @param {Array} dates    - 전체 공연날짜 목록
   * @returns {{ getConcertStyle, getDateBg, getColorDef }}
   */
  function buildColorMap(concerts, dates) {
    // 콘서트 ID → 팔레트 인덱스
    const concertIdx = {};
    concerts.forEach((c, i) => { concertIdx[c.id] = i % CONCERT_COLOR_PALETTE.length; });

    // 날짜 ID → 동일 콘서트 내 순번 (0, 1, 0, 1 …)
    const dateShade = {};
    concerts.forEach(c => {
      const sorted = [...dates]
        .filter(d => d.concertId === c.id)
        .sort((a, b) => a.concertDate.localeCompare(b.concertDate));
      sorted.forEach((d, i) => { dateShade[d.id] = i % 2; });
    });

    // 콘서트 색상 정의 반환
    function getColorDef(concertId) {
      return CONCERT_COLOR_PALETTE[concertIdx[concertId] ?? 0];
    }

    // 테이블 행 / 카드 배경색 (날짜 shade 반영)
    function getDateBg(concertId, concertDateId) {
      const def   = getColorDef(concertId);
      const shade = dateShade[concertDateId] ?? 0;
      return shade === 0 ? def.light : def.mid;
    }

    // 테이블 행 인라인 스타일 문자열
    function getConcertStyle(concertId, concertDateId) {
      const def = getColorDef(concertId);
      const bg  = getDateBg(concertId, concertDateId);
      return `border-left: 4px solid ${def.border}; background: ${bg};`;
    }

    return { getColorDef, getDateBg, getConcertStyle };
  }

  return {
    generateId, formatDate, formatShortDate, formatInputDate, formatDateTime, nowISO,
    debounce, isEmpty, validateRequired, escapeHtml,
    buildOptions, getStatusBadgeClass, buildColorMap,
    CONCERT_COLOR_PALETTE,
    ID_TYPES, ATTENDANCE, SALE_CHANNELS, SALE_RESULTS, SALE_DETAILS,
  };
})();

