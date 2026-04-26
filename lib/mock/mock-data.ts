/**
 * DADOS FICTÍCIOS PARALELOS PARA DESENVOLVIMENTO
 * Este arquivo contém todos os dados mockados do sistema
 * Quando ativo, substitui dados reais do Supabase
 */

// Tipos de dados
export interface MockUsuario {
  id: string
  nome: string
  email: string
  telefone: string
  cidade: string
  status: 'ativo' | 'inativo' | 'bloqueado'
  created_at: string
}

export interface MockEmpresa {
  id: string
  nome: string
  tipo: 'empresa' | 'profissional' | 'ambulante'
  categoria: string
  cidade: string
  status: 'ativo' | 'inativo'
  avaliacao: number
  whatsapp: string
  created_at: string
}

export interface MockProduto {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagem?: string
  empresa_id: string
  codigo_barras?: string
  estoque: number
  created_at: string
}

export interface MockAgendamento {
  id: string
  usuario_id: string
  profissional_id: string
  servico: string
  data: string
  horario: string
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  created_at: string
}

export interface MockTransacao {
  id: string
  usuario_id: string
  descricao: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  status: 'pendente' | 'pago' | 'atrasado'
  forma_pagamento: string
  data: string
  created_at: string
}

export interface MockProdutoCatalogo {
  id: string
  servicoId: string
  nome: string
  descricao: string
  preco: number
  imagem?: string
  categoria: string
  ativo: boolean
  publicado: boolean
  createdAt: string
}

export interface MockTarefa {
  id: string
  titulo: string
  descricao: string
  atribuidoPara?: string
  atribuidoPor: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta'
  dataCriacao: string
  dataLimite?: string
  concluidaEm?: string
}

export interface MockMensagemCliente {
  id: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  servicoId: string
  mensagem: string
  resposta?: string
  status: 'pendente' | 'respondida'
  dataEnvio: string
  dataResposta?: string
}

export interface MockExtrato {
  id: string
  tipo: 'agendamento' | 'produto' | 'servico'
  descricao: string
  valor: number
  data: string
  clienteNome?: string
  status: 'pago' | 'pendente' | 'cancelado'
}

export interface MockPlanoUsuario {
  id: string
  usuarioId: string
  tipoPlano: string
  status: 'pendente' | 'ativo' | 'cancelado' | 'expirado'
  dataInicio: string
  dataFim?: string
  dadosCadastro: {
    cpfCnpj?: string
    endereco?: string
    localizador?: string
    complemento?: string
  }
  pagamento: {
    status: 'pendente' | 'pago' | 'cancelado'
    metodo?: string
    dataPagamento?: string
    valorPago?: number
  }
  createdAt: string
}

// Dados Mockados
export const MOCK_DATA = {
  usuarios: [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '5575999999999',
      cidade: 'Valente',
      status: 'ativo',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '5575988888888',
      cidade: 'Valente',
      status: 'ativo',
      created_at: '2024-02-20T14:30:00Z'
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      email: 'pedro@email.com',
      telefone: '5575977777777',
      cidade: 'Santa Luiz',
      status: 'inativo',
      created_at: '2024-03-10T09:15:00Z'
    }
  ] as MockUsuario[],

  empresas: [
    {
      id: '1',
      nome: 'Barbearia do Zé',
      tipo: 'profissional',
      categoria: 'Beleza',
      cidade: 'Valente',
      status: 'ativo',
      avaliacao: 4.5,
      whatsapp: '5575991111111',
      created_at: '2024-01-10T08:00:00Z'
    },
    {
      id: '2',
      nome: 'Mercado Central',
      tipo: 'empresa',
      categoria: 'Alimentação',
      cidade: 'Valente',
      status: 'ativo',
      avaliacao: 4.2,
      whatsapp: '5575992222222',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '3',
      nome: 'Ambulante João',
      tipo: 'ambulante',
      categoria: 'Vendas',
      cidade: 'Conceição do Coité',
      status: 'ativo',
      avaliacao: 4.0,
      whatsapp: '5575993333333',
      created_at: '2024-02-01T12:00:00Z'
    }
  ] as MockEmpresa[],

  produtos: [
    {
      id: '1',
      nome: 'Camiseta Básica',
      descricao: 'Camiseta de algodão 100%',
      preco: 45.90,
      categoria: 'Roupas',
      empresa_id: '2',
      codigo_barras: '7891234567890',
      estoque: 50,
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      nome: 'Calça Jeans',
      descricao: 'Calça jeans slim fit',
      preco: 89.90,
      categoria: 'Roupas',
      empresa_id: '2',
      codigo_barras: '7891234567891',
      estoque: 30,
      created_at: '2024-01-22T11:00:00Z'
    },
    {
      id: '3',
      nome: 'Tênis Esportivo',
      descricao: 'Tênis para corrida',
      preco: 159.90,
      categoria: 'Calçados',
      empresa_id: '2',
      codigo_barras: '7891234567892',
      estoque: 20,
      created_at: '2024-01-25T14:00:00Z'
    }
  ] as MockProduto[],

  agendamentos: [
    {
      id: '1',
      usuario_id: '1',
      profissional_id: '1',
      servico: 'Corte de Cabelo',
      data: '2024-04-25',
      horario: '14:00',
      status: 'confirmado',
      created_at: '2024-04-20T10:00:00Z'
    },
    {
      id: '2',
      usuario_id: '2',
      profissional_id: '1',
      servico: 'Barba',
      data: '2024-04-26',
      horario: '10:00',
      status: 'pendente',
      created_at: '2024-04-21T15:00:00Z'
    }
  ] as MockAgendamento[],

  transacoes: [
    {
      id: '1',
      usuario_id: '1',
      descricao: 'Emprestimo Nubank',
      tipo: 'despesa',
      valor: 456.84,
      categoria: 'Emprestimo',
      status: 'pendente',
      forma_pagamento: 'boleto',
      data: '2024-04-02',
      created_at: '2024-04-02T10:00:00Z'
    },
    {
      id: '2',
      usuario_id: '1',
      descricao: 'Compra Fogão Eletrolux',
      tipo: 'despesa',
      valor: 180.00,
      categoria: 'Eletrodomestico',
      status: 'pendente',
      forma_pagamento: 'pix',
      data: '2024-04-08',
      created_at: '2024-04-08T14:00:00Z'
    },
    {
      id: '3',
      usuario_id: '1',
      descricao: 'Serviço de pintura',
      tipo: 'receita',
      valor: 2500.00,
      categoria: 'Empreitada',
      status: 'pendente',
      forma_pagamento: 'pix',
      data: '2024-04-30',
      created_at: '2024-04-15T09:00:00Z'
    }
  ] as MockTransacao[],

  produtosCatalogo: [
    {
      id: '1',
      servicoId: '1',
      nome: 'Corte Masculino Premium',
      descricao: 'Corte de cabelo masculino com lavagem e finalização',
      preco: 50.00,
      categoria: 'Cabelo',
      ativo: true,
      publicado: true,
      createdAt: '2024-04-01T10:00:00Z'
    },
    {
      id: '2',
      servicoId: '1',
      nome: 'Barba Modelada',
      descricao: 'Barba feita com toalha quente e óleo',
      preco: 35.00,
      categoria: 'Barba',
      ativo: true,
      publicado: true,
      createdAt: '2024-04-01T11:00:00Z'
    },
    {
      id: '3',
      servicoId: '1',
      nome: 'Combo Corte + Barba',
      descricao: 'Corte e barba com desconto especial',
      preco: 75.00,
      categoria: 'Combo',
      ativo: true,
      publicado: true,
      createdAt: '2024-04-01T12:00:00Z'
    },
    {
      id: '4',
      servicoId: '1',
      nome: 'Pigmentação de Sobrancelha',
      descricao: 'Micropigmentação de sobrancelha',
      preco: 150.00,
      categoria: 'Estética',
      ativo: false,
      publicado: false,
      createdAt: '2024-04-05T14:00:00Z'
    }
  ] as MockProdutoCatalogo[],

  tarefas: [
    {
      id: '1',
      titulo: 'Repor produtos de barbearia',
      descricao: 'Comprar shampoo, condicionador e óleos',
      atribuidoPara: 'col1',
      atribuidoPor: 'admin',
      status: 'pendente',
      prioridade: 'media',
      dataCriacao: '2024-04-20T09:00:00Z',
      dataLimite: '2024-04-25T18:00:00Z'
    },
    {
      id: '2',
      titulo: 'Limpeza da sala de espera',
      descricao: 'Organizar e limpar a área de espera dos clientes',
      atribuidoPara: 'col2',
      atribuidoPor: 'admin',
      status: 'em_andamento',
      prioridade: 'alta',
      dataCriacao: '2024-04-21T10:00:00Z',
      dataLimite: '2024-04-21T14:00:00Z'
    },
    {
      id: '3',
      titulo: 'Atualizar catálogo de serviços',
      descricao: 'Adicionar novos serviços ao catálogo online',
      atribuidoPor: 'admin',
      status: 'pendente',
      prioridade: 'baixa',
      dataCriacao: '2024-04-22T08:00:00Z'
    }
  ] as MockTarefa[],

  mensagensClientes: [
    {
      id: '1',
      clienteId: '1',
      clienteNome: 'João Silva',
      clienteTelefone: '75999991001',
      servicoId: '1',
      mensagem: 'Gostaria de saber se tem horário disponível para sábado às 14h',
      status: 'pendente',
      dataEnvio: '2024-04-24T10:30:00Z'
    },
    {
      id: '2',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      clienteTelefone: '75999991002',
      servicoId: '1',
      mensagem: 'Qual o valor do combo corte + barba?',
      resposta: 'O combo está por R$ 75,00 com desconto de R$ 10,00',
      status: 'respondida',
      dataEnvio: '2024-04-23T15:00:00Z',
      dataResposta: '2024-04-23T15:30:00Z'
    }
  ] as MockMensagemCliente[],

  extrato: [
    {
      id: '1',
      tipo: 'agendamento',
      descricao: 'Corte Masculino - João Silva',
      valor: 50.00,
      data: '2024-04-24',
      clienteNome: 'João Silva',
      status: 'pago'
    },
    {
      id: '2',
      tipo: 'agendamento',
      descricao: 'Barba Modelada - Pedro Costa',
      valor: 35.00,
      data: '2024-04-24',
      clienteNome: 'Pedro Costa',
      status: 'pago'
    },
    {
      id: '3',
      tipo: 'produto',
      descricao: 'Combo Corte + Barba - Ana Paula',
      valor: 75.00,
      data: '2024-04-23',
      clienteNome: 'Ana Paula',
      status: 'pago'
    },
    {
      id: '4',
      tipo: 'agendamento',
      descricao: 'Corte Masculino - Carlos Eduardo',
      valor: 50.00,
      data: '2024-04-25',
      clienteNome: 'Carlos Eduardo',
      status: 'pendente'
    },
    {
      id: '5',
      tipo: 'servico',
      descricao: 'Limpeza Facial - Fernanda Lima',
      valor: 80.00,
      data: '2024-04-22',
      clienteNome: 'Fernanda Lima',
      status: 'pago'
    }
  ] as MockExtrato[],

  planosUsuario: [
    {
      id: '1',
      usuarioId: '1',
      tipoPlano: 'academia_gratis',
      status: 'ativo',
      dataInicio: '2024-04-01T00:00:00Z',
      dadosCadastro: {
        nome: 'João Silva',
        whatsapp: '75999999999',
        cidadeBase: 'Valente - BA'
      },
      pagamento: {
        status: 'pago',
        valorPago: 0
      },
      createdAt: '2024-04-01T00:00:00Z'
    },
    {
      id: '2',
      usuarioId: 'servico-test-1',
      tipoPlano: 'servico_agendamento_premium',
      status: 'ativo',
      dataInicio: '2024-04-01T00:00:00Z',
      dadosCadastro: {
        cpfCnpj: '12.345.678/0001-90',
        nomeResponsavel: 'Pedro Costa',
        nomeFantasia: 'Barbearia do Pedro',
        endereco: 'Rua Principal, 123',
        localizador: 'Casa 1',
        complemento: 'Bairro Centro',
        cidadeBase: 'Valente - BA'
      },
      pagamento: {
        status: 'pago',
        metodo: 'pix',
        dataPagamento: '2024-04-01T00:00:00Z',
        valorPago: 35.00
      },
      createdAt: '2024-04-01T00:00:00Z'
    }
  ] as MockPlanoUsuario[]
}

// Funções auxiliares para simular comportamento do Supabase
export const mockHelpers = {
  // Simula delay de rede
  delay: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Simula erro aleatório (5% de chance)
  randomError: () => {
    if (Math.random() < 0.05) {
      return { error: new Error('Erro simulado de rede') }
    }
    return { error: null }
  },

  // Gera ID único
  generateId: () => Math.random().toString(36).substr(2, 9),

  // Filtra dados por campo
  filterBy: <T>(data: T[], field: keyof T, value: any) => {
    return data.filter(item => item[field] === value)
  },

  // Ordena dados
  orderBy: <T>(data: T[], field: keyof T, ascending: boolean = true) => {
    return [...data].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]
      if (aVal < bVal) return ascending ? -1 : 1
      if (aVal > bVal) return ascending ? 1 : -1
      return 0
    })
  }
}
