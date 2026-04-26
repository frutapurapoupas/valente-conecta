// components/admin-master/FinanceiroPessoalScreen.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Users, 
  Tag, 
  Filter, 
  Calendar,
  BarChart3,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { LinhaLancamento } from './financeiro-pessoal/LinhaLancamento';
import { ModalCategoria } from './financeiro-pessoal/ModalCategoria';
import { ModalFornecedor } from './financeiro-pessoal/ModalFornecedor';
import { ModalCartao } from './financeiro-pessoal/ModalCartao';
import { ModalImpressao } from './financeiro-pessoal/ModalImpressao';
import { BannerAlerta } from './financeiro-pessoal/BannerAlerta';

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
}

interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  tipo: 'receita' | 'despesa';
  recorrente?: boolean;
  recorrenciaMeses?: number;
  fornecedorId?: string;
  cartaoId?: string;
  parcela?: number;
  parcelasTotais?: number;
}

interface CartaoCredito {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

interface FinanceiroPessoalScreenProps {
  lancamentos: Lancamento[];
  todosLancamentos: Lancamento[];
  categorias: Categoria[];
  cartoes: CartaoCredito[];
  fornecedores: Fornecedor[];
  loading: boolean;
  anoSelecionado: number;
  mesSelecionado: number;
  setAnoSelecionado: (ano: number) => void;
  setMesSelecionado: (mes: number) => void;
  salvarLancamento: (lancamento: Omit<Lancamento, 'id'>) => Promise<void>;
  atualizarLancamento: (id: string, updates: Partial<Lancamento>) => Promise<void>;
  deletarLancamento: (id: string) => Promise<void>;
  salvarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  deletarCategoria: (id: string) => Promise<void>;
  salvarCartao: (cartao: Omit<CartaoCredito, 'id'>) => Promise<void>;
  deletarCartao: (id: string) => Promise<void>;
  salvarFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => Promise<void>;
  deletarFornecedor: (id: string) => Promise<void>;
  getSaldoPeriodo: () => { totalReceitas: number; totalDespesas: number; saldo: number };
  getLancamentosPorCategoria: () => Record<string, number>;
}

export function FinanceiroPessoalScreen({
  lancamentos,
  todosLancamentos,
  categorias,
  cartoes,
  fornecedores,
  loading,
  anoSelecionado,
  mesSelecionado,
  setAnoSelecionado,
  setMesSelecionado,
  salvarLancamento,
  atualizarLancamento,
  deletarLancamento,
  salvarCategoria,
  deletarCategoria,
  salvarCartao,
  deletarCartao,
  salvarFornecedor,
  deletarFornecedor,
  getSaldoPeriodo,
  getLancamentosPorCategoria,
}: FinanceiroPessoalScreenProps) {
  const [activeTab, setActiveTab] = useState<'lancamentos' | 'categorias' | 'cartoes' | 'fornecedores'>('lancamentos');
  const [showNewLancamento, setShowNewLancamento] = useState(false);
  const [novoLancamento, setNovoLancamento] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'despesa' as 'receita' | 'despesa',
    categoriaId: '',
    recorrente: false,
    recorrenciaMeses: 1,
  });
  const [modalCategoria, setModalCategoria] = useState<{ isOpen: boolean; categoria?: Categoria | null }>({ isOpen: false });
  const [modalCartao, setModalCartao] = useState<{ isOpen: boolean; cartao?: CartaoCredito | null }>({ isOpen: false });
  const [modalFornecedor, setModalFornecedor] = useState<{ isOpen: boolean; fornecedor?: Fornecedor | null }>({ isOpen: false });
  const [modalImpressao, setModalImpressao] = useState(false);

  const { totalReceitas, totalDespesas, saldo } = getSaldoPeriodo();
  const despesasPorCategoria = getLancamentosPorCategoria();

  const handleSalvarLancamento = async () => {
    if (!novoLancamento.descricao.trim() || !novoLancamento.valor || !novoLancamento.categoriaId) return;
    await salvarLancamento({
      descricao: novoLancamento.descricao,
      valor: parseFloat(novoLancamento.valor),
      data: novoLancamento.data,
      tipo: novoLancamento.tipo,
      categoriaId: novoLancamento.categoriaId,
      recorrente: novoLancamento.recorrente,
      recorrenciaMeses: novoLancamento.recorrente ? novoLancamento.recorrenciaMeses : undefined,
    });
    setShowNewLancamento(false);
    setNovoLancamento({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'despesa',
      categoriaId: '',
      recorrente: false,
      recorrenciaMeses: 1,
    });
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-master/dashboard"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Voltar para Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <Wallet className="w-6 h-6 text-emerald-500" />
            <div>
              <h1 className="text-xl font-bold">Financeiro Pessoal</h1>
              <p className="text-zinc-400 text-sm">Admin Master</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Alertas */}
      <BannerAlerta cartoes={cartoes} lancamentos={todosLancamentos} />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Receitas</p>
              <p className="text-2xl font-bold text-emerald-400">{formatarMoeda(totalReceitas)}</p>
            </div>
            <TrendingUp size={32} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Despesas</p>
              <p className="text-2xl font-bold text-red-400">{formatarMoeda(totalDespesas)}</p>
            </div>
            <TrendingDown size={32} className="text-red-500" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Saldo do mês</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {formatarMoeda(saldo)}
              </p>
            </div>
            <Wallet size={32} className={saldo >= 0 ? 'text-blue-500' : 'text-orange-500'} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
            <Calendar size={18} className="text-zinc-400" />
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
              className="outline-none bg-transparent text-white"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index + 1}>{mes}</option>
              ))}
            </select>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
              className="outline-none bg-transparent text-white"
            >
              {[2023, 2024, 2025, 2026].map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalImpressao(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 border border-zinc-700"
          >
            <FileText size={18} /> Extrato
          </button>
          <button
            onClick={() => setShowNewLancamento(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 mb-4">
        {[
          { id: 'lancamentos', label: '📋 Lançamentos', icon: <BarChart3 size={18} /> },
          { id: 'categorias', label: '🏷️ Categorias', icon: <Tag size={18} /> },
          { id: 'cartoes', label: '💳 Cartões', icon: <CreditCard size={18} /> },
          { id: 'fornecedores', label: '🏢 Fornecedores', icon: <Users size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'lancamentos' && (
        <div>
          {showNewLancamento && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
              <h3 className="font-medium mb-3 text-white">Novo Lançamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Descrição"
                  value={novoLancamento.descricao}
                  onChange={(e) => setNovoLancamento(prev => ({ ...prev, descricao: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-400"
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={novoLancamento.valor}
                  onChange={(e) => setNovoLancamento(prev => ({ ...prev, valor: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-400"
                />
                <input
                  type="date"
                  value={novoLancamento.data}
                  onChange={(e) => setNovoLancamento(prev => ({ ...prev, data: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
                <select
                  value={novoLancamento.tipo}
                  onChange={(e) => setNovoLancamento(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="despesa">💸 Despesa</option>
                  <option value="receita">💰 Receita</option>
                </select>
                <select
                  value={novoLancamento.categoriaId}
                  onChange={(e) => setNovoLancamento(prev => ({ ...prev, categoriaId: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.filter(c => c.tipo === novoLancamento.tipo).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <label className="flex items-center gap-2 text-zinc-300">
                  <input
                    type="checkbox"
                    checked={novoLancamento.recorrente}
                    onChange={(e) => setNovoLancamento(prev => ({ ...prev, recorrente: e.target.checked }))}
                  />
                  Lançamento recorrente
                </label>
                {novoLancamento.recorrente && (
                  <select
                    value={novoLancamento.recorrenciaMeses}
                    onChange={(e) => setNovoLancamento(prev => ({ ...prev, recorrenciaMeses: parseInt(e.target.value) }))}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1 text-white"
                  >
                    <option value={1}>Todo mês</option>
                    <option value={3}>A cada 3 meses</option>
                    <option value={6}>A cada 6 meses</option>
                    <option value={12}>Anual</option>
                  </select>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleSalvarLancamento} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  Salvar
                </button>
                <button onClick={() => setShowNewLancamento(false)} className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-600">
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {lancamentos.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Wallet size={48} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400">Nenhum lançamento neste período</p>
              <button onClick={() => setShowNewLancamento(true)} className="mt-3 text-blue-400 hover:underline">
                Criar primeiro lançamento
              </button>
            </div>
          ) : (
            lancamentos.map(l => (
              <LinhaLancamento
                key={l.id}
                lancamento={l}
                categorias={categorias}
                onUpdate={atualizarLancamento}
                onDelete={deletarLancamento}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'categorias' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setModalCategoria({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} /> Nova Categoria
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categorias.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-shadow"
                style={{ borderLeftColor: c.cor, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.cor}20` }}>
                    <span className="text-lg">{c.icone === 'ShoppingBag' && '🛍️'}{c.icone === 'Utensils' && '🍽️'}{c.icone === 'Home' && '🏠'}{c.icone === 'Car' && '🚗'}{c.icone === 'DollarSign' && '💰'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{c.nome}</p>
                    <p className={`text-xs ${c.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModalCategoria({ isOpen: true, categoria: c })}
                    className="p-2 text-zinc-400 hover:text-blue-400"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deletarCategoria(c.id)}
                    className="p-2 text-zinc-400 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cartoes' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setModalCartao({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} /> Novo Cartão
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartoes.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4" style={{ backgroundColor: c.cor }}>
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <p className="text-sm opacity-80">Cartão de Crédito</p>
                      <p className="font-bold text-lg">{c.nome}</p>
                    </div>
                    <CreditCard size={24} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-400">Limite</p>
                      <p className="font-semibold text-white">{formatarMoeda(c.limite)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Fechamento</p>
                      <p className="font-semibold text-white">Dia {c.diaFechamento}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Vencimento</p>
                      <p className="font-semibold text-white">Dia {c.diaVencimento}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Status</p>
                      <p className="font-semibold text-emerald-400">Ativo</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalCartao({ isOpen: true, cartao: c })}
                      className="flex-1 py-2 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletarCartao(c.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fornecedores' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setModalFornecedor({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus size={18} /> Novo Fornecedor
            </button>
          </div>
          <div className="space-y-2">
            {fornecedores.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div>
                  <p className="font-medium text-white">{f.nome}</p>
                  {(f.telefone || f.email) && (
                    <p className="text-sm text-zinc-400">
                      {f.telefone && <span>📞 {f.telefone}</span>}
                      {f.email && <span className="ml-2">✉️ {f.email}</span>}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModalFornecedor({ isOpen: true, fornecedor: f })}
                    className="p-2 text-zinc-400 hover:text-blue-400"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deletarFornecedor(f.id)}
                    className="p-2 text-zinc-400 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <ModalCategoria
        isOpen={modalCategoria.isOpen}
        onClose={() => setModalCategoria({ isOpen: false })}
        onSave={salvarCategoria}
        onDelete={deletarCategoria}
        categoria={modalCategoria.categoria}
        categoriasExistentes={categorias}
      />

      <ModalCartao
        isOpen={modalCartao.isOpen}
        onClose={() => setModalCartao({ isOpen: false })}
        onSave={salvarCartao}
        onDelete={deletarCartao}
        cartao={modalCartao.cartao}
      />

      <ModalFornecedor
        isOpen={modalFornecedor.isOpen}
        onClose={() => setModalFornecedor({ isOpen: false })}
        onSave={salvarFornecedor}
        onDelete={deletarFornecedor}
        fornecedor={modalFornecedor.fornecedor}
      />

      <ModalImpressao
        isOpen={modalImpressao}
        onClose={() => setModalImpressao(false)}
        lancamentos={lancamentos}
        categorias={categorias}
        periodo={{ ano: anoSelecionado, mes: mesSelecionado }}
      />
      </div>
    </div>
  );
}