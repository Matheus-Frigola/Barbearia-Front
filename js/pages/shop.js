/* Página de uma barbearia: serviços, equipe e botão de agendar. */
import { BARBEARIAS } from '../data/barbearias.js';
import { core } from '../state.js';
import { openBooking } from '../components/booking/dialog.js';
import { DIAS } from '../config.js';
import { $, esc, brl, pad, initials, ICON } from '../utils.js';

function renderServicos() {
  if (!core.servicos.length) return `<li><div class="grow sub">Esta barbearia ainda não cadastrou serviços.</div></li>`;
  return core.servicos.map(s => `
    <li>
      <div class="grow"><div class="name">${esc(s.nomeDoServico)}</div><div class="sub">${s.duracaoMinutos} min</div></div>
      <span class="price">${brl(s.preco)}</span>
      <button class="btn small" data-book data-s="${s.id}">Agendar</button>
    </li>`).join('');
}

function renderEquipe() {
  if (!core.barbeiros.length) return `<li><div class="grow sub">Nenhum barbeiro cadastrado.</div></li>`;
  return core.barbeiros.map(x => {
    const on = x.status === 'DISPONIVEL';
    return `<li>
      <span class="avatar" aria-hidden="true">${esc(initials(x.nome))}</span>
      <div class="grow"><div class="name">${esc(x.nome)}</div></div>
      <span class="chip ${on ? 'ok' : 'bad'}">${on ? 'Disponível' : 'Indisponível'}</span>
      ${on ? `<button class="btn small" data-book data-b="${x.id}">Agendar</button>` : ''}
    </li>`;
  }).join('');
}

function renderHorarios(shop) {
  const hoje = new Date().getDay();
  return [1, 2, 3, 4, 5, 6, 0].map(d => `
    <li class="${d === hoje ? 'today' : ''}"><span>${DIAS[d]}</span><span>${shop.horario.dias.includes(d) ? `${pad(shop.horario.inicio)}:00 às ${pad(shop.horario.fim)}:00` : 'Fechado'}</span></li>`).join('');
}

export function renderShop(app, id) {
  const shop = BARBEARIAS.find(x => x.id === id);
  if (!shop) {
    app.innerHTML = `<div class="wrap state"><b>Barbearia não encontrada</b><p>O link pode estar errado ou a barbearia saiu do hub.</p><a class="btn" href="#/">Ver todas as barbearias</a></div>`;
    return;
  }

  app.innerHTML = `
  <section class="shophead" style="background:${shop.cor}">
    <span class="mono" aria-hidden="true">${esc(shop.nome[0])}</span>
    <div class="wrap">
      <a class="back" href="#/">Voltar para as barbearias</a>
      <h1>${esc(shop.nome)}</h1>
      <div class="row">
        <span class="rate">${ICON.star}${shop.nota.toFixed(1)} (${shop.avaliacoes} avaliações)</span>
        <span>${esc(shop.bairro)}, ${esc(shop.cidade)}</span>
        <span>${esc(shop.preco)}</span>
      </div>
      <p class="desc">${esc(shop.desc)}</p>
    </div>
  </section>
  <div class="tiles thin" aria-hidden="true"></div>
  <div class="wrap shop-layout">
    <div>
      <h2 class="h-sec">Serviços</h2>
      <div class="panel"><ul class="list">${renderServicos()}</ul></div>
      <h2 class="h-sec">Equipe</h2>
      <div class="panel"><ul class="list">${renderEquipe()}</ul></div>
    </div>
    <aside class="panel sticky" aria-label="Agendamento">
      <h3>Agende seu horário</h3>
      <p class="hint" style="margin:0">Escolha serviço, barbeiro e um horário livre.</p>
      <ul class="hours">${renderHorarios(shop)}</ul>
      <button class="btn primary" data-book>Agendar horário</button>
    </aside>
  </div>`;

  $('.shop-layout', app).addEventListener('click', e => {
    const t = e.target.closest('[data-book]');
    if (!t) return;
    openBooking(shop, {
      servicoId: t.dataset.s ? +t.dataset.s : null,
      barbeiroId: t.dataset.b ? +t.dataset.b : null
    });
  });
}
