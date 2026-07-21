'use client';

import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: string;
}

export default function ExtratoPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [dataInicio, setDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      setTransacoes(dados.transacoes || []);
    }
  }, []);

  const transacoesFiltradas = transacoes.filter(t => t.data >= dataInicio && t.data <= dataFim && t.status === 'pago').sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  let saldoAcumulado = 0;
  const transacoesComSaldo = transacoesFiltradas.map(t => {
    if (t.tipo === 'receita') saldoAcumulado += t.valor;
    else saldoAcumulado -= t.valor;
    return { ...t, saldo: saldoAcumulado };
  });

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((a, b) => a + b.valor, 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((a, b) => a + b.valor, 0);
  const saldoFinal = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ðŸ“„ Extrato BancÃ¡rio</h1>
        <button onClick={handlePrint} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Printer className="w-4 h-4" /> Imprimir</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:mb-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"><p className="text-sm text-gray-500">PerÃ­odo</p><div className="flex gap-2 mt-2"><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border rounded px-3 py-1 text-sm" /><span>a</span><input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border rounded px-3 py-1 text-sm" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"><p className="text-sm text-gray-500">Total Receitas</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"><p className="text-sm text-gray-500">Saldo Final</p><p className={`text-xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldoFinal)}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-left">DescriÃ§Ã£o</th><th className="px-4 py-3 text-left">Categoria</th><th className="px-4 py-3 text-right">Receitas</th><th className="px-4 py-3 text-right">Despesas</th><th className="px-4 py-3 text-right">Saldo</th></tr></thead>
            <tbody>{transacoesComSaldo.map(t => (<tr key={t.id} className="border-t"><td className="px-4 py-2 text-sm">{formatDate(t.data)}</td><td className="px-4 py-2 text-sm">{t.descricao}</td><td className="px-4 py-2 text-sm">{t.categoria}</td><td className="px-4 py-2 text-right text-green-600">{t.tipo === 'receita' ? formatCurrency(t.valor) : '-'}</td><td className="px-4 py-2 text-right text-red-600">{t.tipo === 'despesa' ? formatCurrency(t.valor) : '-'}</td><td className="px-4 py-2 text-right font-semibold">{formatCurrency(t.saldo)}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

