/*
 * Telas de cada etapa do agendamento. Funções puras: recebem o estado (b) e devolvem HTML.
 * Etapas: 1 serviço, 2 barbeiro, 3 horário, 4 dados do cliente, 5 confirmação.
 */
import { core } from '../../state.js';
import { esc, brl, hhmm, dayLong, parseDT, initials, ICON } from '../../utils.js';
import { openDays, slotsFor } from './availability.js';

const LABELS = ['Serviço', 'Barbeiro', 'Horário', 'Seus dados'];

export const servicoDe = b => core.servicos.find(s => s.id === b.servicoId);
export const barbeiroDe = b => core.barbeiros.find(x => x.id === b.barbeiroId);

export function renderStepper(step) {
  if (step > 4) return '';
  return `<div class="stepper" aria-label="Etapas">${LABELS.map((name, i) => {
    const n = i + 1;
    const cls = n === step ? 'on' : n < step ? 'done' : '';
    return `<div class="${cls}"${n === step ? ' aria-current="step"' : ''}><b>${n < step ? '✓' : n}</b>${name}</div>`;
  }).join('')}</div>`;
}

export function renderBody(b) {
  switch (b.step) {
    case 1: return stepServico(b);
    case 2: return stepBarbeiro(b);
    case 3: return stepHorario(b);
    case 4: return stepDados(b);
    default: return stepConfirmacao(b);
  }
}

export function renderFooter(b) {
  switch (b.step) {
    case 1:
      return `<span></span><button class="btn primary" data-act="next" ${b.servicoId ? '' : 'disabled'}>Continuar</button>`;
    case 2:
      return `<button class="btn" data-act="back">Voltar</button><button class="btn primary" data-act="next" ${b.barbeiroId ? '' : 'disabled'}>Continuar</button>`;
    case 3:
      return `<button class="btn" data-act="back">Voltar</button><button class="btn primary" data-act="next" ${b.slot ? '' : 'disabled'}>Continuar</button>`;
    case 4:
      return `<button class="btn" data-act="back" ${b.busy ? 'disabled' : ''}>Voltar</button><button class="btn primary" data-act="submit" ${b.busy ? 'disabled' : ''}>${b.busy ? 'Confirmando…' : 'Confirmar agendamento'}</button>`;
    default:
      return `<button class="btn" data-act="close">Fechar</button><a class="btn primary" href="#/agendamentos" data-act="close">Ver meus agendamentos</a>`;
  }
}

function stepServico(b) {
  return `<div class="pick">${core.servicos.map(s => `
    <button class="opt" aria-pressed="${s.id === b.servicoId}" data-act="svc" data-id="${s.id}">
      <div class="grow"><b>${esc(s.nomeDoServico)}</b><div class="hint">${s.duracaoMinutos} min</div></div>
      <span class="price">${brl(s.preco)}</span>
    </button>`).join('')}</div>`;
}

function stepBarbeiro(b) {
  if (!core.barbeiros.some(x => x.status === 'DISPONIVEL')) {
    return `<div class="state" style="padding:30px 0"><b>Sem barbeiros disponíveis</b>Todos os barbeiros estão indisponíveis agora. Volte mais tarde.</div>`;
  }
  return `<div class="pick">${core.barbeiros.map(x => {
    const on = x.status === 'DISPONIVEL';
    return `<button class="opt" aria-pressed="${x.id === b.barbeiroId}" data-act="bar" data-id="${x.id}" ${on ? '' : 'disabled'}>
      <span class="avatar" aria-hidden="true">${esc(initials(x.nome))}</span>
      <div class="grow"><b>${esc(x.nome)}</b></div>
      <span class="chip ${on ? 'ok' : 'bad'}">${on ? 'Disponível' : 'Indisponível'}</span>
    </button>`;
  }).join('')}</div>`;
}

function stepHorario(b) {
  if (b.loading || !b.agendamentos) return `<div class="state" style="padding:40px 0">Carregando horários livres…</div>`;

  const servico = servicoDe(b), barbeiro = barbeiroDe(b);
  const slots = slotsFor({ shop: b.shop, date: b.date, agendamentos: b.agendamentos, servico, barbeiroId: b.barbeiroId });
  const anyFree = slots.some(x => x.free);

  const days = openDays(b.shop).map(d => `
    <button class="day" aria-pressed="${!!b.date && d.getTime() === b.date.getTime()}" data-act="day" data-t="${d.getTime()}">
      <small>${d.toLocaleDateString('pt-BR', {weekday: 'short'}).replace('.', '')}</small>
      <b>${d.getDate()}</b>
      <small>${d.toLocaleDateString('pt-BR', {month: 'short'}).replace('.', '')}</small>
    </button>`).join('');

  const grid = anyFree
    ? `<div class="slots" role="group" aria-label="Horários">${slots.map(x => `
        <button class="slot" ${x.free ? '' : 'disabled'} aria-pressed="${!!b.slot && x.s.getTime() === b.slot.getTime()}" data-act="slot" data-t="${x.s.getTime()}">${hhmm(x.s)}</button>`).join('')}</div>`
    : `<div class="empty" style="grid-column:auto"><b>Sem horários neste dia</b>${esc(barbeiro.nome)} está com a agenda cheia em ${esc(dayLong(b.date))}. Escolha outro dia.</div>`;

  return `<div class="summary"><span><b>${esc(servico.nomeDoServico)}</b> com <b>${esc(barbeiro.nome)}</b></span><span class="hint">${servico.duracaoMinutos} min, ${brl(servico.preco)}</span></div>
    <div class="days" role="group" aria-label="Dia">${days}</div>${grid}`;
}

function stepDados(b) {
  const servico = servicoDe(b), barbeiro = barbeiroDe(b);
  return `<div class="summary"><span><b>${esc(servico.nomeDoServico)}</b> com <b>${esc(barbeiro.nome)}</b></span><span>${esc(b.shop.nome)}, ${esc(dayLong(b.slot))} às ${hhmm(b.slot)}</span><span class="hint">${brl(servico.preco)}</span></div>
    <form class="form" id="f" novalidate>
      <div class="field"><label for="f-nome">Nome</label><input id="f-nome" autocomplete="given-name" maxlength="50" value="${esc(b.nome)}"></div>
      <div class="field"><label for="f-sob">Sobrenome</label><input id="f-sob" autocomplete="family-name" maxlength="50" value="${esc(b.sobrenome)}"></div>
      <div class="field full"><label for="f-tel">Telefone com DDD</label><input id="f-tel" inputmode="tel" autocomplete="tel-national" placeholder="(11) 99999-9999" value="${esc(b.tel)}"><span class="hint">Usamos o telefone para você encontrar e cancelar seus agendamentos.</span></div>
    </form>
    ${b.error ? `<div class="err" role="alert">${esc(b.error)}</div>` : ''}`;
}

function stepConfirmacao(b) {
  const ag = b.result, quando = parseDT(ag.dataHora);
  return `<div class="done-box"><div class="tick">${ICON.tick}</div><h2>Agendado!</h2>
    <p>Seu horário está reservado. Chegue 5 minutos antes.</p>
    <div class="summary"><span><b>${esc(ag.servico.nomeDoServico)}</b> com <b>${esc(ag.barbeiro.nome)}</b></span><span>${esc(b.shop.nome)}</span><span>${esc(dayLong(quando))} às ${hhmm(quando)}</span><span class="hint">${brl(ag.servico.preco)}</span></div></div>`;
}
