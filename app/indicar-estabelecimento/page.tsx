"use client";

import { useEstabelecimento } from "@/modules/estabelecimento";
import { useState } from "react";

// TODO: Obter userId do contexto de autenticação
const USER_ID = "current-user-id";

export default function IndicarEstabelecimentoPage() {
  const { estabelecimentos, stats, loading, error, criar, aprovar, rejeitar } = useEstabelecimento();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    site: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        ...formData,
        usuario_id: USER_ID,
        status: "pendente"
      });
      setShowForm(false);
      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        telefone: "",
        email: "",
        site: ""
      });
    } catch (err) {}
  };

  if (loading && estabelecimentos.length === 0) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Erro: {error.message}</div>;
  }

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    aprovado: "bg-green-100 text-green-800",
    rejeitado: "bg-red-100 text-red-800"
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Indicar Estabelecimento</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Novo Estabelecimento
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Aprovados</p><p className="text-2xl font-bold text-green-600">{stats.aprovados}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Rejeitados</p><p className="text-2xl font-bold text-red-600">{stats.rejeitados}</p></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {estabelecimentos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum estabelecimento</td></tr>
            ) : (
              estabelecimentos.map((e) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 font-medium">{e.nome}</td>
                  <td className="px-6 py-4">{e.categoria}</td>
                  <td className="px-6 py-4">{e.cidade}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[e.status] || "bg-gray-100"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {e.status === "pendente" && (
                      <div className="flex gap-2">
                        <button onClick={() => aprovar(e.id)} className="text-green-600 hover:text-green-800 text-sm">Aprovar</button>
                        <button onClick={() => rejeitar(e.id)} className="text-red-600 hover:text-red-800 text-sm">Rejeitar</button>
                      </div>
                    )}
                    {e.status === "aprovado" && (
                      <span className="text-sm text-green-600">✓ Aprovado</span>
                    )}
                    {e.status === "rejeitado" && (
                      <span className="text-sm text-red-600">✗ Rejeitado</span>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Estabelecimento</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome do estabelecimento"
                className="w-full p-2 border rounded"
                required
              />
              <input
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="Categoria"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição"
                className="w-full p-2 border rounded"
                rows={3}
              />
              <input
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                placeholder="Endereço"
                className="w-full p-2 border rounded"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  placeholder="Cidade"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  placeholder="Estado"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  placeholder="CEP"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="Telefone"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  type="email"
                />
                <input
                  value={formData.site}
                  onChange={(e) => setFormData({...formData, site: e.target.value})}
                  placeholder="Site"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                  Enviar
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
