/* Estado compartilhado entre páginas e componentes. */
import { api, isDemo, enableDemo } from './api/client.js';
import { seedMock } from './api/mock.js';

/** Serviços e barbeiros vindos da API (iguais para todas as barbearias por enquanto). */
export const core = {servicos: [], barbeiros: []};

/** Filtros da home, mantidos ao navegar de volta. */
export const filters = {q: '', tag: null, sort: 'nota'};

/**
 * Carrega serviços e barbeiros.
 * Se o servidor estiver fora do ar, liga o modo demonstração e tenta de novo.
 * Devolve true quando está em modo demonstração.
 */
export async function loadCore() {
  const get = () => Promise.all([api('GET', '/servicos'), api('GET', '/barbeiros')]);

  if (isDemo()) seedMock();
  try {
    [core.servicos, core.barbeiros] = await get();
  } catch (e) {
    if (!e.network) throw e;
    enableDemo();
    seedMock();
    [core.servicos, core.barbeiros] = await get();
  }
  return isDemo();
}
