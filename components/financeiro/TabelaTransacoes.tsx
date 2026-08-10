// components/financeiro/TabelaTransacoes.tsx
// ?? DESIGN - Tabela de transações

import { Edit, Trash2, Repeat, DollarSign } from 'lucide-react';  // ? ADICIONADO
import { formatarData, formatarMoeda } from '@/utils/financeiroUtils';
import { Transacao } from '@/services/financeiroService';

interface TabelaTransacoesProps {
  transacoes: Transacao[];
  onEdit: (transacao: Transacao) => void;
  onDelete: (id: string) => void;
}

export default function TabelaTransacoes({
  transacoes,
  onEdit,
  onDelete,
}: TabelaTransacoesProps) {
  if (transacoes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <DollarSign size={48} className="mx-auto opacity-30 mb-3" />
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Recorrência</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Tipo</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transacoes.map((transacao) => (
              <tr key={transacao.id} className="hover:bg-gray-800/50 transition">
                <td className="px-4 py-3 text-sm">{formatarData(transacao.data)}</td>
                <td className="px-4 py-3 font-medium">{transacao.descricao}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{transacao.categoria || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {transacao.recorrencia && transacao.recorrencia !== 'nenhuma' ? (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <Repeat size={12} /> {transacao.recorrencia}
                    </span>
                  ) : '-'}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
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
                      onClick={() => onEdit(transacao)}
                      className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(transacao.id)}
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
  );
}

