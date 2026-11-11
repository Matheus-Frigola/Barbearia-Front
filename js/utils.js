/* Funções utilitárias sem dependência de tela ou de API. */

export const $ = (selector, root = document) => root.querySelector(selector);

/** Escapa texto vindo da API antes de colocar em innerHTML. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const brl = n => Number(n).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
export const pad = n => String(n).padStart(2, '0');

/** Date -> "2026-11-12T14:30:00", o formato que o LocalDateTime do Spring aceita. */
export const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

/** Aceita string ISO ou o formato em array [a, m, d, h, mi] que o Jackson pode devolver. */
export const parseDT = v => {
  if (Array.isArray(v)) { const [y, m, d, h = 0, mi = 0, s = 0] = v; return new Date(y, m - 1, d, h, mi, s); }
  return new Date(v);
};

/** Minúsculas e sem acento, para busca. */
export const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const hhmm = d => d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
export const dayLong = d => d.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});

export const fmtTel = t => {
  const d = String(t).replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t;
};

/** Máscara de telefone enquanto o usuário digita. */
export const maskTel = v => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const initials = n => String(n).split(/\s+/).filter(w => /^[\p{L}\d]/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/** localStorage que não quebra em janela anônima ou com dados bloqueados. */
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignora */ } }
};

export const ICON = {
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
