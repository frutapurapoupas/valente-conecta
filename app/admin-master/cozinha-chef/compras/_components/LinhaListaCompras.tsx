'use client';

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\compras\_components\LinhaListaCompras.tsx
//
// Uma linha da lista final de compra: fornecedor e preco real editaveis
// ali mesmo. Preco real e' obrigatorio pra marcar como comprado -- e' ele
// que credita a quantidade no estoque com o preco pago de verdade (ver
// app/api/cozinha/lista-compras/route.ts, PUT).

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CompraItem } from '@/types/cozinha';

interface LinhaListaComprasProps {
  item: CompraItem;
  onSalvarFornecedor: (id: string, fornecedor: string) => void;
  onMarcarComprado: (id: string, precoReal: number) => void;
  onDesmarcarComprado: (id: string) => void;
  onExcluir: (id: string) => void;
}

export function LinhaListaCompras({ item, onSalvarFornecedor, onMarcarComprado, onDesmarcarComprado, onExcluir }: LinhaListaComprasProps) {
  const [fornecedor, setFornecedor] = useState(item.fornecedor || '');
  const [precoReal, setPrecoReal] = useState(item.preco_real != null ? String(item.preco_real) : '');

  const salvarFornecedorSeMudou = () => {
    if (fornecedor !== (item.fornecedor || '')) onSalvarFornecedor(item.id, fornecedor);
  };

  const confirmarCompra = () => {
    const valor = Number(precoReal);
    if (!valor || valor <= 0) {
      toast.error('Informe o preço real pago antes de marcar como comprado.');
      return;
    }
    onMarcarComprado(item.id, valor);
  };

  return (
    <tr className="hover:bg-gray-800/30 transition">
      <td className="px-4 py-3 font-medium">{item.nome}</td>
      <td className="px-4 py-3">{item.quantidade}</td>
      <td className="px-4 py-3 text-gray-400">{item.unidade}</td>
      <td className="px-4 py-3 text-blue-400">R$ {item.preco_estimado?.toFixed(2) || '0.00'}</td>
      <td className="px-4 py-3 text-gray-300">{item.receita_origem || '-'}</td>
      <td className="px-4 py-3">
        <input
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          onBlur={salvarFornecedorSeMudou}
          disabled={item.comprado}
          placeholder="Fornecedor"
          className="w-32 bg-gray-900/60 border border-gray-700 rounded px-2 py-1 text-sm text-white disabled:opacity-60"
        />
      </td>
      <td className="px-4 py-3">
        {item.comprado ? (
          <span className="text-blue-300">R$ {Number(item.preco_real || 0).toFixed(2)}</span>
        ) : (
          <input
            type="number"
            step="0.01"
            min="0"
            value={precoReal}
            onChange={(e) => setPrecoReal(e.target.value)}
            placeholder="R$ pago"
            className="w-24 bg-gray-900/60 border border-gray-700 rounded px-2 py-1 text-sm text-white"
          />
        )}
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
            onClick={() => (item.comprado ? onDesmarcarComprado(item.id) : confirmarCompra())}
            className={`p-1 rounded transition ${
              item.comprado ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-green-400 hover:bg-green-500/20'
            }`}
            title={item.comprado ? 'Desmarcar comprado' : 'Marcar comprado'}
          >
            {item.comprado ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </button>
          <button onClick={() => onExcluir(item.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition" title="Excluir item">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
