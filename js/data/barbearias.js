/*
 * Catálogo do hub.
 * O banco AINDA NÃO tem a entidade Barbearia: estes dados são de exemplo e vivem só no front.
 * Quando a entidade existir, troque este arquivo por uma chamada GET /barbearias.
 */
export const BARBEARIAS = [
  {id: '1', nome: 'Navalha & Cia', bairro: 'Pinheiros', cidade: 'São Paulo', nota: 4.9, avaliacoes: 318, preco: '$$$', tags: ['Barba', 'Navalhado', 'Clássico'], cor: '#1D4E9E', horario: {inicio: 9, fim: 20, dias: [1, 2, 3, 4, 5, 6]}, desc: 'Corte e barba à moda antiga, com toalha quente e navalha.'},
  {id: '2', nome: 'Tatuapé 33', bairro: 'Tatuapé', cidade: 'São Paulo', nota: 4.7, avaliacoes: 204, preco: '$$', tags: ['Degradê', 'Corte', 'Infantil'], cor: '#C8252B', horario: {inicio: 9, fim: 19, dias: [1, 2, 3, 4, 5, 6]}, desc: 'Degradê na régua e atendimento rápido, inclusive para crianças.'},
  {id: '3', nome: 'Dom Fígaro', bairro: 'Vila Mariana', cidade: 'São Paulo', nota: 4.8, avaliacoes: 151, preco: '$$$', tags: ['Barba', 'Clássico', 'Sobrancelha'], cor: '#23262D', horario: {inicio: 10, fim: 20, dias: [2, 3, 4, 5, 6]}, desc: 'Ambiente tranquilo, hora marcada e tempo para cada cliente.'},
  {id: '4', nome: 'Corte Certo Santana', bairro: 'Santana', cidade: 'São Paulo', nota: 4.5, avaliacoes: 389, preco: '$', tags: ['Corte', 'Degradê', 'Infantil'], cor: '#1F6B4E', horario: {inicio: 8, fim: 18, dias: [1, 2, 3, 4, 5, 6]}, desc: 'Preço justo, fila organizada e horário todo dia útil.'},
  {id: '5', nome: 'Studio Brasa', bairro: 'Moema', cidade: 'São Paulo', nota: 4.8, avaliacoes: 96, preco: '$$$', tags: ['Barba', 'Degradê', 'Coloração'], cor: '#8A4B14', horario: {inicio: 10, fim: 21, dias: [2, 3, 4, 5, 6]}, desc: 'Coloração, pigmentação e cortes de tendência.'},
  {id: '6', nome: 'Barbearia do Zé', bairro: 'Centro', cidade: 'São Paulo', nota: 4.6, avaliacoes: 270, preco: '$', tags: ['Corte', 'Barba', 'Navalhado'], cor: '#5B3A8C', horario: {inicio: 9, fim: 19, dias: [1, 2, 3, 4, 5, 6]}, desc: 'A barbearia de bairro que atende desde 1994.'}
];

export const ALL_TAGS = [...new Set(BARBEARIAS.flatMap(b => b.tags))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
