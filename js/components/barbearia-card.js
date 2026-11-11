/* Card de barbearia da grade da home. Devolve HTML. */
import { esc, ICON } from '../utils.js';

export function renderBarbeariaCard(b) {
  return `<a class="card" href="#/barbearia/${b.id}" aria-label="${esc(b.nome)}, ${esc(b.bairro)}">
    <div class="cover" style="background:${b.cor}"><span class="mono" aria-hidden="true">${esc(b.nome[0])}</span><span class="tag">${esc(b.preco)}</span></div>
    <div class="body">
      <h3>${esc(b.nome)}</h3>
      <div class="row">
        <span class="rate">${ICON.star}${b.nota.toFixed(1)} <span class="reviews">(${b.avaliacoes})</span></span>
        <span>${esc(b.bairro)}, ${esc(b.cidade)}</span>
      </div>
      <div class="tags">${b.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <span class="go">Ver horários</span>
    </div></a>`;
}
