'use client';

import { useState, useEffect } from 'react';
import { Download, DollarSign, ShoppingBag, Users } from 'lucide-react';

type Venda = {
  id: string;
  date?: string;
  createdAt: string;
  customerName: string;
  items: any[];
  total: number;
  paymentMethod: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export default function RelatorioVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);

  const carregarVendas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/orders');
      const data = await response.json();
      
      if (data.success && data.data) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59);
        
        const vendasFiltradas = data.data.filter((v: any) => {
          const dataVenda = new Date(v.createdAt);
          return dataVenda >= inicio && dataVenda <= fim;
        });
        
        const vendasFormatadas: Venda[] = vendasFiltradas.map((v: any) => ({
          id: v.id,
          createdAt: v.createdAt,
          customerName: v.customerName || v.customer_name || 'N/A',
          items: Array.isArray(v.items) ? v.items : JSON.parse(v.items || '[]'),
          total: v.total || 0,
          paymentMethod: v.paymentMethod || v.payment_method || 'dinheiro'
        }));
        
        setVendas(vendasFormatadas);
        
        const total = vendasFormatadas.reduce((sum: number, v: Venda) => sum + (v.total || 0), 0);
        const qtd = vendasFormatadas.length;
        
        setTotalPeriodo(total);
        setTotalPedidos(qtd);
        setTicketMedio(qtd > 0 ? total / qtd : 0);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, [dataInicio, dataFim]);

  const exportarCSV = () => {
    if (vendas.length === 0) return;
    
    const headers = ['Data', 'Cliente', 'Itens', 'Total', 'Pagamento'];
    
    const rows = vendas.map(v => [
      new Date(v.createdAt).toLocaleDateString('pt-BR'),
      v.customerName || 'N/A',
      v.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', '),
      `R$ ${(v.total || 0).toFixed(2)}`,
      v.paymentMethod === 'pix' ? 'PIX' : v.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_vendas_${dataInicio}_a_${dataFim}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const obterDataExibicao = (venda: Venda) => {
    return new Date(venda.createdAt).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Relatório de Vendas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Análise detalhada de vendas por período</p>
          </div>
          <button
            onClick={exportarCSV}
            disabled={vendas.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={18} /> Exportar CSV
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total do Período</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPeriodo)}</p>
              </div>
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
              </div>
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(ticketMedio)}</p>
              </div>
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {obterDataExibicao(venda)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {venda.customerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {venda.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(venda.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {venda.paymentMethod === 'pix' ? 'PIX' : 
                       venda.paymentMethod === 'card' ? 'Cartão' : 
                       venda.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Outro'}
                    </td>
                  </tr>
                ))}
                {vendas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma venda encontrada no período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}