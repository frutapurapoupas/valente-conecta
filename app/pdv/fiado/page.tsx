'use client';

// Caminho: C:\valente_conecta\app\pdv\fiado\page.tsx
//
// Reescrita: a versao anterior era 100% mock (setTimeout + estado local,
// sem nenhuma persistencia, sem push real, sem lancar divida nova de
// verdade). Agora e' o modulo Fiado de verdade — opcional por loja, liberado
// pelo admin master sob solicitacao (ver 017_fiado.sql), escopado por
// dono_id (mesmo id local usado no resto do catalogo), com push real ao
// lancar um debito e lembretes automaticos (app/api/fiado/cron/lembretes).

import { useState, useEffect } from 'react';
import {
  Users, Plus, Search, DollarSign, CheckCircle, XCircle, AlertCircle,
  Phone, CreditCard, Send, Lock, Clock, Printer, MessageCircle, Receipt
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { obterUsuarioLocalId } from '@/lib/usuarioLocal';

interface ClienteFiado {
  id: string;
  nome: string;
  telefone: string;
  cliente_usuario_id: string | null;
  limite_credito: number;
}

interface Divida {
  id: string;
  cliente_id: string;
  valor_total: number;
  valor_pago: number;
  data_venda: string;
  data_vencimento: string;
  status: 'pendente' | 'parcial' | 'pago' | 'vencido';
  observacoes: string | null;
  fiado_clientes?: { nome: string; telefone: string };
}

type FiltroStatus = 'todos' | 'pendente' | 'vencido' | 'pago';

export default function FiadoPage() {
  const [donoId, setDonoId] = useState('');
  const [habilitacao, setHabilitacao] = useState<{ ativo: boolean } | null | undefined>(undefined);
  const [clientes, setClientes] = useState<ClienteFiado[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [showModalDivida, setShowModalDivida] = useState(false);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', limiteCredito: 500 });
  const [formDivida, setFormDivida] = useState({ clienteId: '', valorTotal: '', dataVencimento: '', observacoes: '' });
  const [valorPagamento, setValorPagamento] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState<'dinheiro' | 'pix' | 'cartao'>('dinheiro');
  const [lojaNome, setLojaNome] = useState('');
  const [lancandoDivida, setLancandoDivida] = useState(false);
  const [recibo, setRecibo] = useState<{ cliente: ClienteFiado; valor: number; vencimento: string; saldoTotal: number; data: string } | null>(null);

  useEffect(() => {
    setDonoId(obterUsuarioLocalId());
    setLojaNome(localStorage.getItem('pdv_fiado_loja_nome') || '');
  }, []);

  const salvarNomeLoja = (nome: string) => {
    setLojaNome(nome);
    localStorage.setItem('pdv_fiado_loja_nome', nome);
  };

  useEffect(() => {
    if (!donoId) return;
    fetch(`/api/fiado/habilitacao?donoId=${donoId}`)
      .then((r) => r.json())
      .then((res) => setHabilitacao(res.success ? res.data : null))
      .finally(() => setLoading(false));
  }, [donoId]);

  const carregarDados = async () => {
    const [clientesResp, dividasResp] = await Promise.all([
      fetch(`/api/fiado/clientes?donoId=${donoId}`).then((r) => r.json()),
      fetch(`/api/fiado/dividas?donoId=${donoId}`).then((r) => r.json()),
    ]);
    setClientes(clientesResp.success ? clientesResp.data : []);
    setDividas(dividasResp.success ? dividasResp.data : []);
  };

  useEffect(() => {
    if (donoId && habilitacao?.ativo) carregarDados();
  }, [donoId, habilitacao?.ativo]);

  const solicitarAcesso = async () => {
    const resp = await fetch('/api/fiado/habilitacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donoId }),
    });
    const resultado = await resp.json();
    if (resultado.success) {
      setHabilitacao(resultado.data);
      toast.success('Solicitação enviada! Aguarde a liberação do admin master.');
    } else {
      toast.error(resultado.error || 'Erro ao solicitar');
    }
  };

  const salvarCliente = async () => {
    if (!formCliente.nome.trim() || !formCliente.telefone.trim()) {
      toast.error('Preencha nome e telefone');
      return;
    }
    const resp = await fetch('/api/fiado/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donoId, ...formCliente }),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error(resultado.error || 'Erro ao cadastrar cliente');
      return;
    }
    setClientes((prev) => [...prev, resultado.data]);
    toast.success('Cliente cadastrado!');
    setShowModalCliente(false);
    setFormCliente({ nome: '', telefone: '', limiteCredito: 500 });
  };

  const lancarDivida = async (forcarLimite = false) => {
    if (!formDivida.clienteId || !formDivida.valorTotal || !formDivida.dataVencimento) {
      toast.error('Selecione o cliente e preencha valor e vencimento');
      return;
    }
    setLancandoDivida(true);
    try {
      const resp = await fetch('/api/fiado/dividas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donoId,
          clienteId: formDivida.clienteId,
          valorTotal: Number(formDivida.valorTotal),
          dataVencimento: formDivida.dataVencimento,
          observacoes: formDivida.observacoes,
          lojaNome,
          forcarLimite,
        }),
      });
      const resultado = await resp.json();

      if (!resultado.success) {
        if (resultado.limiteExcedido) {
          const confirmou = confirm(
            `Esse cliente já deve R$ ${Number(resultado.saldoAtual).toFixed(2)} e o limite de crédito dele é R$ ${Number(resultado.limite).toFixed(2)}. Essa compra estoura o limite. Lançar mesmo assim?`
          );
          if (confirmou) await lancarDivida(true);
          return;
        }
        toast.error(resultado.error || 'Erro ao lançar débito');
        return;
      }

      toast.success('Débito lançado! Cliente avisado por notificação (se já tiver instalado o app).');
      setShowModalDivida(false);
      const clienteDaCompra = clientes.find((c) => c.id === formDivida.clienteId);
      if (clienteDaCompra) {
        setRecibo({
          cliente: clienteDaCompra,
          valor: Number(formDivida.valorTotal),
          vencimento: formDivida.dataVencimento,
          saldoTotal: Number(resultado.data.saldoTotalCliente ?? formDivida.valorTotal),
          data: new Date().toISOString(),
        });
      }
      setFormDivida({ clienteId: '', valorTotal: '', dataVencimento: '', observacoes: '' });
      carregarDados();
    } finally {
      setLancandoDivida(false);
    }
  };

  const saldoDoCliente = (clienteId: string) =>
    dividas
      .filter((d) => d.cliente_id === clienteId && d.status !== 'pago')
      .reduce((soma, d) => soma + (Number(d.valor_total) - Number(d.valor_pago)), 0);

  const linkWhatsappCobranca = (cliente: ClienteFiado, mensagem: string) => {
    const telefone = cliente.telefone.replace(/\D/g, '');
    const numeroCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
  };

  const cobrarPorWhatsapp = (divida: Divida) => {
    const cliente = clientes.find((c) => c.id === divida.cliente_id);
    if (!cliente) return;
    const saldo = Number(divida.valor_total) - Number(divida.valor_pago);
    const mensagem = `Olá, ${cliente.nome}! Aqui é ${lojaNome || 'a loja'}. Você tem uma conta em aberto de R$ ${saldo.toFixed(2)}, com vencimento em ${formatDate(divida.data_vencimento)}. Qualquer dúvida, é só chamar por aqui.`;
    window.open(linkWhatsappCobranca(cliente, mensagem), '_blank');
  };

  const registrarPagamento = async () => {
    if (!selectedDivida || valorPagamento <= 0) {
      toast.error('Valor inválido');
      return;
    }
    const resp = await fetch('/api/fiado/pagamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dividaId: selectedDivida.id, valor: valorPagamento, metodo: metodoPagamento }),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error(resultado.error || 'Erro ao registrar pagamento');
      return;
    }
    toast.success(`Pagamento de R$ ${valorPagamento.toFixed(2)} registrado!`);
    setShowModalPagamento(false);
    setSelectedDivida(null);
    setValorPagamento(0);
    carregarDados();
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

  const getStatusColor = (status: string) => ({
    pendente: 'bg-yellow-100 text-yellow-800',
    parcial: 'bg-blue-100 text-blue-800',
    pago: 'bg-green-100 text-green-800',
    vencido: 'bg-red-100 text-red-800',
  } as Record<string, string>)[status] || 'bg-gray-100 text-gray-800';

  const dividasFiltradas = dividas.filter((d) => {
    if (filtroStatus !== 'todos' && d.status !== filtroStatus) return false;
    if (busca && !d.fiado_clientes?.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const totalReceber = dividas.reduce((sum, d) => sum + (Number(d.valor_total) - Number(d.valor_pago)), 0);
  const totalVencido = dividas.filter((d) => d.status === 'vencido').reduce((sum, d) => sum + (Number(d.valor_total) - Number(d.valor_pago)), 0);

  if (loading || habilitacao === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!habilitacao?.ativo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
          <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Módulo Fiado</h1>
          {habilitacao === null ? (
            <>
              <p className="text-gray-500 text-sm mb-5">
                O Fiado é um módulo opcional: venda a prazo com controle de cobrança e aviso automático ao cliente.
                Disponível para qualquer loja, mediante liberação do admin master.
              </p>
              <button onClick={solicitarAcesso} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Solicitar acesso ao módulo
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 rounded-lg py-3 px-4">
              <Clock className="w-5 h-5" />
              <p className="text-sm font-medium">Solicitação enviada — aguardando liberação do admin master.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Controle de Fiado
            </h1>
            <p className="text-sm text-gray-500">Gerencie crédito e cobranças</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModalCliente(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 text-sm font-medium">
              <Users className="w-4 h-4" /> Novo Cliente
            </button>
            <button onClick={() => setShowModalDivida(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Lançar Débito
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-1">Nome da loja (aparece no recibo e nas cobranças por WhatsApp)</label>
          <input
            type="text"
            value={lojaNome}
            onChange={(e) => salvarNomeLoja(e.target.value)}
            placeholder="Ex: Mercadinho da Dona Neide"
            className="w-full max-w-md px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Clientes</p><p className="text-2xl font-bold text-gray-800">{clientes.length}</p></div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total a Receber</p><p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalReceber)}</p></div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Vencido</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalVencido)}</p></div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex gap-4 px-4">
              {(['todos', 'pendente', 'vencido', 'pago'] as FiltroStatus[]).map((s) => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors capitalize ${filtroStatus === s ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {s === 'todos' ? 'Todas as Contas' : s}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Buscar por cliente..." value={busca} onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
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
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhuma dívida encontrada</td></tr>
                ) : (
                  dividasFiltradas.map((d) => {
                    const saldo = Number(d.valor_total) - Number(d.valor_pago);
                    return (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{d.fiado_clientes?.nome}</p>
                          <p className="text-xs text-gray-500">{formatDate(d.data_venda)}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(Number(d.valor_total))}</td>
                        <td className="px-4 py-3 font-bold text-red-600">{formatCurrency(saldo)}</td>
                        <td className="px-4 py-3">{formatDate(d.data_vencimento)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(d.status)}`}>{d.status}</span></td>
                        <td className="px-4 py-3">
                          {d.status !== 'pago' && (
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedDivida(d); setShowModalPagamento(true); }} className="p-1 text-green-600 hover:text-green-800" title="Registrar Pagamento">
                                <DollarSign className="w-4 h-4" />
                              </button>
                              <button onClick={() => cobrarPorWhatsapp(d)} className="p-1 text-emerald-600 hover:text-emerald-800" title="Cobrar por WhatsApp">
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b"><h2 className="font-bold text-gray-800">Clientes com Crédito</h2></div>
          <div className="divide-y">
            {clientes.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
            ) : (
              clientes.map((c) => {
                const saldo = saldoDoCliente(c.id);
                return (
                  <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.nome}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm"><Phone className="w-3 h-3" />{c.telefone}</div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Devendo {formatCurrency(saldo)} de {formatCurrency(c.limite_credito)} de limite
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!c.cliente_usuario_id && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap">Sem app — avisar por fora</span>
                      )}
                      {saldo > 0 && (
                        <button
                          onClick={() => window.open(linkWhatsappCobranca(c, `Olá, ${c.nome}! Aqui é ${lojaNome || 'a loja'}. Seu saldo em aberto é de R$ ${saldo.toFixed(2)}.`), '_blank')}
                          className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
                        >
                          <MessageCircle className="w-3 h-3" /> Avisar saldo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModalCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Novo Cliente</h2>
                <button onClick={() => setShowModalCliente(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input type="text" value={formCliente.nome} onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
                  <input type="tel" value={formCliente.telefone} onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })} placeholder="(75) 99999-9999" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Crédito</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input type="number" step="50" value={formCliente.limiteCredito} onChange={(e) => setFormCliente({ ...formCliente, limiteCredito: parseFloat(e.target.value) || 0 })} className="w-full pl-8 pr-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowModalCliente(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button onClick={salvarCliente} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cadastrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalDivida && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Lançar Débito</h2>
                <button onClick={() => setShowModalDivida(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select value={formDivida.clienteId} onChange={(e) => setFormDivida({ ...formDivida, clienteId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Selecione...</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome} — {c.telefone}</option>)}
                  </select>
                  {clientes.length === 0 && <p className="text-xs text-amber-600 mt-1">Cadastre um cliente primeiro.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor total da compra *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input type="number" step="0.01" value={formDivida.valorTotal} onChange={(e) => setFormDivida({ ...formDivida, valorTotal: e.target.value })} className="w-full pl-8 pr-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de vencimento *</label>
                  <input type="date" value={formDivida.dataVencimento} onChange={(e) => setFormDivida({ ...formDivida, dataVencimento: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea value={formDivida.observacoes} onChange={(e) => setFormDivida({ ...formDivida, observacoes: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <p className="text-xs text-gray-400 flex items-start gap-1.5">
                  <Send className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  O cliente recebe um aviso automático com total, saldo e vencimento — se já tiver o app instalado.
                </p>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModalDivida(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => lancarDivida()} disabled={lancandoDivida} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {lancandoDivida ? 'Lançando...' : 'Lançar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalPagamento && selectedDivida && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Registrar Pagamento</h2>
                <button onClick={() => setShowModalPagamento(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><p className="text-sm text-gray-500">Cliente</p><p className="font-medium">{selectedDivida.fiado_clientes?.nome}</p></div>
                <div>
                  <p className="text-sm text-gray-500">Saldo Devedor</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(Number(selectedDivida.valor_total) - Number(selectedDivida.valor_pago))}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor do Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input type="number" step="0.01" value={valorPagamento} onChange={(e) => setValorPagamento(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-3 py-2 border rounded-lg" autoFocus />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dinheiro', 'pix', 'cartao'] as const).map((m) => (
                      <button key={m} onClick={() => setMetodoPagamento(m)} className={`p-2 border rounded-lg text-sm capitalize ${metodoPagamento === m ? 'border-green-500 bg-green-50' : ''}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowModalPagamento(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button onClick={registrarPagamento} disabled={valorPagamento <= 0} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">Confirmar Pagamento</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {recibo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
          <style jsx global>{`
            @media print {
              body * { visibility: hidden; }
              #recibo-fiado, #recibo-fiado * { visibility: visible; }
              #recibo-fiado { position: fixed; top: 0; left: 0; width: 100%; }
            }
          `}</style>
          <div className="bg-white rounded-xl max-w-sm w-full print:rounded-none print:max-w-full">
            <div className="p-6" id="recibo-fiado">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Receipt className="w-5 h-5" /> Recibo</h2>
                <button onClick={() => setRecibo(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
              </div>

              <div className="text-center border-b pb-3 mb-3">
                <p className="font-bold text-gray-800">{lojaNome || 'Recibo de compra fiado'}</p>
                <p className="text-xs text-gray-400">{new Date(recibo.data).toLocaleString('pt-BR')}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="font-medium">{recibo.cliente.nome}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Valor da compra</span><span className="font-medium">{formatCurrency(recibo.valor)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Vencimento</span><span className="font-medium">{formatDate(recibo.vencimento)}</span></div>
                <div className="flex justify-between pt-2 border-t"><span className="text-gray-700 font-semibold">Saldo total em aberto</span><span className="font-bold text-red-600">{formatCurrency(recibo.saldoTotal)}</span></div>
              </div>

              <div className="flex gap-3 pt-5 print:hidden">
                <button onClick={() => window.print()} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button
                  onClick={() => window.open(linkWhatsappCobranca(recibo.cliente, `Olá, ${recibo.cliente.nome}! Recibo de compra em ${lojaNome || 'nossa loja'}: R$ ${recibo.valor.toFixed(2)}, vencimento em ${formatDate(recibo.vencimento)}. Saldo total em aberto: R$ ${recibo.saldoTotal.toFixed(2)}.`), '_blank')}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
