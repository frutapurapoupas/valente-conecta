// constants/cozinhaConstants.ts
// 📊 DADOS ESTÁTICOS - Cozinha

export const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

export const PRATOS_POR_DIA = 2;
export const DESCONTO_ASSINANTE = 15; // %
export const DESCONTO_REVENDEDOR = 19; // %
export const MINIMO_PORCOES_ASSINANTE = 5;

export const TELEFONE_WHATSAPP = '5575999999999';

// Fallback para quando não houver dados no banco
export const cardapioFallback = [
  {
    id: 1,
    dia: 'SEGUNDA-FEIRA',
    titulo: 'FRANGO COM QUIABO',
    descricao: 'Frango com quiabo, vinagrete, arroz e feijão.',
    preco: 12,
    imagem: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 2,
    dia: 'TERÇA-FEIRA',
    titulo: 'STROGONOFF',
    descricao: 'Strogonoff de frango, batata palha e arroz.',
    preco: 12,
    imagem: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 3,
    dia: 'QUARTA-FEIRA',
    titulo: 'FEIJOADA MAGRA',
    descricao: 'Feijoada magra, arroz, couve, farofa e laranja.',
    preco: 12,
    imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop'
  }
];

export const PERFIS = {
  PUBLICO: {
    id: 'publico',
    label: 'Público Geral',
    descricao: 'Preço cheio, sem compromisso',
    icone: '👤',
    desconto: 0,
    cor: 'from-blue-500 to-blue-700'
  },
  ASSINANTE: {
    id: 'assinante',
    label: 'Cliente Assinatura',
    descricao: `Desconto de ${DESCONTO_ASSINANTE}%, mínimo ${MINIMO_PORCOES_ASSINANTE} porções`,
    icone: '⭐',
    cor: 'from-yellow-500 to-yellow-700',
    desconto: DESCONTO_ASSINANTE,
    minPorcoes: MINIMO_PORCOES_ASSINANTE
  },
  REVENDEDOR: {
    id: 'revendedor',
    label: 'Parceiro Revendedor',
    descricao: `Desconto de ${DESCONTO_REVENDEDOR}%, contato com a cozinha`,
    icone: '🤝',
    cor: 'from-purple-500 to-purple-700',
    desconto: DESCONTO_REVENDEDOR
  }
};