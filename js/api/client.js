/*
 * Cliente da API Spring Boot.
 * Endpoints usados: /servicos, /barbeiros, /clientes, /agendamentos.
 * Se o servidor não responder, o app entra em modo demonstração (ver mock.js).
 */
import { API_BASE, FORCE_DEMO } from '../config.js';
import { mock } from './mock.js';

let demo = FORCE_DEMO;

export const isDemo = () => demo;
export const enableDemo = () => { demo = true; };

/**
 * Chama a API e devolve o JSON.
 * Em caso de erro lança Error com .status (HTTP) ou .network (servidor fora do ar).
 * A mensagem vem do GlobalExceptionHandler do Spring (campos "mensagem" ou "erros").
 */
export async function api(method, path, body) {
  if (demo) return mock(method, path, body);

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: body ? {'Content-Type': 'application/json'} : {},
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw Object.assign(new Error('Não foi possível conectar ao servidor.'), {network: true});
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.mensagem
      || (data?.erros && Object.values(data.erros).join(' '))
      || `Erro ${res.status} ao falar com o servidor.`;
    throw Object.assign(new Error(msg), {status: res.status});
  }
  return data;
}
