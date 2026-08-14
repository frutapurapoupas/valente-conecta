'use client';

import { useState, useEffect } from 'react';

// Definindo o tipo para os registros financeiros — colunas reais da tabela
// "financeiro" (criada fora do versionamento de migrations, ver
// app/api/cozinha/financeiro/route.ts). status vem como 'pago'/'pendente'.
interface RegistroFinanceiro {
  id: string;
  data: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  status: string;
}

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cozinha/financeiro', { cache: 'no-store' })
      .then((r) => r.json())
      .then((res) => setRegistros(res?.success ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  const totalReceitas = registros
    .filter(r => r.tipo === 'receita' && r.status === 'pago')
    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

  const totalDespesas = registros
    .filter(r => r.tipo === 'despesa' && r.status === 'pago')
    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

  const saldo = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500">Total Receitas</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-500">Total Despesas</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div className={`bg-white p-4 rounded-lg shadow border ${saldo >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <p className="text-sm text-gray-500">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum registro</td>
              </tr>
            ) : (
              registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(registro.data).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registro.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${registro.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {registro.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${registro.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {registro.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${registro.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {registro.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}