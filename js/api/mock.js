/*
 * Servidor de mentira para o modo demonstração.
 * Reproduz as regras do AgendamentoService: data futura, barbeiro disponível e conflito de horário.
 */
import { toISO, parseDT } from '../utils.js';

const M = {servicos: [], barbeiros: [], clientes: [], agendamentos: []};

export function seedMock() {
  M.servicos = [
    {nomeDoServico: 'Corte', preco: 55, duracaoMinutos: 30},
    {nomeDoServico: 'Barba', preco: 40, duracaoMinutos: 30},
    {nomeDoServico: 'Corte e barba', preco: 90, duracaoMinutos: 60},
    {nomeDoServico: 'Degradê navalhado', preco: 65, duracaoMinutos: 45},
    {nomeDoServico: 'Sobrancelha', preco: 20, duracaoMinutos: 15},
    {nomeDoServico: 'Corte infantil', preco: 45, duracaoMinutos: 30},
    {nomeDoServico: 'Pigmentação', preco: 70, duracaoMinutos: 40}
  ].map((s, i) => ({id: i + 1, ...s}));

  M.barbeiros = [
    {id: 1, nome: 'Rafael Souza', status: 'DISPONIVEL'},
    {id: 2, nome: 'Eduardo Martins', status: 'DISPONIVEL'},
    {id: 3, nome: 'Marcos Vieira', status: 'DISPONIVEL'},
    {id: 4, nome: 'Leandro Dias', status: 'INDISPONIVEL'}
  ];

  M.clientes = [{id: 1, nome: 'Carlos', sobrenome: 'Lima', numeroTelefone: '11999990000'}];

  // alguns horários ocupados amanhã, para ver o bloqueio de conflito
  const d = new Date(); d.setDate(d.getDate() + 1);
  const at = (h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return toISO(x); };
  M.agendamentos = [
    {id: 1, cliente: M.clientes[0], barbeiro: M.barbeiros[0], servico: M.servicos[2], status: 'AGENDADO', dataHora: at(10)},
    {id: 2, cliente: M.clientes[0], barbeiro: M.barbeiros[0], servico: M.servicos[0], status: 'AGENDADO', dataHora: at(14, 30)},
    {id: 3, cliente: M.clientes[0], barbeiro: M.barbeiros[1], servico: M.servicos[3], status: 'AGENDADO', dataHora: at(11)}
  ];
}

export async function mock(method, path, body) {
  await new Promise(r => setTimeout(r, 140));
  const err = (status, msg) => Object.assign(new Error(msg), {status});
  const clone = x => JSON.parse(JSON.stringify(x));
  const nextId = list => Math.max(0, ...list.map(x => x.id)) + 1;

  if (method === 'GET' && path === '/servicos') return clone(M.servicos);
  if (method === 'GET' && path === '/barbeiros') return clone(M.barbeiros);
  if (method === 'GET' && path === '/clientes') return clone(M.clientes);
  if (method === 'GET' && path === '/agendamentos') return clone(M.agendamentos);

  if (method === 'POST' && path === '/clientes') {
    if (!body.nome?.trim() || !body.sobrenome?.trim()) throw err(400, 'O nome e o sobrenome são obrigatórios.');
    if (!/^\d{10,11}$/.test(body.numeroTelefone || '')) throw err(400, 'Telefone deve ter 10 ou 11 digitos, apenas numeros');
    const c = {id: nextId(M.clientes), nome: body.nome, sobrenome: body.sobrenome, numeroTelefone: body.numeroTelefone};
    M.clientes.push(c);
    return clone(c);
  }

  if (method === 'POST' && path === '/agendamentos') {
    const inicio = parseDT(body.dataHora);
    if (!(inicio > new Date())) throw err(400, 'Informe uma data e hora que ainda não ocorreram');
    const cliente = M.clientes.find(c => c.id === body.clienteId); if (!cliente) throw err(404, 'Cliente não encontrado');
    const barbeiro = M.barbeiros.find(b => b.id === body.barbeiroId); if (!barbeiro) throw err(404, 'Barbeiro não encontrado');
    const servico = M.servicos.find(s => s.id === body.servicoId); if (!servico) throw err(404, 'Serviço não encontrado');
    if (barbeiro.status !== 'DISPONIVEL') throw err(400, 'Não é possivel agendar um barbeiro indisponível');

    const fim = new Date(inicio.getTime() + servico.duracaoMinutos * 60000);
    const conflito = M.agendamentos.some(a => {
      if (a.barbeiro.id !== barbeiro.id || a.status === 'CANCELADO') return false;
      const s = parseDT(a.dataHora);
      const e = new Date(s.getTime() + a.servico.duracaoMinutos * 60000);
      return inicio < e && fim > s;
    });
    if (conflito) throw err(409, 'O barbeiro já possui um agendamento que conflita com esse horário');

    const ag = {id: nextId(M.agendamentos), cliente, barbeiro, servico, status: 'AGENDADO', dataHora: body.dataHora};
    M.agendamentos.push(ag);
    return clone(ag);
  }

  const m = method === 'PATCH' && path.match(/^\/agendamentos\/(\d+)\/status$/);
  if (m) {
    const ag = M.agendamentos.find(a => a.id === +m[1]); if (!ag) throw err(404, 'Agendamento não encontrado');
    if (ag.status !== 'AGENDADO') throw err(400, `Agendamento já está ${ag.status} e não pode ser alterado`);
    ag.status = body.status;
    return clone(ag);
  }

  throw err(404, 'Rota não encontrada');
}
