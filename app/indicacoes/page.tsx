"use client";

import { useIndicacoes } from "@/modules/indicacoes";
import { useState } from "react";

export default function IndicacoesPage() {
  const { indicacoes, stats, loading, error, criar, atualizarStatus, aplicarFiltro } = useIndicacoes();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome_indicante: "", nome_indicado: "", telefone_indicado: "", email_indicado: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({ ...formData, user_id: "current-user-id", status: "pendente" });
      setShowForm(false);
      setFormData({ nome_indicante: "", nome_indicado: "", telefone_indicado: "", email_indicado: "" });
    } catch (err) {}
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    aceito: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800"
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Minhas Indicações</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Nova Indicação
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Concluídos</p><p className="text-2xl font-bold text-green-600">{stats.concluidos}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Bônus Total</p><p className="text-2xl font-bold text-blue-600">R$ {stats.bonusTotal.toFixed(2)}</p></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Indicante</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Indicado</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Bônus</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {indicacoes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhuma indicação</td></tr>
            ) : (
              indicacoes.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4">{i.nome_indicante}</td>
                  <td className="px-6 py-4">{i.nome_indicado}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-sm ${statusColors[i.status] || "bg-gray-100"}`}>{i.status}</span></td>
                  <td className="px-6 py-4">R$ {(i.bonus || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <select onChange={(e) => atualizarStatus(i.id, e.target.value)} value={i.status} className="text-sm border rounded px-2 py-1">
                      <option value="pendente">Pendente</option>
                      <option value="aceito">Aceito</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
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
            <h2 className="text-xl font-bold mb-4">Nova Indicação</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="nome_indicante" value={formData.nome_indicante} onChange={(e) => setFormData({...formData, nome_indicante: e.target.value})} placeholder="Seu nome" className="w-full p-2 border rounded" required />
              <input name="nome_indicado" value={formData.nome_indicado} onChange={(e) => setFormData({...formData, nome_indicado: e.target.value})} placeholder="Nome do indicado" className="w-full p-2 border rounded" required />
              <input name="telefone_indicado" value={formData.telefone_indicado} onChange={(e) => setFormData({...formData, telefone_indicado: e.target.value})} placeholder="Telefone do indicado" className="w-full p-2 border rounded" required />
              <input name="email_indicado" value={formData.email_indicado} onChange={(e) => setFormData({...formData, email_indicado: e.target.value})} placeholder="Email do indicado (opcional)" className="w-full p-2 border rounded" />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Enviar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
