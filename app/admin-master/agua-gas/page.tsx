'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Droplets, Flame, Search, Plus, Edit3, Trash2, CheckCircle2, EyeOff,
  Star, RefreshCw, Phone, Package, Truck, X, MessageCircle, ShoppingBag, DollarSign, MapPin
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TIPOS_PRODUTO = [
  { id: 'agua_garrafao', label: 'Garrafão 20L',  unidade: 'unidade' },
  { id: 'agua_mineral',  label: 'Água Mineral',  unidade: 'fardo'   },
  { id: 'gas_p13',       label: 'Gás P13',       unidade: 'unidade' },
  { id: 'gas_p20',       label: 'Gás P20',       unidade: 'unidade' },
  { id: 'gas_p45',       label: 'Gás P45',       unidade: 'unidade' },
  { id: 'gas_granel',    label: 'Gás Granel',    unidade: 'kg'      },
  { id: 'outro',         label: 'Outro produto', unidade: 'unidade' },
];

interface Produto { tipo: string; descricao: string; preco: number; unidade: string; disponivel: boolean; }
interface Fornecedor {
  id: string; nome: string; responsavel: string; telefone: string; whatsapp: string;
  bairro: string; cidade: string; descricao: string; foto: string; horario: string;
  temEntrega: boolean; taxaEntrega: number; freteGratisAcima: number;
  produtos: Produto[]; status: string; destaque: boolean; createdAt: string;
}
interface Pedido {
  id: string; fornecedorId: string; fornecedorNome: string; clienteNome: string;
  clienteTelefone: string; produto: string; quantidade: number; endereco: string;
  observacoes: string; status: string; createdAt: string;
}

const emptyForn = (): Partial<Fornecedor> => ({
  nome: '', responsavel: '', telefone: '', whatsapp: '', bairro: '', cidade: 'Valente',
  descricao: '', foto: '', horario: '', temEntrega: true, taxaEntrega: 0,
  freteGratisAcima: 0, produtos: [{ tipo: 'gas_p13', descricao: '', preco: 0, unidade: 'unidade', disponivel: true }],
  status: 'pendente', destaque: false
});

export default function AdminAguaGasPage() {
  const [aba, setAba] = useState<'fornecedores' | 'pedidos' | 'financeiro'>('fornecedores');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [editando, setEditando] = useState<Partial<Fornecedor> | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [cidades, setCidades] = useState<{ id: string; nome: string }[]>([]);
  const [cidadeId, setCidadeId] = useState('');
  const [importando, setImportando] = useState(false);

  const carregarFornecedores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFiltro) params.set('status', statusFiltro);
      if (busca.trim()) params.set('busca', busca.trim());
      const res = await fetch(`/api/agua-gas?${params}`);
      const data = await res.json();
      setFornecedores(Array.isArray(data.data) ? data.data : []);
    } catch { toast.error('Erro ao carregar.'); }
    finally { setLoading(false); }
  }, [busca, statusFiltro]);

  const carregarPedidos = useCallback(async () => {
    try {
      const res = await fetch('/api/agua-gas?recurso=pedidos');
      const data = await res.json();
      setPedidos(Array.isArray(data.data) ? data.data : []);
    } catch { /* silent */ }
  }, []);

  const carregarFinanceiro = useCallback(async () => {
    try {
      const res = await fetch('/api/agua-gas?recurso=financeiro');
      const data = await res.json();
      setMovimentacoes(Array.isArray(data.data) ? data.data : []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetch('/api/mototaxi?recurso=cidades').then((r) => r.json()).then((res) => {
      if (res.success) {
        setCidades(res.data);
        if (res.data.length > 0) setCidadeId((prev: string) => prev || res.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const importarDoGoogle = async () => {
    if (!cidadeId) { toast.error('Escolha uma cidade primeiro'); return; }
    setImportando(true);
    try {
      const resp = await fetch('/api/admin-master/importar-google-places-agua-gas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cidade_id: cidadeId }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`${resultado.novos} fornecedor(es) novo(s) importado(s) de ${resultado.encontrados} encontrado(s)`);
      carregarFornecedores();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar do Google Maps');
    } finally {
      setImportando(false);
    }
  };

  useEffect(() => { const t = setTimeout(carregarFornecedores, 300); return () => clearTimeout(t); }, [carregarFornecedores]);
  useEffect(() => { if (aba === 'pedidos') carregarPedidos(); }, [aba, carregarPedidos]);
  useEffect(() => { if (aba === 'financeiro') carregarFinanceiro(); }, [aba, carregarFinanceiro]);

  const handlePublicar = async (f: Fornecedor) => {
    const novoStatus = f.status === 'publicado' ? 'pendente' : 'publicado';
    await fetch(`/api/agua-gas?id=${f.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: novoStatus }) });
    toast.success(`Status: ${novoStatus}`);
    carregarFornecedores();
  };

  const handleDestaque = async (f: Fornecedor) => {
    await fetch(`/api/agua-gas?id=${f.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destaque: !f.destaque }) });
    toast.success(f.destaque ? 'Destaque removido.' : 'Fornecedor em destaque!');
    carregarFornecedores();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este fornecedor?')) return;
    await fetch(`/api/agua-gas?id=${id}`, { method: 'DELETE' });
    toast.success('Fornecedor excluído.');
    carregarFornecedores();
  };

  const handlePedidoStatus = async (id: string, status: string) => {
    await fetch(`/api/agua-gas?recurso=pedidos&id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success(`Pedido ${status}.`);
    carregarPedidos();
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    try {
      const isNovo = !editando.id;
      const url = isNovo ? '/api/agua-gas' : `/api/agua-gas?id=${editando.id}`;
      const res = await fetch(url, { method: isNovo ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editando) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(isNovo ? 'Fornecedor cadastrado!' : 'Dados atualizados!');
      setEditando(null);
      carregarFornecedores();
    } catch (err: any) { toast.error(err.message || 'Erro.'); }
    finally { setSalvando(false); }
  };

  const addProd = () => setEditando((p) => p ? { ...p, produtos: [...(p.produtos || []), { tipo: 'gas_p13', descricao: '', preco: 0, unidade: 'unidade', disponivel: true }] } : p);
  const removeProd = (i: number) => setEditando((p) => p ? { ...p, produtos: (p.produtos || []).filter((_, idx) => idx !== i) } : p);
  const setProd = (i: number, k: keyof Produto, v: any) => setEditando((p) => p ? { ...p, produtos: (p.produtos || []).map((item, idx) => idx === i ? { ...item, [k]: v } : item) } : p);

  const resumo = {
    total: fornecedores.length,
    publicados: fornecedores.filter((f) => f.status === 'publicado').length,
    pendentes: fornecedores.filter((f) => f.status === 'pendente').length,
    destaques: fornecedores.filter((f) => f.destaque).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex gap-1"><Droplets className="w-7 h-7 text-blue-400" /><Flame className="w-7 h-7 text-orange-400" /></div>
          <div>
            <h1 className="text-2xl font-extrabold">Água e Gás</h1>
            <p className="text-gray-400 text-sm">Gerencie fornecedores e pedidos</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={cidadeId} onChange={(e) => setCidadeId(e.target.value)} className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none">
            {cidades.length === 0 && <option value="">Nenhuma cidade ativa</option>}
            {cidades.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <button onClick={importarDoGoogle} disabled={importando || !cidadeId} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <MapPin className="w-4 h-4" />{importando ? 'Buscando...' : 'Importar do Google'}
          </button>
          <button onClick={aba === 'fornecedores' ? carregarFornecedores : carregarPedidos} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />Atualizar
          </button>
          <button onClick={() => setEditando(emptyForn())} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Novo Fornecedor
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',      val: resumo.total,      cor: 'text-white'     },
          { label: 'Publicados', val: resumo.publicados, cor: 'text-green-400' },
          { label: 'Pendentes',  val: resumo.pendentes,  cor: 'text-orange-400'},
          { label: 'Destaque',   val: resumo.destaques,  cor: 'text-blue-400'  },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.cor}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {(['fornecedores', 'pedidos', 'financeiro'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-colors ${aba === a ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {a === 'fornecedores' ? `Fornecedores (${resumo.total})` : a === 'pedidos' ? `Pedidos (${pedidos.length})` : `Financeiro (${movimentacoes.length})`}
          </button>
        ))}
      </div>

      {/* ── FORNECEDORES ─────────────────────────────────────────────────────── */}
      {aba === 'fornecedores' && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 flex-1 min-w-48">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar fornecedor..." className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-500" />
            </div>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="">Todos os status</option>
              <option value="publicado">Publicado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Carregando...</div>
            ) : fornecedores.length === 0 ? (
              <div className="p-12 text-center"><Droplets className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">Nenhum fornecedor encontrado.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-xs uppercase tracking-widest text-gray-500">
                      <th className="px-5 py-4 text-left">Fornecedor</th>
                      <th className="px-5 py-4 text-left">Contato</th>
                      <th className="px-5 py-4 text-left">Produtos</th>
                      <th className="px-5 py-4 text-left">Entrega</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fornecedores.map((f) => (
                      <tr key={f.id} className="hover:bg-white/2">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{f.nome}</div>
                          <div className="text-xs text-gray-400">{f.responsavel}</div>
                          <div className="text-xs text-gray-500">{[f.bairro, f.cidade].filter(Boolean).join(', ')}</div>
                          {f.destaque && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded mt-1 inline-block">DESTAQUE</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-300">
                          <div>{f.telefone}</div>
                          {f.horario && <div className="text-xs text-gray-400 mt-0.5">{f.horario}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(f.produtos || []).filter((p) => p.disponivel !== false).slice(0, 3).map((p, i) => (
                              <span key={i} className="text-xs bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded-full">
                                {p.descricao || TIPOS_PRODUTO.find((t) => t.id === p.tipo)?.label || p.tipo}
                                {p.preco > 0 ? ` R$${p.preco.toFixed(0)}` : ''}
                              </span>
                            ))}
                            {(f.produtos || []).length > 3 && <span className="text-xs text-gray-500">+{(f.produtos || []).length - 3}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {f.temEntrega ? (
                            <span className="flex items-center gap-1 text-xs text-green-400"><Truck className="w-3 h-3" />
                              {f.taxaEntrega === 0 ? 'Grátis' : `R$ ${f.taxaEntrega.toFixed(2)}`}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Não faz</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${f.status === 'publicado' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{f.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => handlePublicar(f)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${f.status === 'publicado' ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}`}>
                              {f.status === 'publicado' ? <><EyeOff className="w-3 h-3" />Ocultar</> : <><CheckCircle2 className="w-3 h-3" />Publicar</>}
                            </button>
                            <button onClick={() => handleDestaque(f)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${f.destaque ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                              <Star className="w-3 h-3" />{f.destaque ? 'Remover' : 'Destacar'}
                            </button>
                            <button onClick={() => setEditando({ ...f })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold transition-colors">
                              <Edit3 className="w-3 h-3" />Editar
                            </button>
                            <button onClick={() => handleDelete(f.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-colors">
                              <Trash2 className="w-3 h-3" />Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PEDIDOS ───────────────────────────────────────────────────────────── */}
      {aba === 'pedidos' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          {pedidos.length === 0 ? (
            <div className="p-12 text-center"><ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">Nenhum pedido ainda.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-xs uppercase tracking-widest text-gray-500">
                    <th className="px-5 py-4 text-left">Cliente</th>
                    <th className="px-5 py-4 text-left">Fornecedor</th>
                    <th className="px-5 py-4 text-left">Produto / Qtd</th>
                    <th className="px-5 py-4 text-left">Endereço</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-white/2">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm">{p.clienteNome}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{p.clienteTelefone}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-300">{p.fornecedorNome}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-white">{p.produto}</div>
                        <div className="text-xs text-gray-400">Qtd: {p.quantidade}</div>
                        {p.observacoes && <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.observacoes}</div>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{p.endereco || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'confirmado' ? 'bg-green-500/20 text-green-400' : p.status === 'cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          {p.status === 'pendente' && (
                            <button onClick={() => handlePedidoStatus(p.id, 'confirmado')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 text-xs font-semibold">
                              <CheckCircle2 className="w-3 h-3" />Confirmar
                            </button>
                          )}
                          {p.status !== 'cancelado' && (
                            <button onClick={() => handlePedidoStatus(p.id, 'cancelado')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold">
                              <Trash2 className="w-3 h-3" />Cancelar
                            </button>
                          )}
                          {p.clienteTelefone && (
                            <a href={`https://wa.me/55${p.clienteTelefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/20 text-green-300 text-xs font-semibold">
                              <MessageCircle className="w-3 h-3" />WA
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── FINANCEIRO ─────────────────────────────────────────── */}
      {aba === 'financeiro' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          {movimentacoes.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma movimentação ainda.</p>
              <p className="text-gray-500 text-xs mt-1">Aparece aqui quando um pedido é confirmado pelo fornecedor.</p>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm text-gray-400">Total movimentado</span>
                <span className="text-2xl font-bold text-green-400">
                  R$ {movimentacoes.reduce((acc, m) => acc + m.valor, 0).toFixed(2)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-xs uppercase tracking-widest text-gray-500">
                      <th className="px-5 py-4 text-left">Data</th>
                      <th className="px-5 py-4 text-left">Fornecedor</th>
                      <th className="px-5 py-4 text-left">Cliente / Produto</th>
                      <th className="px-5 py-4 text-left">Valor</th>
                      <th className="px-5 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movimentacoes.map((m) => (
                      <tr key={m.id} className="hover:bg-white/2">
                        <td className="px-5 py-4 text-sm text-gray-300">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                        <td className="px-5 py-4 text-sm text-white">{m.pedido?.fornecedor_nome || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-300">{m.pedido?.cliente_nome || '—'} · {m.pedido?.produto || '—'}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-green-400">R$ {m.valor.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">{m.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL EDIÇÃO ─────────────────────────────────────────────────────── */}
      {editando && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">{editando.id ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>
              <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvar} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Nome da empresa *', key: 'nome', req: true },
                  { label: 'Responsável', key: 'responsavel' },
                  { label: 'Telefone *', key: 'telefone', req: true },
                  { label: 'WhatsApp', key: 'whatsapp' },
                  { label: 'Bairro', key: 'bairro' },
                  { label: 'Horário', key: 'horario' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-400">{f.label}</label>
                    <input required={f.req} value={(editando as any)[f.key] || ''}
                      onChange={(e) => setEditando({ ...editando, [f.key]: e.target.value })}
                      className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={!!editando.temEntrega} onChange={(e) => setEditando({ ...editando, temEntrega: e.target.checked })} className="w-4 h-4 accent-blue-500" />
                <label className="text-sm text-gray-300">Faz entrega</label>
                <input type="checkbox" checked={!!editando.destaque} onChange={(e) => setEditando({ ...editando, destaque: e.target.checked })} className="w-4 h-4 accent-yellow-500 ml-4" />
                <label className="text-sm text-gray-300">Destaque</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <select value={editando.status || 'pendente'} onChange={(e) => setEditando({ ...editando, status: e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400">
                    <option value="pendente">Pendente</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Taxa entrega (R$)</label>
                  <input type="number" min="0" step="0.5" value={editando.taxaEntrega ?? 0} onChange={(e) => setEditando({ ...editando, taxaEntrega: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* Produtos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-400 font-semibold">Produtos</label>
                  <button type="button" onClick={addProd} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" />Adicionar
                  </button>
                </div>
                {(editando.produtos || []).map((p, i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-3 mb-2 grid grid-cols-4 gap-2 items-center">
                    <select value={p.tipo} onChange={(e) => { const t = TIPOS_PRODUTO.find((x) => x.id === e.target.value); setProd(i, 'tipo', e.target.value); if (t) setProd(i, 'unidade', t.unidade); }}
                      className="bg-slate-700 border border-white/10 text-white rounded-lg px-2 py-2 text-xs outline-none col-span-1">
                      {TIPOS_PRODUTO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input value={p.descricao} onChange={(e) => setProd(i, 'descricao', e.target.value)} placeholder="Descrição"
                      className="bg-slate-700 border border-white/10 text-white rounded-lg px-2 py-2 text-xs outline-none col-span-1" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">R$</span>
                      <input type="number" min="0" step="0.5" value={p.preco} onChange={(e) => setProd(i, 'preco', Number(e.target.value))}
                        className="w-full bg-slate-700 border border-white/10 text-white rounded-lg px-2 py-2 text-xs outline-none" />
                    </div>
                    <button type="button" onClick={() => removeProd(i)} className="text-red-400 hover:text-red-300 flex justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditando(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 rounded-xl">Cancelar</button>
                <button type="submit" disabled={salvando} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl">
                  {salvando ? 'Salvando...' : editando.id ? 'Salvar alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


