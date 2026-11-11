/* Faixa amarela que avisa que os dados são de exemplo (API não encontrada). */
import { API_BASE } from '../config.js';
import { $ } from '../utils.js';

export function showDemoBanner() {
  const banner = $('#demo');
  banner.style.display = 'block';
  $('.wrap', banner).textContent =
    `Modo demonstração: não encontrei a API em ${API_BASE || location.origin}. Os dados abaixo são de exemplo. Suba o Spring Boot (porta 8080) e recarregue para usar o banco real.`;
}
