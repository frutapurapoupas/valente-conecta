// app/cozinha/components/PedidoItem.tsx
"use client";

import { Pedido, PedidoStatus } from '../types/pedido';

interface PedidoItemProps {
  pedido: Pedido;
  onStatusChange?: (id: string, status: PedidoStatus) => void;
  onCancel?: (id: string) => void;
}

const statusColors: Record<PedidoStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  preparando: 'bg-purple-100 text-purple-800',
  pronto: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800'
};

const statusLabels: Record<PedidoStatus, string> = {
  pendente: '🕐 Pendente',
  confirmado: '✅ Confirmado',
  preparando: '👨‍🍳 Preparando',
  pronto: '🍽️ Pronto',
  entregue: '📦 Entregue',
  cancelado: '❌ Cancelado'
};

export function PedidoItem({ pedido, onStatusChange, onCancel }: PedidoItemProps) {
  const data = new Date(pedido.created_at);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Pedido #{pedido.id.slice(0, 8)}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[pedido.status]}`}>
              {statusLabels[pedido.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {pedido.usuarioNome || `Usuário: ${pedido.usuarioId.slice(0, 8)}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dataFormatada} às {horaFormatada}
          </p>
        </div>
        <span className="text-lg font-bold text-green-600">
          R$ {pedido.total.toFixed(2)}
        </span>
      </div>

      {pedido.observacao && (
        <p className="text-sm text-gray-600 mt-2 italic">
          Obs: {pedido.observacao}
        </p>
      )}

      <div className="mt-3 border-t pt-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">Itens:</p>
        <div className="space-y-1">
          {pedido.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantidade}x {item.produtoNome}
              </span>
              <span className="text-gray-600">
                R$ {item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(onStatusChange || onCancel) && pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
        <div className="flex gap-2 mt-4">
          {onStatusChange && (
            <select
              onChange={(e) => onStatusChange(pedido.id, e.target.value as PedidoStatus)}
              value={pedido.status}
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pendente">🕐 Pendente</option>
              <option value="confirmado">✅ Confirmar</option>
              <option value="preparando">👨‍🍳 Preparar</option>
              <option value="pronto">🍽️ Pronto</option>
              <option value="entregue">📦 Entregue</option>
            </select>
          )}
          {onCancel && pedido.status !== 'entregue' && (
            <button
              onClick={() => onCancel(pedido.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}