/* Cabeçalho: marca o link ativo da navegação (o HTML do cabeçalho fica no index.html). */
export function setActiveNav(key) {
  document.querySelectorAll('nav.main a').forEach(a => {
    if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
