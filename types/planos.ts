export type TipoPlano = 
  | 'academia_gratis' 
  | 'academia_pago' 
  | 'profissional_basico' 
  | 'profissional_premium' 
  | 'servico_agendamento_gratis'
  | 'servico_agendamento_basico' 
  | 'servico_agendamento_premium' 
  | 'ambulante_basico' 
  | 'ambulante_premium'

export type CategoriaPlano = 'academia' | 'profissional' | 'servico_agendamento' | 'ambulante'

export interface ConfiguracaoPlano {
  id: TipoPlano
  nome: string
  categoria: CategoriaPlano
  preco: number
  precoConfiguravel: boolean
  descricao: string
  recursos: string[]
  limites: {
    usuarios?: number
    catalogoItens?: number
    relatorios?: boolean
    suportePrioritario?: boolean
    destaqueBusca?: boolean
    separacaoUsuarios?: boolean
  }
  ativo: boolean
}

export interface PlanoUsuario {
  id: string
  usuarioId: string
  tipoPlano: TipoPlano
  status: 'pendente' | 'ativo' | 'cancelado' | 'expirado'
  dataInicio: string
  dataFim?: string
  dataExpiracao?: string
  isPrePago?: boolean
  periodoPrePago?: number
  dadosCadastro: {
    nome?: string
    whatsapp?: string
    cpfCnpj?: string
    endereco?: string
    localizador?: string
    complemento?: string
    nomeResponsavel?: string
    nomeFantasia?: string
    cidadeBase?: string
  }
  pagamento: {
    status: 'pendente' | 'pago' | 'cancelado' | 'aguardando_pagamento'
    metodo?: string
    dataPagamento?: string
    valorPago?: number
  }
  createdAt: string
}

export type CampoCadastro = {
  nome: string
  label: string
  tipo: 'text' | 'tel'
  obrigatorio: boolean
  placeholder: string
  mascara?: string
}

export function getCamposCadastro(tipoPlano: TipoPlano, isGratis: boolean): CampoCadastro[] {
  const camposComuns: CampoCadastro[] = [
    {
      nome: 'cidadeBase',
      label: 'Cidade Base',
      tipo: 'text',
      obrigatorio: true,
      placeholder: 'Ex: Valente - BA'
    }
  ]

  if (isGratis) {
    return [
      {
        nome: 'nome',
        label: 'Nome',
        tipo: 'text',
        obrigatorio: true,
        placeholder: 'Seu nome'
      },
      {
        nome: 'whatsapp',
        label: 'WhatsApp',
        tipo: 'tel',
        obrigatorio: true,
        placeholder: '(75) 99999-9999',
        mascara: '(##) #####-####'
      },
      ...camposComuns
    ]
  }

  // Planos pagos para usuários comuns (apenas CPF)
  if (tipoPlano.includes('academia')) {
    return [
      {
        nome: 'cpfCnpj',
        label: 'CPF',
        tipo: 'text',
        obrigatorio: true,
        placeholder: '000.000.000-00',
        mascara: '###.###.###-##'
      },
      ...camposComuns
    ]
  }

  // Planos para empresas/profissionais (CNPJ completo)
  return [
    {
      nome: 'cpfCnpj',
      label: 'CNPJ',
      tipo: 'text',
      obrigatorio: true,
      placeholder: '00.000.000/0000-00',
      mascara: '##.###.###/####-##'
    },
    {
      nome: 'nomeResponsavel',
      label: 'Nome do Responsável',
      tipo: 'text',
      obrigatorio: true,
      placeholder: 'Nome completo do responsável'
    },
    {
      nome: 'nomeFantasia',
      label: 'Nome Fantasia',
      tipo: 'text',
      obrigatorio: true,
      placeholder: 'Nome da empresa/estabelecimento'
    },
    {
      nome: 'endereco',
      label: 'Endereço Completo',
      tipo: 'text',
      obrigatorio: true,
      placeholder: 'Rua, número, bairro'
    },
    {
      nome: 'localizador',
      label: 'Localizador',
      tipo: 'text',
      obrigatorio: true,
      placeholder: 'Ponto de referência'
    },
    {
      nome: 'complemento',
      label: 'Complemento',
      tipo: 'text',
      obrigatorio: false,
      placeholder: 'Informações adicionais'
    },
    ...camposComuns
  ]
}

export interface DadosPlanoConfiguravel {
  academiaPago: number
  profissionalBasico: number
  profissionalPremium: number
  servicoAgendamentoBasico: number
  servicoAgendamentoPremium: number
  ambulanteBasico: number
  ambulantePremium: number
}

export const CONFIGURACOES_PLANOS_INICIAIS: ConfiguracaoPlano[] = [
  {
    id: 'academia_gratis',
    nome: 'Academia Grátis',
    categoria: 'academia',
    preco: 0,
    precoConfiguravel: false,
    descricao: 'Acesso básico ao módulo de academia',
    recursos: [
      'Cadastro completo',
      'Navegação por todas as telas',
      'Sistema de indicações',
      'Participação em bônus',
      'Alertas de tempo gasto em atividades',
      'Acompanhamento de treinos'
    ],
    limites: {},
    ativo: true
  },
  {
    id: 'academia_pago',
    nome: 'Academia Premium',
    categoria: 'academia',
    preco: 9.90,
    precoConfiguravel: true,
    descricao: 'Todas as funcionalidades do módulo academia',
    recursos: [
      'Todas as funcionalidades do plano grátis',
      'Treinos personalizados',
      'Metas avançadas',
      'Histórico completo',
      'Relatórios de progresso',
      'Suporte prioritário'
    ],
    limites: {},
    ativo: true
  },
  {
    id: 'profissional_basico',
    nome: 'Profissional Básico',
    categoria: 'profissional',
    preco: 25.00,
    precoConfiguravel: true,
    descricao: 'Para profissionais liberais',
    recursos: [
      'Até 3 usuários',
      'Catálogo limitado a 10 itens',
      'Agendamento básico',
      'Gestão de clientes'
    ],
    limites: {
      usuarios: 3,
      catalogoItens: 10
    },
    ativo: true
  },
  {
    id: 'profissional_premium',
    nome: 'Profissional Premium',
    categoria: 'profissional',
    preco: 35.00,
    precoConfiguravel: true,
    descricao: 'Para profissionais com alto volume',
    recursos: [
      'Catálogo ilimitado',
      'Relatórios completos',
      'Visitas no perfil',
      'Contas a pagar e receber',
      'Separação por usuários',
      'Até 10 usuários',
      'Suporte prioritário',
      'Destaque na busca'
    ],
    limites: {
      usuarios: 10,
      catalogoItens: -1, // ilimitado
      relatorios: true,
      suportePrioritario: true,
      destaqueBusca: true,
      separacaoUsuarios: true
    },
    ativo: true
  },
  {
    id: 'servico_agendamento_gratis',
    nome: 'Serviço com Agendamento Grátis',
    categoria: 'servico_agendamento',
    preco: 0,
    precoConfiguravel: false,
    descricao: 'Para começar a oferecer serviços com agendamento',
    recursos: [
      'Cadastro básico',
      'Até 1 usuário',
      'Catálogo limitado a 5 itens',
      'Agendamento básico',
      'Gestão de clientes',
      'Extrato financeiro simplificado'
    ],
    limites: {
      usuarios: 1,
      catalogoItens: 5
    },
    ativo: true
  },
  {
    id: 'servico_agendamento_basico',
    nome: 'Serviço com Agendamento Básico',
    categoria: 'servico_agendamento',
    preco: 25.00,
    precoConfiguravel: true,
    descricao: 'Para serviços com agendamento (barbearias, clínicas, etc)',
    recursos: [
      'Todas as funcionalidades do plano grátis',
      'Até 3 usuários',
      'Catálogo limitado a 10 itens',
      'Gestão de agendamentos',
      'Resposta a clientes',
      'Gestão de tarefas',
      'Extrato financeiro completo'
    ],
    limites: {
      usuarios: 3,
      catalogoItens: 10
    },
    ativo: true
  },
  {
    id: 'servico_agendamento_premium',
    nome: 'Serviço com Agendamento Premium',
    categoria: 'servico_agendamento',
    preco: 35.00,
    precoConfiguravel: true,
    descricao: 'Para serviços com alto volume de agendamentos',
    recursos: [
      'Catálogo ilimitado',
      'Relatórios completos',
      'Visitas no perfil',
      'Contas a pagar e receber',
      'Separação por usuários',
      'Até 10 usuários',
      'Suporte prioritário',
      'Destaque na busca',
      'Todas funcionalidades do básico'
    ],
    limites: {
      usuarios: 10,
      catalogoItens: -1,
      relatorios: true,
      suportePrioritario: true,
      destaqueBusca: true,
      separacaoUsuarios: true
    },
    ativo: true
  },
  {
    id: 'ambulante_basico',
    nome: 'Ambulante Básico',
    categoria: 'ambulante',
    preco: 15.00,
    precoConfiguravel: true,
    descricao: 'Para ambulantes',
    recursos: [
      'Catálogo básico',
      'Gestão de estoque',
      'Vendas'
    ],
    limites: {
      catalogoItens: 20
    },
    ativo: true
  },
  {
    id: 'ambulante_premium',
    nome: 'Ambulante Premium',
    categoria: 'ambulante',
    preco: 25.00,
    precoConfiguravel: true,
    descricao: 'Para ambulantes com alto volume',
    recursos: [
      'Catálogo ilimitado',
      'Relatórios',
      'Suporte prioritário',
      'Destaque na busca'
    ],
    limites: {
      catalogoItens: -1,
      relatorios: true,
      suportePrioritario: true,
      destaqueBusca: true
    },
    ativo: true
  }
]

export const PRECOS_CONFIGURAVEIS_INICIAIS: DadosPlanoConfiguravel = {
  academiaPago: 9.90,
  profissionalBasico: 25.00,
  profissionalPremium: 35.00,
  servicoAgendamentoBasico: 25.00,
  servicoAgendamentoPremium: 35.00,
  ambulanteBasico: 15.00,
  ambulantePremium: 25.00
}

export function getPlanoPorTipo(tipo: TipoPlano): ConfiguracaoPlano | undefined {
  return CONFIGURACOES_PLANOS_INICIAIS.find(p => p.id === tipo)
}

export function getPlanosPorCategoria(categoria: CategoriaPlano): ConfiguracaoPlano[] {
  return CONFIGURACOES_PLANOS_INICIAIS.filter(p => p.categoria === categoria)
}

export function isPlanoGestao(tipo: TipoPlano): boolean {
  return ['profissional_basico', 'profissional_premium', 'servico_agendamento_basico', 'servico_agendamento_premium'].includes(tipo)
}

export function isPlanoAcademia(tipo: TipoPlano): boolean {
  return tipo.startsWith('academia_')
}
