/* Aviso rápido (elemento #toast do index.html). */
import { $ } from '../utils.js';

let timer;

export function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('on'), 3200);
}
