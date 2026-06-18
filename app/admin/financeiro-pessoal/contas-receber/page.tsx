'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'receita';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pendente' | 'pago' | 'cancelado';
  recorrente: boolean;
}

export default function ContasReceberPage() {
  const [contas, setContas] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: 'Salário',
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    recorrente: false
  });

  useEffect(() => {
    carregarContas();
  }, []);

  const carregarContas = () => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      const contasFiltradas = (dados.transacoes || []).filter((t: Transacao) => t.tipo === 'receita' && t.status !== 'pago');
      setContas(contasFiltradas);
    }
    setLoading(false);
  };

  const salvarConta = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('financeiro_pessoal');
    const dados = stored ? JSON.parse(stored) : { transacoes: [] };
    
    const novaConta: Transacao = {
      id: Date.now().toString(),
      tipo: 'receita',
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: formData.valor,
      data: formData.data,
      status: 'pendente',
      recorrente: formData.recorrente
    };
    
    dados.transacoes = [novaConta, ...(dados.transacoes || [])];
    localStorage.setItem('financeiro_pessoal', JSON.stringify(dados));
    carregarContas();
    setShowModal(false);
    setFormData({ descricao: '', categoria: 'Salário', valor: 0, data: new Date().toISOString().split('T')[0], recorrente: false });
  };

  const marcarComoRecebido = (id: string) => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      dados.transacoes = dados.transacoes.map((t: Transacao) => t.id === id ? { ...t, status: 'pago' } : t);
      localStorage.setItem('financeiro_pessoal', JSON.stringify(dados));
      carregarContas();
    }
  };

  const excluirConta = (id: string) => {
    if (confirm('Excluir esta conta?')) {
      const stored = localStorage.getItem('financeiro_pessoal');
      if (stored) {
        const dados = JSON.parse(stored);
        dados.transacoes = dados.transacoes.filter((t: Transacao) => t.id !== id);
        localStorage.setItem('financeiro_pessoal', JSON.stringify(dados));
        carregarContas();
      }
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const totalPendente = contas.reduce((acc, c) => acc + c.valor, 0);

  if (loading) return <div className="text-center py-8 text-gray-900 dark:text-gray-100">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💰 Contas a Receber</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total a receber: <span className="font-bold text-green-600">{formatCurrency(totalPendente)}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Conta
        </button>
      </div>

      <div className="space-y-3">
        {contas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">✅ Nenhuma conta a receber</p>
          </div>
        ) : (
          contas.map((conta) => (
            <div key={conta.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{conta.descricao}</h3>
                  {conta.recorrente && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Recorrente</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{conta.categoria}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Receber em: {new Date(conta.data).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{formatCurrency(conta.valor)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => marcarComoRecebido(conta.id)} className="text-green-600 hover:text-green-800" title="Marcar como recebido"><CheckCircle className="w-5 h-5" /></button>
                  <button onClick={() => excluirConta(conta.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nova Conta a Receber</h2>
            <form onSubmit={salvarConta} className="space-y-4">
              <input type="text" placeholder="Descrição" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500" required />
              <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700">
                <option>Salário</option><option>Freelance</option><option>Investimentos</option><option>Presentes</option>
              </select>
              <input type="number" step="0.01" placeholder="Valor" value={formData.valor} onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500" required />
              <input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700" required />
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" checked={formData.recorrente} onChange={(e) => setFormData({...formData, recorrente: e.target.checked})} /> Conta Recorrente</label>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700">Cancelar</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}