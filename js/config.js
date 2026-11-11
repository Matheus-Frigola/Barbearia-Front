/*
 * Configuração.
 * - Servido pelo próprio Spring Boot (porta 8080): usa a mesma origem, sem CORS.
 * - Aberto de outro servidor (Live Server, por exemplo): usa http://localhost:8080
 *   e o Spring precisa liberar CORS.
 * - ?api=URL troca a API; ?demo=1 força o modo demonstração.
 */
const qs = new URLSearchParams(location.search);

export const API_BASE = qs.get('api') ?? (location.port === '8080' ? '' : 'http://localhost:8080');
export const FORCE_DEMO = qs.get('demo') === '1';
export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
