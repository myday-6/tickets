/* ============================================================
   store.js - 클라이언트 상태 관리 (메모리 캐시)
   ============================================================ */

const Store = (() => {
  let state = {
    accounts:     [],
    concerts:     [],
    concertDates: [],
    tickets:      [],
    loaded:       false,
  };

  // ─── 전체 데이터 로드 ─────────────────────────────────────
  async function loadAll() {
    Loader.show('데이터를 불러오는 중...');
    try {
      const [accounts, concerts, concertDates, tickets] = await Promise.all([
        API.Accounts.getAll(),
        API.Concerts.getAll(),
        API.ConcertDates.getAll(),
        API.Tickets.getAll(),
      ]);
      state.accounts     = accounts;
      state.concerts     = concerts;
      state.concertDates = concertDates;
      state.tickets      = tickets;
      state.loaded       = true;
    } finally {
      Loader.hide();
    }
  }

  // ─── Getter ───────────────────────────────────────────────
  const getAccounts     = () => [...state.accounts];
  const getConcerts     = () => [...state.concerts];
  const getConcertDates = () => [...state.concertDates];
  const getTickets      = () => [...state.tickets];

  function getAccountById(id)     { return state.accounts.find(a => a.id === id); }
  function getConcertById(id)     { return state.concerts.find(c => c.id === id); }
  function getConcertDateById(id) { return state.concertDates.find(d => d.id === id); }
  function getDatesByConcert(concertId) { return state.concertDates.filter(d => d.concertId === concertId); }

  // ─── 계정 CRUD ────────────────────────────────────────────
  async function addAccount(data) {
    const now = Utils.nowISO();
    const row = { ...data, id: Utils.generateId(), createdAt: now, updatedAt: now };
    await API.Accounts.create(row);
    state.accounts.push(row);
    return row;
  }

  async function editAccount(data) {
    const row = { ...data, updatedAt: Utils.nowISO() };
    await API.Accounts.update(row);
    const idx = state.accounts.findIndex(a => a.id === row.id);
    if (idx !== -1) state.accounts[idx] = row;
    return row;
  }

  async function removeAccount(id) {
    await API.Accounts.remove(id);
    state.accounts = state.accounts.filter(a => a.id !== id);
    // 관련 티켓도 삭제
    const ticketIds = state.tickets.filter(t => t.accountId === id).map(t => t.id);
    if (ticketIds.length > 0) {
      await API.Tickets.batchRemove(ticketIds);
      state.tickets = state.tickets.filter(t => t.accountId !== id);
    }
  }

  // ─── 콘서트 CRUD ──────────────────────────────────────────
  async function addConcert(data) {
    const now = Utils.nowISO();
    const row = { ...data, id: Utils.generateId(), createdAt: now, updatedAt: now };
    await API.Concerts.create(row);
    state.concerts.push(row);
    return row;
  }

  async function editConcert(data) {
    const row = { ...data, updatedAt: Utils.nowISO() };
    await API.Concerts.update(row);
    const idx = state.concerts.findIndex(c => c.id === row.id);
    if (idx !== -1) state.concerts[idx] = row;
    return row;
  }

  async function removeConcert(id) {
    await API.Concerts.remove(id);
    state.concerts = state.concerts.filter(c => c.id !== id);
    // 관련 날짜 삭제
    const dateIds = state.concertDates.filter(d => d.concertId === id).map(d => d.id);
    if (dateIds.length > 0) {
      await API.ConcertDates.batchRemove(dateIds);
      state.concertDates = state.concertDates.filter(d => d.concertId !== id);
    }
    // 관련 티켓 삭제
    const ticketIds = state.tickets.filter(t => t.concertId === id).map(t => t.id);
    if (ticketIds.length > 0) {
      await API.Tickets.batchRemove(ticketIds);
      state.tickets = state.tickets.filter(t => t.concertId !== id);
    }
  }

  // ─── 공연날짜 CRUD ────────────────────────────────────────
  async function addConcertDate(data) {
    const now = Utils.nowISO();
    const row = { ...data, id: Utils.generateId(), createdAt: now, updatedAt: now };
    await API.ConcertDates.create(row);
    state.concertDates.push(row);
    return row;
  }

  async function editConcertDate(data) {
    const row = { ...data, updatedAt: Utils.nowISO() };
    await API.ConcertDates.update(row);
    const idx = state.concertDates.findIndex(d => d.id === row.id);
    if (idx !== -1) state.concertDates[idx] = row;
    return row;
  }

  async function removeConcertDate(id) {
    await API.ConcertDates.remove(id);
    state.concertDates = state.concertDates.filter(d => d.id !== id);
    // 관련 티켓 삭제
    const ticketIds = state.tickets.filter(t => t.concertDateId === id).map(t => t.id);
    if (ticketIds.length > 0) {
      await API.Tickets.batchRemove(ticketIds);
      state.tickets = state.tickets.filter(t => t.concertDateId !== id);
    }
  }

  // ─── 티켓 CRUD ────────────────────────────────────────────
  async function addTicket(data) {
    const now = Utils.nowISO();
    const row = { ...data, id: Utils.generateId(), createdAt: now, updatedAt: now };
    await API.Tickets.create(row);
    state.tickets.push(row);
    return row;
  }

  async function editTicket(data) {
    const row = { ...data, updatedAt: Utils.nowISO() };
    await API.Tickets.update(row);
    const idx = state.tickets.findIndex(t => t.id === row.id);
    if (idx !== -1) state.tickets[idx] = row;
    return row;
  }

  async function removeTicket(id) {
    await API.Tickets.remove(id);
    state.tickets = state.tickets.filter(t => t.id !== id);
  }

  return {
    loadAll,
    getAccounts, getConcerts, getConcertDates, getTickets,
    getAccountById, getConcertById, getConcertDateById, getDatesByConcert,
    addAccount, editAccount, removeAccount,
    addConcert, editConcert, removeConcert,
    addConcertDate, editConcertDate, removeConcertDate,
    addTicket, editTicket, removeTicket,
  };
})();
