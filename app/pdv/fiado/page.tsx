'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  History,
  Download,
  Send,
  Bell,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ClienteFiado {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  cpf: string;
  dataCadastro: Date;
  limiteCredito: number;
  saldoUtilizado: number;
  saldoDisponivel: number;
  status: 'ativo' | 'bloqueado' | 'inadimplente';
  ultimaCompra: Date;
}

interface ItemDivida {
  nome: string;
  quantidade: number;
  preco: number;
}

interface Divida {
  id: string;
  clienteId: string;
  clienteNome: string;
  valor: number;
  valorPago: number;
  saldoDevedor: number;
  dataVenda: Date;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'parcial' | 'pago' | 'vencido';
  itens: ItemDivida[];
  observacoes: string;
}

interface Pagamento {
  id: string;
  dividaId: string;
  valor: number;
  data: Date;
  metodo: 'dinheiro' | 'pix' | 'cartao';
  comprovante?: string;
}

type FiltroStatus = 'todos' | 'pendente' | 'vencido' | 'pago';

export default function FiadoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteFiado[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [showModalDivida, setShowModalDivida] = useState(false);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteFiado | null>(null);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [formCliente, setFormCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cpf: '',
    limiteCredito: 500
  });
  const [valorPagamento, setValorPagamento] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState<'dinheiro' | 'pix' | 'cartao'>('dinheiro');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Simular carregamento - em produção, chamar APIs
      setTimeout(() => {
        // Dados mock
        const mockClientes: ClienteFiado[] = [
          {
            id: '1',
            nome: 'João Silva',
            telefone: '(75) 99999-1111',
            email: 'joao@email.com',
            endereco: 'Rua A, 123, Centro',
            cpf: '123.456.789-00',
            dataCadastro: new Date('2024-01-15'),
            limiteCredito: 500,
            saldoUtilizado: 250,
            saldoDisponivel: 250,
            status: 'ativo',
            ultimaCompra: new Date('2024-06-01')
          },
          {
            id: '2',
            nome: 'Maria Santos',
            telefone: '(75) 99999-2222',
            email: 'maria@email.com',
            endereco: 'Rua B, 456, Bairro Novo',
            cpf: '987.654.321-00',
            dataCadastro: new Date('2024-02-20'),
            limiteCredito: 1000,
            saldoUtilizado: 800,
            saldoDisponivel: 200,
            status: 'ativo',
            ultimaCompra: new Date('2024-06-05')
          },
          {
            id: '3',
            nome: 'Carlos Oliveira',
            telefone: '(75) 99999-3333',
            email: 'carlos@email.com',
            endereco: 'Rua C, 789, Industrial',
            cpf: '456.789.123-00',
            dataCadastro: new Date('2024-03-10'),
            limiteCredito: 300,
            saldoUtilizado: 300,
            saldoDisponivel: 0,
            status: 'bloqueado',
            ultimaCompra: new Date('2024-05-20')
          }
        ];

        const mockDividas: Divida[] = [
          {
            id: '1',
            clienteId: '1',
            clienteNome: 'João Silva',
            valor: 150.00,
            valorPago: 0,
            saldoDevedor: 150.00,
            dataVenda: new Date('2024-06-01'),
            dataVencimento: new Date('2024-06-15'),
            status: 'pendente',
            itens: [
              { nome: 'Arroz 5kg', quantidade: 2, preco: 25.90 },
              { nome: 'Feijão 1kg', quantidade: 3, preco: 8.50 }
            ],
            observacoes: 'Cliente novo, primeira compra'
          },
          {
            id: '2',
            clienteId: '1',
            clienteNome: 'João Silva',
            valor: 100.00,
            valorPago: 100.00,
            saldoDevedor: 0,
            dataVenda: new Date('2024-05-15'),
            dataVencimento: new Date('2024-05-30'),
            dataPagamento: new Date('2024-05-28'),
            status: 'pago',
            itens: [
              { nome: 'Óleo de Soja', quantidade: 2, preco: 6.90 },
              { nome: 'Sabonete', quantidade: 5, preco: 2.50 }
            ],
            observacoes: ''
          },
          {
            id: '3',
            clienteId: '2',
            clienteNome: 'Maria Santos',
            valor: 250.00,
            valorPago: 0,
            saldoDevedor: 250.00,
            dataVenda: new Date('2024-06-05'),
            dataVencimento: new Date('2024-06-20'),
            status: 'pendente',
            itens: [
              { nome: 'Coca-Cola 2L', quantidade: 10, preco: 9.90 },
              { nome: 'Detergente', quantidade: 5, preco: 1.99 }
            ],
            observacoes: ''
          }
        ];

        setClientes(mockClientes);
        setDividas(mockDividas);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const salvarCliente = async () => {
    if (!formCliente.nome || !formCliente.telefone) {
      toast.error('Preencha nome e telefone');
      return;
    }

    try {
      const novoCliente: ClienteFiado = {
        id: Date.now().toString(),
        nome: formCliente.nome,
        telefone: formCliente.telefone,
        email: formCliente.email,
        endereco: formCliente.endereco,
        cpf: formCliente.cpf,
        dataCadastro: new Date(),
        limiteCredito: formCliente.limiteCredito,
        saldoUtilizado: 0,
        saldoDisponivel: formCliente.limiteCredito,
        status: 'ativo',
        ultimaCompra: new Date()
      };
      setClientes([novoCliente, ...clientes]);
      toast.success('Cliente cadastrado com sucesso!');
      setShowModalCliente(false);
      resetFormCliente();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao cadastrar cliente');
    }
  };

  const registrarPagamento = async () => {
    if (!selectedDivida || valorPagamento <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (valorPagamento > selectedDivida.saldoDevedor) {
      toast.error('Valor excede o saldo devedor');
      return;
    }

    try {
      const novoPagamento: Pagamento = {
        id: Date.now().toString(),
        dividaId: selectedDivida.id,
        valor: valorPagamento,
        data: new Date(),
        metodo: metodoPagamento
      };

      const novoValorPago = selectedDivida.valorPago + valorPagamento;
      const novoSaldoDevedor = selectedDivida.saldoDevedor - valorPagamento;
      const novoStatus = novoSaldoDevedor === 0 ? 'pago' : 'parcial';

      const dividaAtualizada: Divida = {
        ...selectedDivida,
        valorPago: novoValorPago,
        saldoDevedor: novoSaldoDevedor,
        status: novoStatus,
        dataPagamento: novoSaldoDevedor === 0 ? new Date() : undefined
      };

      setPagamentos([novoPagamento, ...pagamentos]);
      setDividas(dividas.map(d => d.id === selectedDivida.id ? dividaAtualizada : d));
      
      // Atualizar saldo do cliente
      const cliente = clientes.find(c => c.id === selectedDivida.clienteId);
      if (cliente) {
        const novoSaldoUtilizado = Math.max(0, cliente.saldoUtilizado - valorPagamento);
        setClientes(clientes.map(c => 
          c.id === cliente.id 
            ? { ...c, saldoUtilizado: novoSaldoUtilizado, saldoDisponivel: c.limiteCredito - novoSaldoUtilizado }
            : c
        ));
      }

      toast.success(`Pagamento de R$ ${valorPagamento.toFixed(2)} registrado!`);
      
      // Enviar notificação push
      enviarNotificacao(cliente?.nome || '', valorPagamento);
      
      setShowModalPagamento(false);
      setSelectedDivida(null);
      setValorPagamento(0);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const enviarNotificacao = (clienteNome: string, valor: number) => {
    console.log(`Notificação enviada para ${clienteNome}: Pagamento de R$ ${valor.toFixed(2)} recebido`);
    toast.success(`Notificação enviada para ${clienteNome}`);
  };

  const enviarCobranca = (divida: Divida) => {
    const cliente = clientes.find(c => c.id === divida.clienteId);
    if (cliente) {
      toast.success(`Cobrança enviada para ${cliente.nome}`);
    }
  };

  const resetFormCliente = () => {
    setFormCliente({
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      cpf: '',
      limiteCredito: 500
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusColor = (status: string) => {
    const cores: Record<string, string> = {
      ativo: 'bg-green-100 text-green-800',
      bloqueado: 'bg-red-100 text-red-800',
      inadimplente: 'bg-orange-100 text-orange-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      parcial: 'bg-blue-100 text-blue-800',
      pago: 'bg-green-100 text-green-800',
      vencido: 'bg-red-100 text-red-800'
    };
    return cores[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusTexto = (status: string) => {
    const textos: Record<string, string> = {
      ativo: 'Ativo',
      bloqueado: 'Bloqueado',
      inadimplente: 'Inadimplente',
      pendente: 'Pendente',
      parcial: 'Parcial',
      pago: 'Pago',
      vencido: 'Vencido'
    };
    return textos[status] || status;
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca)
  );

  const dividasFiltradas = dividas.filter(divida => {
    if (filtroStatus !== 'todos' && divida.status !== filtroStatus) return false;
    if (busca && !divida.clienteNome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalReceber = dividas.reduce((sum, d) => sum + d.saldoDevedor, 0);
  const totalVencido = dividas
    .filter(d => d.status === 'vencido' || (d.status === 'pendente' && new Date(d.dataVencimento) < new Date()))
    .reduce((sum, d) => sum + d.saldoDevedor, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Controle de Fiado
            </h1>
            <p className="text-sm text-gray-500">Gerencie crédito e cobranças</p>
          </div>
          <button
            onClick={() => setShowModalCliente(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-800">{clientes.filter(c => c.status === 'ativo').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total a Receber</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalReceber)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vencido</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalVencido)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Crédito Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(clientes.reduce((sum, c) => sum + c.saldoDisponivel, 0))}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex gap-4 px-4">
              <button
                onClick={() => setFiltroStatus('todos')}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  filtroStatus === 'todos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas as Contas
              </button>
              <button
                onClick={() => setFiltroStatus('pendente')}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  filtroStatus === 'pendente'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFiltroStatus('vencido')}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  filtroStatus === 'vencido'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Vencidas
              </button>
              <button
                onClick={() => setFiltroStatus('pago')}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  filtroStatus === 'pago'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pagas
              </button>
            </nav>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Saldo Devedor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dividasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma dívida encontrada
                    </td>
                  </tr>
                ) : (
                  dividasFiltradas.map((divida) => (
                    <tr key={divida.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{divida.clienteNome}</p>
                          <p className="text-xs text-gray-500">{formatDate(divida.dataVenda)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(divida.valor)}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(divida.saldoDevedor)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p>{formatDate(divida.dataVencimento)}</p>
                          {new Date(divida.dataVencimento) < new Date() && divida.status !== 'pago' && (
                            <p className="text-xs text-red-500">Vencida</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(divida.status)}`}>
                          {getStatusTexto(divida.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDivida(divida);
                              setShowModalPagamento(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Registrar Pagamento"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => enviarCobranca(divida)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Enviar Cobrança"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800">Clientes com Crédito</h2>
          </div>
          <div className="divide-y">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{cliente.nome}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(cliente.status)}`}>
                        {getStatusTexto(cliente.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        {cliente.telefone}
                      </div>
                      {cliente.email && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="w-3 h-3" />
                          {cliente.email}
                        </div>
                      )}
                      {cliente.endereco && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {cliente.endereco}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Limite</p>
                        <p className="font-medium">{formatCurrency(cliente.limiteCredito)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Utilizado</p>
                        <p className="font-medium text-red-600">{formatCurrency(cliente.saldoUtilizado)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Disponível</p>
                        <p className="font-medium text-green-600">{formatCurrency(cliente.saldoDisponivel)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Última Compra</p>
                        <p className="text-sm">{formatDate(cliente.ultimaCompra)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Histórico"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Novo Cliente */}
      {showModalCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Novo Cliente</h2>
                <button onClick={() => setShowModalCliente(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formCliente.nome}
                    onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    value={formCliente.telefone}
                    onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                    placeholder="(75) 99999-9999"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formCliente.email}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formCliente.endereco}
                    onChange={(e) => setFormCliente({ ...formCliente, endereco: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formCliente.cpf}
                    onChange={(e) => setFormCliente({ ...formCliente, cpf: e.target.value })}
                    placeholder="123.456.789-00"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Crédito</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="50"
                      value={formCliente.limiteCredito}
                      onChange={(e) => setFormCliente({ ...formCliente, limiteCredito: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalCliente(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarCliente}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showModalPagamento && selectedDivida && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Registrar Pagamento</h2>
                <button onClick={() => setShowModalPagamento(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{selectedDivida.clienteNome}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Saldo Devedor</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedDivida.saldoDevedor)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valor do Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      max={selectedDivida.saldoDevedor}
                      value={valorPagamento}
                      onChange={(e) => setValorPagamento(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMetodoPagamento('dinheiro')}
                      className={`p-2 border rounded-lg text-sm ${metodoPagamento === 'dinheiro' ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      Dinheiro
                    </button>
                    <button
                      onClick={() => setMetodoPagamento('pix')}
                      className={`p-2 border rounded-lg text-sm ${metodoPagamento === 'pix' ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      PIX
                    </button>
                    <button
                      onClick={() => setMetodoPagamento('cartao')}
                      className={`p-2 border rounded-lg text-sm ${metodoPagamento === 'cartao' ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      Cartão
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalPagamento(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registrarPagamento}
                    disabled={valorPagamento <= 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Confirmar Pagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

