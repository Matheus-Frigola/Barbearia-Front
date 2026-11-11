/* Página "Meus agendamentos": busca pelo telefone, lista e cancelamento. */
import { api } from '../api/client.js';
import { toast } from '../components/toast.js';
import { $, esc, brl, hhmm, dayLong, parseDT, fmtTel, maskTel, store } from '../utils.js';

const statusChip = s =>
  s === 'AGENDADO' ? '<span class="chip ok">Agendado</span>'
  : s === 'CONCLUIDO' ? '<span class="chip neutral">Concluído</span>'
  : '<span class="chip bad">Cancelado</span>';

function renderItem(a) {
  const d = parseDT(a.dataHora);
  return `<div class="ag">
    <div class="time">${hhmm(d)}</div>
    <div>
      <div class="when">${esc(dayLong(d))}</div>
      <div class="detail"><b>${esc(a.servico.nomeDoServico)}</b> com ${esc(a.barbeiro.nome)}, ${brl(a.servico.preco)}</div>
    </div>
    <div class="acts">${statusChip(a.status)}${a.status === 'AGENDADO' ? `<button class="btn small" data-cancel="${a.id}">Cancelar</button>` : ''}</div>
  </div>`;
}

async function lookup() {
  const tel = $('#m-tel').value.replace(/\D/g, '');
  const out = $('#mres');
  if (!/^\d{10,11}$/.test(tel)) {
    out.innerHTML = `<div class="err" role="alert">Informe o telefone com DDD: 10 ou 11 números.</div>`;
    return;
  }

  out.innerHTML = `<div class="state" style="padding:30px 0">Buscando…</div>`;
  try {
    const [clientes, agendamentos] = await Promise.all([api('GET', '/clientes'), api('GET', '/agendamentos')]);
    const ids = clientes.filter(c => c.numeroTelefone === tel).map(c => c.id);
    store.set('navalha.tel', tel);

    const mine = agendamentos
      .filter(a => ids.includes(a.cliente?.id))
      .sort((a, b) => parseDT(b.dataHora) - parseDT(a.dataHora));

    out.innerHTML = mine.length
      ? `<div class="panel">${mine.map(renderItem).join('')}</div>`
      : `<div class="empty"><b>Nenhum agendamento para ${esc(fmtTel(tel))}</b>Confira o número ou <a href="#/">escolha uma barbearia</a> e agende seu primeiro horário.</div>`;
  } catch (e) {
    out.innerHTML = `<div class="err" role="alert">${esc(e.message)}</div>`;
  }
}

/** Cancelar pede um segundo clique para confirmar (volta ao normal em 4 segundos). */
async function onCancelClick(e) {
  const btn = e.target.closest('[data-cancel]');
  if (!btn) return;

  if (btn.dataset.sure !== '1') {
    btn.dataset.sure = '1';
    btn.textContent = 'Confirmar cancelamento';
    btn.classList.add('primary');
    setTimeout(() => {
      if (!btn.isConnected) return;
      btn.dataset.sure = '';
      btn.textContent = 'Cancelar';
      btn.classList.remove('primary');
    }, 4000);
    return;
  }

  btn.disabled = true;
  try {
    await api('PATCH', `/agendamentos/${btn.dataset.cancel}/status`, { status: 'CANCELADO' });
    toast('Agendamento cancelado.');
    lookup();
  } catch (err) {
    btn.disabled = false;
    toast(err.message);
  }
}

export function renderMine(app) {
  const saved = store.get('navalha.tel') || '';
  app.innerHTML = `<section class="block"><div class="wrap">
    <div class="sec-head" style="margin-bottom:0"><h2>Meus agendamentos</h2></div>
    <p class="mine-intro">Digite o telefone usado no agendamento para ver, acompanhar e cancelar seus horários.</p>
    <form class="mine-form" id="mf" novalidate>
      <div class="field"><label for="m-tel">Telefone com DDD</label><input id="m-tel" inputmode="tel" placeholder="(11) 99999-9999" value="${esc(maskTel(saved))}" autocomplete="tel-national"></div>
      <button class="btn primary" type="submit">Buscar agendamentos</button>
    </form>
    <div id="mres"></div>
  </div></section>`;

  const input = $('#m-tel');
  input.addEventListener('input', () => { input.value = maskTel(input.value); });
  $('#mf').addEventListener('submit', e => { e.preventDefault(); lookup(); });
  $('#mres').addEventListener('click', onCancelClick);
  if (saved) lookup();
}
