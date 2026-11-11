/*
 * Modal de agendamento: guarda o estado, desenha as etapas e conversa com a API.
 * Uso: openBooking(barbearia, { servicoId, barbeiroId }) — os dois ids são opcionais e pulam etapas.
 */
import { api } from '../../api/client.js';
import { $, esc, ICON, maskTel, store, toISO } from '../../utils.js';
import { openDays, slotsFor } from './availability.js';
import { renderStepper, renderBody, renderFooter, servicoDe } from './steps.js';

const dlg = $('#dlg');
let b = null; // estado do agendamento em andamento

export function openBooking(shop, pre = {}) {
  b = {
    shop, servicoId: pre.servicoId ?? null, barbeiroId: pre.barbeiroId ?? null,
    date: null, slot: null, nome: '', sobrenome: '', tel: '',
    agendamentos: null, loading: false, busy: false, error: '', result: null,
    step: pre.servicoId && pre.barbeiroId ? 3 : pre.servicoId ? 2 : 1
  };
  paint();
  if (!dlg.open) dlg.showModal();
  if (b.step === 3) loadAgendamentos();
}

function paint() {
  const erroNoTopo = b.step === 3 && b.error ? `<div class="err top" role="alert">${esc(b.error)}</div>` : '';
  dlg.innerHTML = `
    <div class="d-head">
      <div><h2 id="dlg-title">${esc(b.shop.nome)}</h2><p>Agendar horário</p></div>
      <button class="x" data-act="close" aria-label="Fechar">${ICON.x}</button>
    </div>
    ${renderStepper(b.step)}
    <div class="d-body">${erroNoTopo}${renderBody(b)}</div>
    <div class="d-foot">${renderFooter(b)}</div>`;
}

/** Busca os agendamentos atuais e escolhe o primeiro dia que ainda tem horário livre. */
async function loadAgendamentos() {
  b.loading = true; b.agendamentos = null; paint();
  try { b.agendamentos = await api('GET', '/agendamentos'); }
  catch (e) { b.error = e.message; b.agendamentos = []; }
  b.loading = false;

  if (!b.date) {
    const servico = servicoDe(b);
    const days = openDays(b.shop);
    b.date = days.find(d => slotsFor({ shop: b.shop, date: d, agendamentos: b.agendamentos, servico, barbeiroId: b.barbeiroId }).some(x => x.free)) || days[0];
  }
  paint();
}

async function submit() {
  const tel = b.tel.replace(/\D/g, '');
  const fail = msg => { b.error = msg; paint(); };
  if (!b.nome.trim() || !b.sobrenome.trim()) return fail('Informe nome e sobrenome.');
  if (!/^\d{10,11}$/.test(tel)) return fail('Informe o telefone com DDD: 10 ou 11 números.');

  b.busy = true; b.error = ''; paint();
  try {
    // reaproveita o cliente com o mesmo telefone para não duplicar cadastro
    const clientes = await api('GET', '/clientes');
    let cliente = clientes.find(c => c.numeroTelefone === tel);
    if (!cliente) cliente = await api('POST', '/clientes', { nome: b.nome.trim(), sobrenome: b.sobrenome.trim(), numeroTelefone: tel });

    b.result = await api('POST', '/agendamentos', {
      clienteId: cliente.id, barbeiroId: b.barbeiroId, servicoId: b.servicoId, dataHora: toISO(b.slot)
    });
    store.set('navalha.tel', tel);
    b.step = 5;
  } catch (e) {
    b.error = e.message;
    if (e.status === 409) { // alguém pegou o horário antes: volta e recarrega os horários livres
      b.slot = null; b.step = 3; b.busy = false;
      loadAgendamentos();
      return;
    }
  }
  b.busy = false; paint();
}

const actions = {
  close: () => dlg.close(),
  svc: t => { b.servicoId = +t.dataset.id; b.slot = null; paint(); },
  bar: t => { b.barbeiroId = +t.dataset.id; b.slot = null; paint(); },
  day: t => { b.date = new Date(+t.dataset.t); b.slot = null; paint(); },
  slot: t => { b.slot = new Date(+t.dataset.t); paint(); },
  back: () => { b.error = ''; b.step--; paint(); },
  next: () => { b.error = ''; b.step++; paint(); if (b.step === 3) loadAgendamentos(); },
  submit
};

dlg.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (t && b) actions[t.dataset.act]?.(t);
});

dlg.addEventListener('input', e => {
  if (!b) return;
  if (e.target.id === 'f-nome') b.nome = e.target.value;
  if (e.target.id === 'f-sob') b.sobrenome = e.target.value;
  if (e.target.id === 'f-tel') { e.target.value = maskTel(e.target.value); b.tel = e.target.value; }
});

dlg.addEventListener('close', () => { b = null; });
