/* Roteador por hash: #/  #/barbearia/:id  #/agendamentos */
import { renderHome } from './pages/home.js';
import { renderShop } from './pages/shop.js';
import { renderMine } from './pages/mine.js';
import { setActiveNav } from './components/header.js';

export function startRouter(app) {
  const route = () => {
    const hash = location.hash || '#/';
    const shop = hash.match(/^#\/barbearia\/(\w+)$/);
    window.scrollTo(0, 0);

    if (shop) { setActiveNav('home'); return renderShop(app, shop[1]); }
    if (hash === '#/agendamentos') { setActiveNav('mine'); return renderMine(app); }
    setActiveNav('home');
    renderHome(app);
  };

  window.addEventListener('hashchange', route);
  route();
}
