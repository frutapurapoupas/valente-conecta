"use client";

import { useQRCode } from "@/modules/qrcode";
import { useState } from "react";

export default function QRCodePage() {
  const { qrcodes, stats, loading, error, criar, remover } = useQRCode();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ codigo: "", tipo: "estabelecimento" as const, referencia_id: "", metadata: "{}" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        codigo: formData.codigo,
        tipo: formData.tipo,
        referencia_id: formData.referencia_id,
        metadata: JSON.parse(formData.metadata),
        ativo: true
      });
      setShowForm(false);
      setFormData({ codigo: "", tipo: "estabelecimento", referencia_id: "", metadata: "{}" });
    } catch (err) {}
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">QR Codes</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Novo QR Code
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Ativos</p><p className="text-2xl font-bold text-green-600">{stats.ativos}</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-gray-600">Visualizações</p><p className="text-2xl font-bold text-blue-600">{stats.visualizacoesTotal}</p></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visualizações</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {qrcodes.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum QR Code</td></tr>
            ) : (
              qrcodes.map((q) => (
                <tr key={q.id}>
                  <td className="px-6 py-4 font-mono text-sm">{q.codigo}</td>
                  <td className="px-6 py-4 capitalize">{q.tipo}</td>
                  <td className="px-6 py-4">{q.referencia_id}</td>
                  <td className="px-6 py-4">{q.visualizacoes}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${q.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {q.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => remover(q.id)} className="text-red-600 hover:text-red-800 text-sm">Remover</button>
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
            <h2 className="text-xl font-bold mb-4">Novo QR Code</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="codigo" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} placeholder="Código" className="w-full p-2 border rounded" required />
              <select name="tipo" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as any})} className="w-full p-2 border rounded">
                <option value="estabelecimento">Estabelecimento</option>
                <option value="produto">Produto</option>
                <option value="promocao">Promoção</option>
                <option value="usuario">Usuário</option>
              </select>
              <input name="referencia_id" value={formData.referencia_id} onChange={(e) => setFormData({...formData, referencia_id: e.target.value})} placeholder="ID da Referência" className="w-full p-2 border rounded" required />
              <input name="metadata" value={formData.metadata} onChange={(e) => setFormData({...formData, metadata: e.target.value})} placeholder="Metadata (JSON)" className="w-full p-2 border rounded" />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Criar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
