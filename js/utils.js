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

  // ─── 계정 컬러 ──────────────────────────────────────────
  function getAccountColor(name) {
    if (!name) return '#999';
    const colors = [
      '#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#6A5ACD', 
      '#FF8AAE', '#82AAE3', '#91D8E4', '#E97777', '#B3FFAE',
      '#F29393', '#A0C3D2', '#EAC7C7', '#C0DEFF', '#FFB3B3',
      '#D291BC', '#957DAD', '#FEC8D8', '#FFDFD3', '#B5EAD7'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // ─── 콘서트 태그 ────────────────────────────────────────
  function getConcertTag(concertId, concertDateId, allConcertDates) {
    const dates = allConcertDates
      .filter(d => d.concertId === concertId)
      .sort((a, b) => a.concertDate.localeCompare(b.concertDate));
    
    if (dates.length <= 1) return '';
    
    const idx = dates.findIndex(d => d.id === concertDateId);
    if (idx === -1) return '';

    // 하트 이모티콘 순서: ❤️🧡💛💚🩵💙💜
    const heartEmojis = ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍', '🤎'];
    const heart = heartEmojis[idx % heartEmojis.length];

    // 주차 구분 (공연 간격이 4일 이상이면 다음 주로 간주)
    let weeks = [];
    let currentWeek = [];
    for (let i = 0; i < dates.length; i++) {
      if (i > 0) {
        const prev = new Date(dates[i-1].concertDate);
        const curr = new Date(dates[i].concertDate);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff > 4) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      currentWeek.push(dates[i]);
    }
    weeks.push(currentWeek);

    let tagText = '';
    if (weeks.length === 1) {
      // 단일 주차
      if (dates.length === 2) {
        tagText = idx === 0 ? '첫' : '막';
      } else if (dates.length === 3) {
        if (idx === 0) tagText = '첫';
        else if (idx === 1) tagText = '중';
        else tagText = '막';
      } else {
        tagText = (idx + 1).toString();
      }
    } else {
      // 다중 주차
      const weekIdx = weeks.findIndex(w => w.some(d => d.id === concertDateId));
      const dayIdxInWeek = weeks[weekIdx].findIndex(d => d.id === concertDateId);
      
      let weekLabel = '';
      if (weekIdx === 0) weekLabel = '첫';
      else if (weekIdx === weeks.length - 1) weekLabel = '막';
      else weekLabel = (weekIdx + 1).toString();

      let dayLabel = '';
      if (dayIdxInWeek === 0) dayLabel = '첫';
      else if (dayIdxInWeek === weeks[weekIdx].length - 1) dayLabel = '막';
      else dayLabel = '중';

      tagText = `${weekLabel}${dayLabel}`;
    }

    return `[${heart}${tagText}]`;
  }

  // ─── 선택 옵션 ───────────────────────────────────────────
  const ID_TYPES = ['네이버', '이메일', '기존인팍'];
  const ATTENDANCE = ['미진Go', '미나Go', '판매'];
  const SALE_CHANNELS = ['미진티베', '미나티베', '지넌티베', '번장', '트위터'];
  const SALE_RESULTS = ['판매중', '판매완료'];
  const SALE_DETAILS = ['미진티베완료', '미나티베완료', '번장', '오카'];

  // ─── 상태 배지 색상 ───────────────────────────────────────
  function getStatusBadgeClass(type, value) {
    const map = {
      attendanceType: {
        '미진': 'badge-lavender',
        '미나': 'badge-blue',
        '판매': 'badge-peach',
      },
      saleChannel: {
        '미진티베': 'badge-mint',
        '미나티베': 'badge-blue',
        '지넌티베': 'badge-lavender',
      },
      saleResult: {
        '판매중': 'badge-yellow',
        '판매완료': 'badge-pink',
      },
      saleCompletedDetail: {
        '미진티베완료': 'badge-pink',
        '미나티베완료': 'badge-mint',
        '번장': 'badge-lavender',
        '오카': 'badge-peach',
      },
      idType: {
        '네이버': 'badge-mint',
        '이메일': 'badge-blue',
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
    { light: '#FFFDFD', mid: '#FFF9FB', border: '#FFD1DC', text: '#D06070', emoji: '🌸' }, // 핑크
    { light: '#F0F9F7', mid: '#E0F2F1', border: '#B2DFDB', text: '#3E7E73', emoji: '🌿' }, // 민트
    { light: '#F5F6FB', mid: '#E8EAF6', border: '#C5CAE9', text: '#455A64', emoji: '💜' }, // 라벤더
    { light: '#FFFBF5', mid: '#FFF3E0', border: '#FFE0B2', text: '#A06040', emoji: '🍊' }, // 피치
    { light: '#FFFDF0', mid: '#FFF9C4', border: '#FFF176', text: '#806020', emoji: '⭐' }, // 옐로우
    { light: '#F1F9FF', mid: '#E1F5FE', border: '#B3E5FC', text: '#1A6070', emoji: '🩵' }, // 블루
    { light: '#FAF5FD', mid: '#F3E5F5', border: '#E1BEE7', text: '#703090', emoji: '🌂' }, // 퍼플
    { light: '#F9FBF5', mid: '#F1F8E9', border: '#DCEDC8', text: '#406020', emoji: '🌱' }, // 그린
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
      const def = getColorDef(concertId);
      const shade = dateShade[concertDateId] ?? 0;
      return shade === 0 ? def.light : def.mid;
    }

    // 테이블 행 인라인 스타일 문자열
    function getConcertStyle(concertId, concertDateId) {
      const def = getColorDef(concertId);
      const bg = getDateBg(concertId, concertDateId);
      return `border-left: 4px solid ${def.border}; background: ${bg};`;
    }

    return { getColorDef, getDateBg, getConcertStyle };
  }

  return {
    generateId, formatDate, formatShortDate, formatInputDate, formatDateTime, nowISO,
    debounce, isEmpty, validateRequired, escapeHtml,
    buildOptions, getStatusBadgeClass, buildColorMap,
    getAccountColor, getConcertTag,
    CONCERT_COLOR_PALETTE,
    ID_TYPES, ATTENDANCE, SALE_CHANNELS, SALE_RESULTS, SALE_DETAILS,
  };
})();

