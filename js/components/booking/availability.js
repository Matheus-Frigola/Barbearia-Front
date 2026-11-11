/*
 * Disponibilidade: quais dias a barbearia abre e quais horários estão livres.
 * Mesma regra do AgendamentoService: agendamentos CANCELADOS não ocupam horário e
 * dois atendimentos conflitam quando um começa antes de o outro terminar.
 */
import { parseDT } from '../../utils.js';

const STEP_MINUTES = 30;

/** Próximos 14 dias em que a barbearia abre. */
export function openDays(shop) {
  const out = [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  for (let i = 0; out.length < 14 && i < 40; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (shop.horario.dias.includes(d.getDay())) out.push(d);
  }
  return out;
}

/** Horários do dia com a marca de livre ou ocupado. */
export function slotsFor({ shop, date, agendamentos, servico, barbeiroId }) {
  if (!date || !agendamentos || !servico) return [];
  const now = new Date();
  const busy = agendamentos
    .filter(a => a.barbeiro?.id === barbeiroId && a.status !== 'CANCELADO')
    .map(a => {
      const inicio = parseDT(a.dataHora);
      return [inicio, new Date(inicio.getTime() + a.servico.duracaoMinutos * 60000)];
    });

  const out = [];
  const { inicio, fim } = shop.horario;
  for (let m = inicio * 60; m + servico.duracaoMinutos <= fim * 60; m += STEP_MINUTES) {
    const s = new Date(date); s.setHours(0, m, 0, 0);
    const e = new Date(s.getTime() + servico.duracaoMinutos * 60000);
    out.push({ s, free: s > now && !busy.some(([bs, be]) => s < be && e > bs) });
  }
  return out;
}
