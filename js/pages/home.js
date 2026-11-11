/* Página inicial: hero com busca, filtros, grade de barbearias e "Como funciona". */
import { BARBEARIAS, ALL_TAGS } from '../data/barbearias.js';
import { filters } from '../state.js';
import { renderBarbeariaCard } from '../components/barbearia-card.js';
import { $, esc, norm } from '../utils.js';

function drawGrid() {
  const q = norm(filters.q.trim());
  const list = BARBEARIAS
    .filter(b => (!filters.tag || b.tags.includes(filters.tag))
      && (!q || norm(`${b.nome} ${b.bairro} ${b.tags.join(' ')}`).includes(q)))
    .sort(filters.sort === 'nome'
      ? (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')
      : (a, b) => b.nota - a.nota);

  $('#count').textContent = `${list.length} ${list.length === 1 ? 'barbearia' : 'barbearias'}`;
  $('#grid').innerHTML = list.length
    ? list.map(renderBarbeariaCard).join('')
    : `<div class="empty"><b>Nenhuma barbearia encontrada</b>Tente outro nome, bairro ou limpe os filtros.</div>`;
}

export function renderHome(app) {
  app.innerHTML = `
  <section class="hero"><div class="wrap">
    <div>
      <h1><span>Escolha a barbearia.</span><span>Marque o horário.</span></h1>
      <p class="lead">Compare barbearias, veja quais barbeiros estão disponíveis e agende em menos de um minuto, sem ligar e sem fila.</p>
      <form class="search" role="search" id="hs">
        <input id="q" type="search" placeholder="Nome ou bairro" aria-label="Buscar barbearia por nome ou bairro" value="${esc(filters.q)}" autocomplete="off">
        <button type="submit">Buscar</button>
      </form>
    </div>
    <div class="pole" aria-hidden="true"><div class="stripes"></div></div>
  </div></section>

  <section class="block" id="lista"><div class="wrap">
    <div class="sec-head"><h2>Barbearias</h2><span class="count" id="count" aria-live="polite"></span></div>
    <div class="filters" id="filters">
      ${ALL_TAGS.map(t => `<button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="${filters.tag === t}">${esc(t)}</button>`).join('')}
      <span class="sp"></span>
      <label class="hint" for="sort">Ordenar por</label>
      <select id="sort"><option value="nota"${filters.sort === 'nota' ? ' selected' : ''}>Melhor avaliadas</option><option value="nome"${filters.sort === 'nome' ? ' selected' : ''}>Nome</option></select>
    </div>
    <div class="grid" id="grid"></div>
  </div></section>

  <section class="block" style="padding-top:0"><div class="wrap">
    <div class="sec-head"><h2>Como funciona</h2></div>
    <ol class="steps">
      <li><span class="n">1</span><b>Escolha</b><p>Busque pelo nome, pelo bairro ou pelo serviço que você precisa.</p></li>
      <li><span class="n">2</span><b>Monte o atendimento</b><p>Selecione o serviço e o barbeiro. Só aparecem horários realmente livres.</p></li>
      <li><span class="n">3</span><b>Confirme</b><p>Informe nome e telefone. Para cancelar, use Meus agendamentos.</p></li>
    </ol>
  </div></section>`;

  $('#hs').addEventListener('submit', e => { e.preventDefault(); drawGrid(); $('#lista').scrollIntoView(); });
  $('#q').addEventListener('input', e => { filters.q = e.target.value; drawGrid(); });
  $('#sort').addEventListener('change', e => { filters.sort = e.target.value; drawGrid(); });
  $('#filters').addEventListener('click', e => {
    const chip = e.target.closest('[data-tag]');
    if (!chip) return;
    filters.tag = filters.tag === chip.dataset.tag ? null : chip.dataset.tag;
    document.querySelectorAll('#filters [data-tag]').forEach(x => x.setAttribute('aria-pressed', x.dataset.tag === filters.tag));
    drawGrid();
  });
  drawGrid();
}
