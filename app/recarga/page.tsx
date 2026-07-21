"use client";

import { useRecarga } from "@/modules/recarga";
import { useState } from "react";

// TODO: Obter userId do contexto de autenticação
const USER_ID = "current-user-id";

export default function RecargaPage() {
  const { recargas, stats, loading, error, criar, confirmar, cancelar } = useRecarga(USER_ID);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ valor: "", metodo: "pix" as const });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        usuario_id: USER_ID,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo,
        status: "pendente"
      });
      setShowForm(false);
      setFormData({ valor: "", metodo: "pix" });
    } catch (err) {}
  };

  if (loading && recargas.length === 0) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Erro: {error.message}</div>;
  }

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    confirmado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    falha: "bg-gray-100 text-gray-800"
  };

  const metodoLabels: Record<string, string> = {
    pix: "PIX",
    cartao: "Cartão",
    boleto: "Boleto",
    transferencia: "Transferência"
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recargas</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Nova Recarga
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Total R$</p><p className="text-2xl font-bold text-blue-600">R$ {stats.totalValor.toFixed(2)}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Confirmados</p><p className="text-2xl font-bold text-green-600">{stats.confirmados}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Cancelados</p><p className="text-2xl font-bold text-red-600">{stats.cancelados}</p></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {recargas.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhuma recarga</td></tr>
            ) : (
              recargas.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 font-bold">R$ {r.valor.toFixed(2)}</td>
                  <td className="px-6 py-4">{metodoLabels[r.metodo] || r.metodo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[r.status] || "bg-gray-100"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {r.status === "pendente" && (
                      <div className="flex gap-2">
                        <button onClick={() => confirmar(r.id)} className="text-green-600 hover:text-green-800 text-sm">Confirmar</button>
                        <button onClick={() => cancelar(r.id)} className="text-red-600 hover:text-red-800 text-sm">Cancelar</button>
                      </div>
                    )}
                    {r.status === "confirmado" && (
                      <span className="text-sm text-green-600">✓ Confirmado</span>
                    )}
                    {r.status === "cancelado" && (
                      <span className="text-sm text-red-600">✗ Cancelado</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">Nova Recarga</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="Valor (R$)"
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={formData.metodo}
                onChange={(e) => setFormData({...formData, metodo: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                  Solicitar Recarga
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
