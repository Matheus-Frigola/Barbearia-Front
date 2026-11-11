/* Ponto de entrada: carrega serviços e barbeiros da API e liga o roteador. */
import { loadCore } from './state.js';
import { startRouter } from './router.js';
import { showDemoBanner } from './components/demo-banner.js';
import { $, esc } from './utils.js';

const app = $('#app');

async function boot() {
  app.innerHTML = `<div class="wrap state">Carregando…</div>`;
  try {
    const demo = await loadCore();
      if (demo) showDemoBanner();
  } catch (e) {
    app.innerHTML = `<div class="wrap state"><b>Não foi possível carregar os dados</b><p>${esc(e.message)}</p><button class="btn" id="retry">Tentar de novo</button></div>`;
    $('#retry').addEventListener('click', () => location.reload());
    return;
  }
  startRouter(app);
}

boot();
