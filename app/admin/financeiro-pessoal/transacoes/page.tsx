'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, X } from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pendente' | 'pago' | 'cancelado';
  recorrente: boolean;
  recorrencia?: 'mensal' | 'semanal' | 'anual';
}

const categorias = [
  'SalÃ¡rio', 'Freelance', 'Investimentos', 'Presentes',
  'AlimentaÃ§Ã£o', 'Contas', 'Lazer', 'Transporte', 'SaÃºde', 'EducaÃ§Ã£o', 'Moradia'
];

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: 'SalÃ¡rio',
    descricao: '',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    status: 'pendente' as 'pendente' | 'pago' | 'cancelado',
    recorrente: false,
    recorrencia: 'mensal' as 'mensal' | 'semanal' | 'anual'
  });

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const carregarTransacoes = () => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      setTransacoes(dados.transacoes || []);
    } else {
      const mockTransacoes: Transacao[] = [
        { id: '1', tipo: 'receita', categoria: 'SalÃ¡rio', descricao: 'SalÃ¡rio Mensal', valor: 5000, data: new Date().toISOString().split('T')[0], status: 'pago', recorrente: true, recorrencia: 'mensal' },
        { id: '2', tipo: 'despesa', categoria: 'AlimentaÃ§Ã£o', descricao: 'Supermercado', valor: 350, data: new Date().toISOString().split('T')[0], status: 'pago', recorrente: false },
        { id: '3', tipo: 'despesa', categoria: 'Contas', descricao: 'Energia ElÃ©trica', valor: 180, data: new Date().toISOString().split('T')[0], status: 'pendente', recorrente: true, recorrencia: 'mensal' }
      ];
      setTransacoes(mockTransacoes);
      localStorage.setItem('financeiro_pessoal', JSON.stringify({ transacoes: mockTransacoes }));
    }
    setLoading(false);
  };

  const salvarTransacoes = (novaLista: Transacao[]) => {
    const stored = localStorage.getItem('financeiro_pessoal');
    const dados = stored ? JSON.parse(stored) : {};
    dados.transacoes = novaLista;
    localStorage.setItem('financeiro_pessoal', JSON.stringify(dados));
    setTransacoes(novaLista);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim()) {
      alert('âŒ A descriÃ§Ã£o Ã© obrigatÃ³ria');
      return;
    }
    if (formData.valor <= 0) {
      alert('âŒ O valor deve ser maior que zero');
      return;
    }
    
    const novaTransacao: Transacao = {
      id: editingTransacao?.id || Date.now().toString(),
      ...formData
    };
    
    let novasTransacoes;
    if (editingTransacao) {
      novasTransacoes = transacoes.map(t => t.id === editingTransacao.id ? novaTransacao : t);
    } else {
      novasTransacoes = [novaTransacao, ...transacoes];
    }
    
    salvarTransacoes(novasTransacoes);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('âš ï¸ Tem certeza que deseja excluir esta transaÃ§Ã£o?')) {
      salvarTransacoes(transacoes.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'receita',
      categoria: 'SalÃ¡rio',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      status: 'pendente',
      recorrente: false,
      recorrencia: 'mensal'
    });
    setEditingTransacao(null);
  };

  const editTransacao = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
  tipo: transacao.tipo,
  categoria: transacao.categoria,
  descricao: transacao.descricao,
  valor: transacao.valor,
  data: transacao.data,
  status: transacao.status,
  recorrente: transacao.recorrente || false,
  recorrencia: transacao.recorrencia || 'mensal'
});
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const transacoesFiltradas = transacoes.filter(t => {
    const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = !filterTipo || t.tipo === filterTipo;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchTipo && matchStatus;
  });

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  if (loading) return <div className="text-center py-8 text-gray-900 dark:text-gray-100">ðŸ”„ Carregando transaÃ§Ãµes...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ðŸ“‹ TransaÃ§Ãµes Financeiras</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie todas as suas movimentaÃ§Ãµes financeiras</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nova TransaÃ§Ã£o
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Receitas</p>
          <p className="text-2xl font-bold">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Despesas</p>
          <p className="text-2xl font-bold">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className={`rounded-xl p-4 text-white ${saldo >= 0 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-orange-600 to-red-600'}`}>
          <p className="text-white/80 text-sm">Saldo</p>
          <p className="text-2xl font-bold">{formatCurrency(saldo)}</p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por descriÃ§Ã£o ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filtros {showFilters ? 'â–²' : 'â–¼'}
          </button>
          {(filterTipo || filterStatus) && (
            <button
              onClick={() => { setFilterTipo(''); setFilterStatus(''); }}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" /> Limpar Filtros
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos os tipos</option>
              <option value="receita">ðŸ’° Receitas</option>
              <option value="despesa">ðŸ’¸ Despesas</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos os status</option>
              <option value="pago">âœ… Pago</option>
              <option value="pendente">â³ Pendente</option>
              <option value="cancelado">âŒ Cancelado</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabela de TransaÃ§Ãµes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DescriÃ§Ã£o</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    ðŸ“­ Nenhuma transaÃ§Ã£o encontrada
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(t.data)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.tipo === 'receita' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowUpCircle className="w-4 h-4" /> Receita
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <ArrowDownCircle className="w-4 h-4" /> Despesa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {t.categoria}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {t.descricao}
                      {t.recorrente && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {t.recorrencia}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold whitespace-nowrap ${t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(t.valor)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === 'pago' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                        t.status === 'pendente' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' : 
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                      }`}>
                        {t.status === 'pago' ? 'âœ… Pago' : t.status === 'pendente' ? 'â³ Pendente' : 'âŒ Cancelado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editTransacao(t)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal de Nova/Editar TransaÃ§Ã£o */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTransacao ? 'âœï¸ Editar TransaÃ§Ã£o' : 'âž• Nova TransaÃ§Ã£o'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="receita"
                      checked={formData.tipo === 'receita'}
                      onChange={() => setFormData({ ...formData, tipo: 'receita', categoria: 'SalÃ¡rio' })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">ðŸ’° Receita</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="despesa"
                      checked={formData.tipo === 'despesa'}
                      onChange={() => setFormData({ ...formData, tipo: 'despesa', categoria: 'AlimentaÃ§Ã£o' })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">ðŸ’¸ Despesa</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DescriÃ§Ã£o *</label>
                <input
                  type="text"
                  placeholder="Ex: SalÃ¡rio, Supermercado, Conta de Luz..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pendente">â³ Pendente</option>
                  <option value="pago">âœ… Pago</option>
                  <option value="cancelado">âŒ Cancelado</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recorrente}
                    onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">ðŸ”„ Conta Recorrente</span>
                </label>
              </div>

              {formData.recorrente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RecorrÃªncia</label>
                  <select
                    value={formData.recorrencia}
                    onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value as any })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="mensal">ðŸ“… Mensal</option>
                    <option value="semanal">ðŸ“† Semanal</option>
                    <option value="anual">ðŸ—“ï¸ Anual</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTransacao ? 'ðŸ’¾ Salvar AlteraÃ§Ãµes' : 'âœ… Criar TransaÃ§Ã£o'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

