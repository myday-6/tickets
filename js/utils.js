/* ============================================================
   utils.js - Utility Functions
   ============================================================ */

const Utils = (() => {
     // --- ID Generation ---
                 function generateId() {
                        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
                 }

                 // --- Date Format ---
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

                 // --- Debounce ---
                 function debounce(fn, delay) {
                        let timer;
                        return function (...args) {
                                 clearTimeout(timer);
                                 timer = setTimeout(() => fn.apply(this, args), delay);
                        };
                 }
     // --- Validation ---
                 function isEmpty(val) {
                        return val === null || val === undefined || String(val).trim() === '';
                 }

                 function validateRequired(obj, fields) {
                        const missing = fields.filter(f => isEmpty(obj[f]));
                        return missing;
                 }

                 // --- HTML Escape ---
                 function escapeHtml(str) {
                        if (!str) return '';
                        return String(str)
                          .replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/'/g, '&#039;');
                 }

                 // --- Options ---
                 const ID_TYPES       = ['\ub124\uc774\ubc84', '\uc774\uba54\uc77c', '\uae30\uc874\uc778\ud30d'];
     const ATTENDANCE     = ['\uc9c1\uc811\ucc38\uc11d', '\ud310\ub9e4'];
     const SALE_CHANNELS  = ['\ubbf8\uc9c4\ud2f0\ubca0', '\ubbf8\ub098\ud2f0\ubca0'];
     const SALE_RESULTS   = ['\ud310\ub9e4\uc911', '\ud310\ub9e4\uc644\ub8cc'];
     const SALE_DETAILS   = ['\ubbf8\uc9c4\ud2f0\ubca0\uc644\ub8cc', '\ubbf8\ub098\ud2f0\ubca0\uc644\ub8cc', '\ubc88\uc7a5', '\uc624\uce74'];

                 // --- Badge Class ---
                 function getStatusBadgeClass(type, value) {
                        const map = {
                                 attendanceType: {
                                            '\uc9c1\uc811\ucc38\uc11d': 'badge-lavender',
                                            '\ud310\ub9e4':     'badge-peach',
                                 },
                                 saleChannel: {
                                            '\ubbf8\uc9c4\ud2f0\ubca0': 'badge-mint',
                                            '\ubbf8\ub098\ud2f0\ubca0': 'badge-blue',
                                 },
                                 saleResult: {
                                            '\ud310\ub9e4\uc911':   'badge-yellow',
                                            '\ud310\ub9e4\uc644\ub8cc': 'badge-pink',
                                 },
                                 saleCompletedDetail: {
                                            '\ubbf8\uc9c4\ud2f0\ubca0\uc644\ub8cc': 'badge-pink',
                                            '\ubbf8\ub098\ud2f0\ubca0\uc644\ub8cc': 'badge-mint',
                                            '\ubc88\uc7a5':         'badge-lavender',
                                            '\uc624\uce74':         'badge-peach',
                                 },
                                 idType: {
                                            '\ub124\uc774\ubc84':   'badge-mint',
                                            '\uc774\uba54\uc77c':   'badge-blue',
                                            '\uae30\uc874\uc778\ud30d': 'badge-peach',
                                 },
                        };
                        return (map[type] && map[type][value]) ? map[type][value] : 'badge-gray';
                 }
     // --- Select Options ---
                 function buildOptions(options, selectedValue, placeholder = '') {
                        let html = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
                        options.forEach(opt => {
                                 const sel = opt === selectedValue ? ' selected' : '';
                                 html += `<option value="${escapeHtml(opt)}"${sel}>${escapeHtml(opt)}</option>`;
                        });
                        return html;
                 }

                 // --- Color Palette ---
                 const CONCERT_COLOR_PALETTE = [
                    { light: '#FFF0F3', mid: '#FFD8E2', border: '#F08090', text: '#C0405A', emoji: '\ud83c\udf38' },
                    { light: '#F0FAF6', mid: '#D8F2E8', border: '#5ABDA0', text: '#1E7A60', emoji: '\ud83c\udf3f' },
                    { light: '#F2F4FB', mid: '#DDE2F7', border: '#7080CC', text: '#3848A0', emoji: '\ud83d\udc9c' },
                    { light: '#FFF7F0', mid: '#FFE8D4', border: '#E09060', text: '#A05020', emoji: '\ud83c\udf4a' },
                    { light: '#FEFEF0', mid: '#FDFBD8', border: '#C0A020', text: '#806000', emoji: '\u2b50' },
                    { light: '#F0F8FA', mid: '#D8EFF4', border: '#4090A8', text: '#1A6070', emoji: '\ud83e\ude75' },
                    { light: '#FAF0FC', mid: '#F0D8F8', border: '#A060C0', text: '#703090', emoji: '\ud83c\udf02' },
                    { light: '#F4FBF0', mid: '#E0F4D0', border: '#60A838', text: '#306820', emoji: '\ud83c\udf31' },
                      ];

                 function buildColorMap(concerts, dates) {
                        const concertIdx = {};
                        concerts.forEach((c, i) => { concertIdx[c.id] = i % CONCERT_COLOR_PALETTE.length; });

       const dateShade = {};
                        concerts.forEach(c => {
                                 const sorted = [...dates]
                                   .filter(d => d.concertId === c.id)
                                   .sort((a, b) => a.concertDate.localeCompare(b.concertDate));
                                 sorted.forEach((d, i) => { dateShade[d.id] = i % 2; });
                        });

       function getColorDef(concertId) {
                return CONCERT_COLOR_PALETTE[concertIdx[concertId] ?? 0];
       }

       function getDateBg(concertId, concertDateId) {
                const def   = getColorDef(concertId);
                const shade = dateShade[concertDateId] ?? 0;
                return shade === 0 ? def.light : def.mid;
       }

       function getConcertStyle(concertId, concertDateId) {
                const def = getColorDef(concertId);
                const bg  = getDateBg(concertId, concertDateId);
                return `border-left: 4px solid ${def.border}; background: ${bg};`;
       }

       return { getColorDef, getDateBg, getConcertStyle };
                 }

                 return {
                        generateId, formatDate, formatDateTime, nowISO,
                        debounce, isEmpty, validateRequired, escapeHtml,
                        buildOptions, getStatusBadgeClass, buildColorMap,
                        CONCERT_COLOR_PALETTE,
                        ID_TYPES, ATTENDANCE, SALE_CHANNELS, SALE_RESULTS, SALE_DETAILS,
                 };
})();
