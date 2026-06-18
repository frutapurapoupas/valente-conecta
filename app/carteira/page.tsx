'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  QrCode,
  History,
  Copy,
  Check,
  DollarSign,
  Plus,
  Eye,
  EyeOff,
  Banknote,
  Smartphone,
  Clock,
  Award,
  Users,
  Gift
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: Date;
  status: 'concluida' | 'pendente' | 'cancelada';
  metodo: 'pix' | 'cartao' | 'dinheiro' | 'credito';
  destinatario?: string;
  comprovante?: string;
}

interface Saldo {
  disponivel: number;
  bloqueado: number;
  total: number;
}

interface Indicacao {
  id: string;
  nome: string;
  telefone: string;
  data: Date;
  status: 'pendente' | 'aprovado' | 'pago';
  bonus: number;
}

export default function CarteiraPage() {
  const [saldo, setSaldo] = useState<Saldo>({ disponivel: 0, bloqueado: 0, total: 0 });
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaldo, setShowSaldo] = useState(true);
  const [showModalRecarga, setShowModalRecarga] = useState(false);
  const [showModalTransferencia, setShowModalTransferencia] = useState(false);
  const [showModalIndicar, setShowModalIndicar] = useState(false);
  const [showModalSaque, setShowModalSaque] = useState(false);
  const [valorRecarga, setValorRecarga] = useState(0);
  const [valorTransferencia, setValorTransferencia] = useState(0);
  const [destinatarioTransferencia, setDestinatarioTransferencia] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix');
  const [chavePix, setChavePix] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [indicacaoNome, setIndicacaoNome] = useState('');
  const [indicacaoTelefone, setIndicacaoTelefone] = useState('');
  const [valorSaque, setValorSaque] = useState(0);
  const [chaveSaque, setChaveSaque] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockTransacoes: Transacao[] = [
          {
            id: '1',
            tipo: 'entrada',
            valor: 50.00,
            descricao: 'Recarga via PIX',
            data: new Date('2024-06-05'),
            status: 'concluida',
            metodo: 'pix'
          },
          {
            id: '2',
            tipo: 'saida',
            valor: 25.90,
            descricao: 'Pagamento - Pizza Calabresa',
            data: new Date('2024-06-04'),
            status: 'concluida',
            metodo: 'credito',
            destinatario: 'Pizzaria do Joao'
          },
          {
            id: '3',
            tipo: 'entrada',
            valor: 10.00,
            descricao: 'Bonus por indicacao',
            data: new Date('2024-06-03'),
            status: 'concluida',
            metodo: 'dinheiro'
          }
        ];

        const mockIndicacoes: Indicacao[] = [
          {
            id: '1',
            nome: 'Carlos Santos',
            telefone: '(75) 99999-4444',
            data: new Date('2024-06-01'),
            status: 'aprovado',
            bonus: 10
          },
          {
            id: '2',
            nome: 'Ana Paula',
            telefone: '(75) 99999-5555',
            data: new Date('2024-05-28'),
            status: 'pendente',
            bonus: 10
          }
        ];

        setSaldo({ disponivel: 34.10, bloqueado: 10.00, total: 44.10 });
        setTransacoes(mockTransacoes);
        setIndicacoes(mockIndicacoes);
        setChavePix('df79fd53-2ce0-4013-b906-44f8076e28a1');
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleRecarga = async () => {
    if (valorRecarga <= 0) {
      toast.error('Valor invalido');
      return;
    }

    try {
      if (metodoPagamento === 'pix') {
        toast.success('QR Code PIX gerado! Escaneie para pagar');
        setShowModalRecarga(false);
        setTimeout(() => {
          const novaTransacao: Transacao = {
            id: Date.now().toString(),
            tipo: 'entrada',
            valor: valorRecarga,
            descricao: 'Recarga via PIX',
            data: new Date(),
            status: 'pendente',
            metodo: 'pix'
          };
          setTransacoes([novaTransacao, ...transacoes]);
          setSaldo({ ...saldo, bloqueado: saldo.bloqueado + valorRecarga });
          toast.success('Recarga em processamento');
        }, 2000);
      } else {
        toast.success('Redirecionando para pagamento com cartao...');
        setShowModalRecarga(false);
      }
      setValorRecarga(0);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar recarga');
    }
  };

  const handleTransferencia = async () => {
    if (valorTransferencia <= 0) {
      toast.error('Valor invalido');
      return;
    }
    if (valorTransferencia > saldo.disponivel) {
      toast.error('Saldo insuficiente');
      return;
    }
    if (!destinatarioTransferencia.trim()) {
      toast.error('Digite o destinatario');
      return;
    }

    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'saida',
      valor: valorTransferencia,
      descricao: `Transferencia para ${destinatarioTransferencia}`,
      data: new Date(),
      status: 'concluida',
      metodo: 'credito',
      destinatario: destinatarioTransferencia
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setSaldo({ ...saldo, disponivel: saldo.disponivel - valorTransferencia, total: saldo.total - valorTransferencia });
    toast.success(`Transferencia de R$ ${valorTransferencia.toFixed(2)} enviada!`);
    setShowModalTransferencia(false);
    setValorTransferencia(0);
    setDestinatarioTransferencia('');
  };

  const handleIndicar = async () => {
    if (!indicacaoNome.trim() || !indicacaoTelefone.trim()) {
      toast.error('Preencha nome e telefone');
      return;
    }

    const novaIndicacao: Indicacao = {
      id: Date.now().toString(),
      nome: indicacaoNome,
      telefone: indicacaoTelefone,
      data: new Date(),
      status: 'pendente',
      bonus: 10
    };

    setIndicacoes([novaIndicacao, ...indicacoes]);
    toast.success('Indicacao registrada! Quando seu amigo se cadastrar, voce ganhara R$10');
    setShowModalIndicar(false);
    setIndicacaoNome('');
    setIndicacaoTelefone('');
  };

  const handleSaque = async () => {
    if (valorSaque <= 0) {
      toast.error('Valor invalido');
      return;
    }
    if (valorSaque > saldo.disponivel) {
      toast.error('Saldo insuficiente');
      return;
    }
    if (!chaveSaque.trim()) {
      toast.error('Digite a chave PIX para saque');
      return;
    }

    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'saida',
      valor: valorSaque,
      descricao: 'Saque via PIX',
      data: new Date(),
      status: 'pendente',
      metodo: 'pix'
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setSaldo({ ...saldo, disponivel: saldo.disponivel - valorSaque, bloqueado: saldo.bloqueado + valorSaque });
    toast.success(`Saque de R$ ${valorSaque.toFixed(2)} solicitado! Processado em ate 24h`);
    setShowModalSaque(false);
    setValorSaque(0);
    setChaveSaque('');
  };

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopiado(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusColor = (status: string) => {
    const cores = {
      concluida: 'text-green-600',
      pendente: 'text-yellow-600',
      cancelada: 'text-red-600'
    };
    return cores[status as keyof typeof cores] || 'text-gray-500';
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'pix': return <QrCode className="w-4 h-4" />;
      case 'cartao': return <CreditCard className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

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
              <Wallet className="w-6 h-6 text-blue-600" />
              Carteira Digital
            </h1>
            <p className="text-sm text-gray-500">Gerencie seu saldo e transacoes</p>
          </div>
          <button
            onClick={() => setShowModalIndicar(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Gift className="w-4 h-4" />
            Indicar Amigo
          </button>
        </div>

        {/* Card de Saldo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90">Saldo Disponível</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">
                  {showSaldo ? formatCurrency(saldo.disponivel) : '••••••'}
                </p>
                <button onClick={() => setShowSaldo(!showSaldo)} className="p-1 hover:bg-white/20 rounded">
                  {showSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Saldo Bloqueado</p>
              <p className="text-lg font-semibold">{formatCurrency(saldo.bloqueado)}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <div>
              <p className="text-sm opacity-90">Saldo Total</p>
              <p className="text-xl font-bold">{formatCurrency(saldo.total)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModalRecarga(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Recarregar
              </button>
              <button
                onClick={() => setShowModalTransferencia(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Transferir
              </button>
              <button
                onClick={() => setShowModalSaque(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Banknote className="w-4 h-4" />
                Sacar
              </button>
            </div>
          </div>
        </div>

        {/* Chave PIX */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sua Chave PIX</p>
                <p className="font-mono text-sm">{chavePix}</p>
              </div>
            </div>
            <button
              onClick={copiarChavePix}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Indicacoes */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Minhas Indicacoes
            </h2>
          </div>
          <div className="divide-y">
            {indicacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma indicacao ainda</p>
                <button
                  onClick={() => setShowModalIndicar(true)}
                  className="mt-2 text-blue-600 text-sm underline"
                >
                  Indicar agora
                </button>
              </div>
            ) : (
              indicacoes.map((ind) => (
                <div key={ind.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{ind.nome}</p>
                    <p className="text-sm text-gray-500">{ind.telefone}</p>
                    <p className="text-xs text-gray-400">{formatDate(ind.data)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+R$ {ind.bonus.toFixed(2)}</p>
                    <p className={`text-xs ${ind.status === 'aprovado' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {ind.status === 'aprovado' ? 'Pago' : 'Pendente'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transacoes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Ultimas Transacoes
            </h2>
          </div>
          <div className="divide-y">
            {transacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma transacao ainda</p>
              </div>
            ) : (
              transacoes.map((trans) => (
                <div key={trans.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${trans.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {trans.tipo === 'entrada' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{trans.descricao}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {formatDate(trans.data)}
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        {getMetodoIcon(trans.metodo)}
                        <span className={getStatusColor(trans.status)}>{trans.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`text-right font-semibold ${trans.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {trans.tipo === 'entrada' ? '+' : '-'} {formatCurrency(trans.valor)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Recarga */}
      {showModalRecarga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recarregar Saldo</h2>
                <button onClick={() => setShowModalRecarga(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={valorRecarga}
                      onChange={(e) => setValorRecarga(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMetodoPagamento('pix')}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${metodoPagamento === 'pix' ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      <QrCode className="w-6 h-6" />
                      <span className="text-sm">PIX</span>
                    </button>
                    <button
                      onClick={() => setMetodoPagamento('cartao')}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${metodoPagamento === 'cartao' ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm">Cartão</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleRecarga}
                  disabled={valorRecarga <= 0}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Transferencia */}
      {showModalTransferencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Transferir</h2>
                <button onClick={() => setShowModalTransferencia(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Destinatario</label>
                  <input
                    type="text"
                    value={destinatarioTransferencia}
                    onChange={(e) => setDestinatarioTransferencia(e.target.value)}
                    placeholder="Nome do usuario ou telefone"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={saldo.disponivel}
                      value={valorTransferencia}
                      onChange={(e) => setValorTransferencia(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Saldo disponivel: {formatCurrency(saldo.disponivel)}</p>
                </div>

                <button
                  onClick={handleTransferencia}
                  disabled={valorTransferencia <= 0 || valorTransferencia > saldo.disponivel || !destinatarioTransferencia}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Transferir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Indicacao */}
      {showModalIndicar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Indicar Amigo</h2>
                <button onClick={() => setShowModalIndicar(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg text-center mb-4">
                  <p className="text-purple-700 font-semibold">Ganhe R$10 por indicacao!</p>
                  <p className="text-sm text-purple-600">Seu amigo tambem ganha R$5 no primeiro cadastro</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Amigo</label>
                  <input
                    type="text"
                    value={indicacaoNome}
                    onChange={(e) => setIndicacaoNome(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={indicacaoTelefone}
                    onChange={(e) => setIndicacaoTelefone(e.target.value)}
                    placeholder="(75) 99999-9999"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleIndicar}
                  disabled={!indicacaoNome || !indicacaoTelefone}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Indicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {showModalSaque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Solicitar Saque</h2>
                <button onClick={() => setShowModalSaque(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor para Saque</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="5"
                      min="10"
                      max={saldo.disponivel}
                      value={valorSaque}
                      onChange={(e) => setValorSaque(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Saque minimo: R$10,00 | Disponível: {formatCurrency(saldo.disponivel)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={chaveSaque}
                    onChange={(e) => setChaveSaque(e.target.value)}
                    placeholder="CPF, Email, Telefone ou Chave aleatoria"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleSaque}
                  disabled={valorSaque < 10 || valorSaque > saldo.disponivel || !chaveSaque}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  Solicitar Saque
                </button>

                <p className="text-xs text-gray-400 text-center">
                  O saque sera processado em ate 24h uteis
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}