// components/admin-master/financeiro-pessoal/ModalImpressao.tsx
'use client';

import { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  tipo: 'receita' | 'despesa';
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
}

interface ModalImpressaoProps {
  isOpen: boolean;
  onClose: () => void;
  lancamentos: Lancamento[];
  categorias: Categoria[];
  periodo: { ano: number; mes: number };
}

export function ModalImpressao({ isOpen, onClose, lancamentos, categorias, periodo }: ModalImpressaoProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const getCategoriaNome = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId)?.nome || 'Sem categoria';
  };

  const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalTitle = document.title;
    document.title = `Extrato Financeiro - ${periodo.mes}/${periodo.ano}`;

    const printWindow = window.open('', '_blank');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Extrato Financeiro - ${periodo.mes}/${periodo.ano}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              .resumo { display: flex; gap: 20px; margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
              .receita { color: #10b981; }
              .despesa { color: #ef4444; }
              .saldo { font-weight: bold; font-size: 1.2em; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #f3f4f6; }
              .text-right { text-align: right; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    document.title = originalTitle;
  };

  const handleDownloadCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'];
    const rows = lancamentos.map(l => [
      formatarData(l.data),
      l.descricao,
      getCategoriaNome(l.categoriaId),
      l.valor.toFixed(2),
      l.tipo === 'receita' ? 'Receita' : 'Despesa',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_${periodo.mes}_${periodo.ano}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Extrato Financeiro</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div ref={printRef}>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">Valente Conecta</h1>
              <p className="text-zinc-400">Extrato Financeiro - {periodo.mes}/{periodo.ano}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-xl text-center">
                <p className="text-sm text-zinc-400">Receitas</p>
                <p className="text-2xl font-bold text-emerald-400">{formatarMoeda(totalReceitas)}</p>
              </div>
              <div className="bg-red-900/30 border border-red-800 p-4 rounded-xl text-center">
                <p className="text-sm text-zinc-400">Despesas</p>
                <p className="text-2xl font-bold text-red-400">{formatarMoeda(totalDespesas)}</p>
              </div>
              <div className={`p-4 rounded-xl text-center border ${saldo >= 0 ? 'bg-blue-900/30 border-blue-800' : 'bg-orange-900/30 border-orange-800'}`}>
                <p className="text-sm text-zinc-400">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                  {formatarMoeda(saldo)}
                </p>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="border border-zinc-700 p-2 text-left text-zinc-300">Data</th>
                  <th className="border border-zinc-700 p-2 text-left text-zinc-300">Descrição</th>
                  <th className="border border-zinc-700 p-2 text-left text-zinc-300">Categoria</th>
                  <th className="border border-zinc-700 p-2 text-right text-zinc-300">Valor</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map(l => (
                  <tr key={l.id}>
                    <td className="border border-zinc-700 p-2 text-zinc-300">{formatarData(l.data)}</td>
                    <td className="border border-zinc-700 p-2 text-white">{l.descricao}</td>
                    <td className="border border-zinc-700 p-2 text-zinc-300">{getCategoriaNome(l.categoriaId)}</td>
                    <td className={`border border-zinc-700 p-2 text-right ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {l.tipo === 'receita' ? '+' : '-'} {formatarMoeda(l.valor)}
                    </td>
                  </tr>
                ))}
                {lancamentos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="border border-zinc-700 p-8 text-center text-zinc-500">
                      Nenhum lançamento neste período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-zinc-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 border border-zinc-700"
          >
            <Printer size={18} /> Imprimir
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 border border-zinc-700"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}