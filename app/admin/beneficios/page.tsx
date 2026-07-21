"use client";

import { useBeneficios } from "@/modules/admin";
import { useState } from "react";

export default function BeneficiosPage() {
  const { data: beneficios, loading, error, create, update, remove } = useBeneficios();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este benefício?")) {
      await remove(id);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Benefícios</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Novo Benefício
        </button>
      </div>

      <div className="grid gap-4">
        {beneficios?.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.nome}</h3>
              <p className="text-sm text-gray-600">{item.descricao}</p>
              <span className="text-sm font-medium text-green-600">
                R$ {item.valor?.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(item); setShowForm(true); }}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Editar" : "Novo"} Benefício
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = {
                nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
                descricao: (form.elements.namedItem("descricao") as HTMLInputElement).value,
                valor: parseFloat((form.elements.namedItem("valor") as HTMLInputElement).value),
                tipo: (form.elements.namedItem("tipo") as HTMLSelectElement).value,
              };
              handleSubmit(data);
            }}>
              <input name="nome" defaultValue={editing?.nome || ""} placeholder="Nome" className="w-full p-2 border rounded mb-2" required />
              <input name="descricao" defaultValue={editing?.descricao || ""} placeholder="Descrição" className="w-full p-2 border rounded mb-2" />
              <input name="valor" type="number" defaultValue={editing?.valor || ""} placeholder="Valor" className="w-full p-2 border rounded mb-2" required />
              <select name="tipo" defaultValue={editing?.tipo || "desconto"} className="w-full p-2 border rounded mb-4">
                <option value="desconto">Desconto</option>
                <option value="bonus">Bônus</option>
                <option value="voucher">Voucher</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                  Salvar
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">
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
