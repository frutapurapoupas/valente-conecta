// app/admin-master/cozinha-chef/financeiro/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  FileText,
  Printer
} from 'lucide-react';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
  categoria?: string;
  forma_pagamento?: string;
  status?: string;
  recorrencia?: string;
  observacoes?: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categorias, setCategorias] = useState<string[]>([
    'Vendas', 'Compras', 'Folha', 'Aluguel', 'Contas', 'Outros'
  ]);

  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    forma_pagamento: 'PIX',
    status: 'pago',
    recorrencia: 'nenhuma',
    observacoes: ''
  });

  // Carregar transações
  const carregarTransacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/financeiro');
      const result = await response.json();
      if (result.success) {
        setTransacoes(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  // ============================================================
  // FUNÇÃO PARA GERAR PDF (COM DYNAMIC IMPORT)
  // ============================================================
  const gerarPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
      const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
      const saldo = totalReceitas - totalDespesas;

      // Título
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94);
      doc.text('📊 Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });

      // Resumo
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO FINANCEIRO', 14, 45);

      const summaryData = [
        ['Total Receitas', `R$ ${totalReceitas.toFixed(2)}`],
        ['Total Despesas', `R$ ${totalDespesas.toFixed(2)}`],
        ['Saldo', `R$ ${saldo.toFixed(2)}`],
        ['Margem', `${totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : 0}%`]
      ];

      autoTable(doc, {
        startY: 50,
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'right' }
        }
      });

      // Tabela de transações
      const tableData = transacoes.map(t => [
        new Date(t.data).toLocaleDateString('pt-BR'),
        t.descricao,
        t.categoria || '-',
        t.tipo === 'receita' ? '+' : '-',
        `R$ ${t.valor.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY + 10 || 70,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30, halign: 'right' }
        }
      });

      // Rodapé
      const finalY = (doc as any).lastAutoTable?.finalY || 250;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Valente Conecta - Sistema Financeiro', pageWidth / 2, finalY + 15, { align: 'center' });

      // Salvar PDF
      doc.save(`financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF. Verifique se as bibliotecas estão instaladas.');
    }
  };

  // Salvar transação
  const salvarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `/api/cozinha/financeiro/${editingId}`
        : '/api/cozinha/financeiro';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        alert(editingId ? '✅ Transação atualizada!' : '✅ Transação criada!');
        setShowModal(false);
        setEditingId(null);
        resetForm();
        carregarTransacoes();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar transação');
    }
  };

  // Adicionar nova categoria
  const adicionarCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      setCategorias([...categorias, novaCategoria.trim()]);
      setNovaCategoria('');
      setShowCategoriaModal(false);
      alert(`✅ Categoria "${novaCategoria.trim()}" adicionada!`);
    } else if (categorias.includes(novaCategoria.trim())) {
      alert('⚠️ Esta categoria já existe!');
    } else {
      alert('❌ Digite um nome para a categoria');
    }
  };

  const editarTransacao = (transacao: Transacao) => {
    setEditingId(transacao.id);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      categoria: transacao.categoria || '',
      data: transacao.data,
      forma_pagamento: transacao.forma_pagamento || 'PIX',
      status: transacao.status || 'pago',
      recorrencia: transacao.recorrencia || 'nenhuma',
      observacoes: transacao.observacoes || ''
    });
    setShowModal(true);
  };

  const excluirTransacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      const response = await fetch(`/api/cozinha/financeiro/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        alert('✅ Transação excluída!');
        carregarTransacoes();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('❌ Erro ao excluir transação');
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: 0,
      tipo: 'receita',
      categoria: '',
      data: new Date().toISOString().split('T')[0],
      forma_pagamento: 'PIX',
      status: 'pago',
      recorrencia: 'nenhuma',
      observacoes: ''
    });
  };

  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <DollarSign className="text-green-400" />
              Financeiro
            </h1>
            <p className="text-sm text-gray-400">{transacoes.length} transações registradas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Plus size={16} /> Nova Transação
            </button>
            <button
              onClick={gerarPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <FileText size={16} /> PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button
              onClick={carregarTransacoes}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-sm text-gray-400">Total Receitas</p>
            <p className="text-2xl font-bold text-green-400">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-sm text-gray-400">Total Despesas</p>
            <p className="text-2xl font-bold text-red-400">R$ {totalDespesas.toFixed(2)}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${
            saldo >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className="text-sm text-gray-400">Saldo</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {saldo.toFixed(2)}
            </p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${
            margem >= 30 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <p className="text-sm text-gray-400">Margem</p>
            <p className={`text-2xl font-bold ${margem >= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
              {margem.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transacoes.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 text-sm">{new Date(transacao.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 font-medium">{transacao.descricao}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{transacao.categoria || '-'}</td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transacao.tipo === 'receita' ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Receita</span>
                      ) : (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Despesa</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => editarTransacao(transacao)}
                          className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => excluirTransacao(transacao.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {transacoes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <DollarSign size={48} className="mx-auto opacity-30 mb-3" />
            <p>Nenhuma transação registrada</p>
          </div>
        )}
      </div>

      {/* Modal de Nova/Editar Transação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingId ? '✏️ Editar Transação' : '💰 Nova Transação'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={salvarTransacao} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descrição *</label>
                  <input
                    type="text"
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Venda - Feijoada"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo *</label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'receita' | 'despesa' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoriaModal(true)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm whitespace-nowrap"
                      title="Nova Categoria"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Data</label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Pagamento</label>
                    <select
                      value={formData.forma_pagamento}
                      onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Boleto">Boleto</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">🔄 Recorrência</label>
                  <select
                    value={formData.recorrencia}
                    onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="nenhuma">Nenhuma</option>
                    <option value="diária">Diária</option>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    placeholder="Observações adicionais..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-sm w-full border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">📂 Nova Categoria</h2>
                <button
                  onClick={() => {
                    setShowCategoriaModal(false);
                    setNovaCategoria('');
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome da Categoria</label>
                  <input
                    type="text"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Ex: Marketing, Transporte, etc."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && adicionarCategoria()}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCategoriaModal(false);
                      setNovaCategoria('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={adicionarCategoria}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400">Categorias existentes:</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {categorias.map((cat) => (
                      <span key={cat} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}