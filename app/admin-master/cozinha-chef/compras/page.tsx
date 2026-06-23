// app/admin-master/cozinha-chef/compras/page.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Package,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCompras } from '@/hooks/cozinha/useCompras';
import { CompraItem } from '@/types/cozinha';

export default function ListaCompras() {
  const { items, loading, carregar, toggleComprado, excluir } = useCompras();
  const [showAdicionar, setShowAdicionar] = useState(false);

  // Função para obter cor da prioridade
  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-400 bg-red-500/20';
      case 'media': return 'text-yellow-400 bg-yellow-500/20';
      case 'baixa': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Função para obter label da prioridade
  const getPrioridadeLabel = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Média';
      case 'baixa': return '🟢 Baixa';
      default: return '⚪ N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Package className="text-blue-400" />
              Lista de Compras
            </h1>
            <p className="text-sm text-gray-400">Gerencie os itens para compra</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={carregar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Loader2 size={16} className={loading ? 'animate-spin' : ''} /> 
              Atualizar
            </button>
            <Link
              href="/admin-master/cozinha-chef/compras/ajuste"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <CheckCircle size={16} /> Ajuste Pós-Compra
            </Link>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Item</th>
                  <th className="px-4 py-3 text-left text-gray-400">Qtd</th>
                  <th className="px-4 py-3 text-left text-gray-400">Unidade</th>
                  <th className="px-4 py-3 text-left text-gray-400">Preço Est.</th>
                  <th className="px-4 py-3 text-left text-gray-400">Prioridade</th>
                  <th className="px-4 py-3 text-left text-gray-400">Status</th>
                  <th className="px-4 py-3 text-center text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      <Package size={32} className="mx-auto opacity-30 mb-2" />
                      Nenhum item na lista de compras
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-4 py-3 font-medium">{item.nome}</td>
                      <td className="px-4 py-3">{item.quantidade}</td>
                      <td className="px-4 py-3 text-gray-400">{item.unidade}</td>
                      <td className="px-4 py-3 text-blue-400">
                        R$ {item.preco_estimado?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadeColor(item.prioridade)}`}>
                          {getPrioridadeLabel(item.prioridade)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.comprado ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle size={14} /> Comprado
                          </span>
                        ) : (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <AlertCircle size={14} /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleComprado(item.id)}
                            className={`p-1 rounded transition ${
                              item.comprado 
                                ? 'text-yellow-400 hover:bg-yellow-500/20' 
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={item.comprado ? 'Desmarcar comprado' : 'Marcar comprado'}
                          >
                            {item.comprado ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => excluir(item.id)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition"
                            title="Excluir item"
                          >
                            <Trash2 size={16} />
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

        {/* Resumo */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400">Total de Itens</p>
            <p className="text-xl font-bold">{items.length}</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400">Comprados</p>
            <p className="text-xl font-bold text-green-400">
              {items.filter(i => i.comprado).length}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400">Pendentes</p>
            <p className="text-xl font-bold text-yellow-400">
              {items.filter(i => !i.comprado).length}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400">Alta Prioridade</p>
            <p className="text-xl font-bold text-red-400">
              {items.filter(i => i.prioridade === 'alta' && !i.comprado).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}