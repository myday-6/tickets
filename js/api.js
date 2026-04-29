/* ============================================================
   api.js - Google Apps Script API 통신 모듈
   ============================================================ */

const API = (() => {
  // ─── 기본 fetch 래퍼 ─────────────────────────────────────
  async function request(method, params = {}, body = null) {
    const url = CONFIG.GAS_URL;
    if (!url) throw new Error('GAS_URL이 설정되지 않았습니다. config.js를 확인해주세요.');

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT || 30000);

    try {
      let fetchUrl = url;
      let options  = { signal: controller.signal };

      if (method === 'GET') {
        const qs = new URLSearchParams(params).toString();
        fetchUrl  = `${url}?${qs}`;
        options.method = 'GET';
      } else {
        options.method  = 'POST';
        // Content-Type을 text/plain으로 → CORS preflight 없이 동작
        options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
        options.body    = JSON.stringify(body);
      }

      const res  = await fetch(fetchUrl, options);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || '알 수 없는 오류가 발생했습니다.');
      }
      return json;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── 조회 ─────────────────────────────────────────────────
  async function getAll(sheet) {
    const res = await request('GET', { action: 'getAll', sheet });
    return res.data || [];
  }

  // ─── 생성 ─────────────────────────────────────────────────
  async function create(sheet, data) {
    return await request('POST', {}, { action: 'create', sheet, data });
  }

  // ─── 수정 ─────────────────────────────────────────────────
  async function update(sheet, data) {
    return await request('POST', {}, { action: 'update', sheet, data });
  }

  // ─── 삭제 ─────────────────────────────────────────────────
  async function remove(sheet, id) {
    return await request('POST', {}, { action: 'delete', sheet, id });
  }

  // ─── 다중 삭제 ────────────────────────────────────────────
  async function batchRemove(sheet, ids) {
    return await request('POST', {}, { action: 'batchDelete', sheet, ids });
  }

  // ─── 편의 메서드 ──────────────────────────────────────────
  const Accounts     = { getAll: () => getAll('Accounts'),     create: d => create('Accounts', d),     update: d => update('Accounts', d),     remove: id => remove('Accounts', id) };
  const Concerts     = { getAll: () => getAll('Concerts'),     create: d => create('Concerts', d),     update: d => update('Concerts', d),     remove: id => remove('Concerts', id) };
  const ConcertDates = { getAll: () => getAll('ConcertDates'), create: d => create('ConcertDates', d), update: d => update('ConcertDates', d), remove: id => remove('ConcertDates', id), batchRemove: ids => batchRemove('ConcertDates', ids) };
  const Tickets      = { getAll: () => getAll('Tickets'),      create: d => create('Tickets', d),      update: d => update('Tickets', d),      remove: id => remove('Tickets', id),      batchRemove: ids => batchRemove('Tickets', ids) };

  return { Accounts, Concerts, ConcertDates, Tickets };
})();
