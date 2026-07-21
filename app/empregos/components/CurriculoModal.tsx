// app/empregos/components/CurriculoModal.tsx

import { useState } from "react";
import { X } from "lucide-react";
import { Curriculo } from "../types";

interface CurriculoModalProps {
  isOpen: boolean;
  curriculo?: Curriculo | null;
  onClose: () => void;
  onSave: (dados: any) => void;
}

export function CurriculoModal({ isOpen, curriculo, onClose, onSave }: CurriculoModalProps) {
  const [form, setForm] = useState({
    nome: curriculo?.nome || "",
    email: curriculo?.email || "",
    telefone: curriculo?.telefone || "",
    objetivo: curriculo?.objetivo || "",
    habilidades: curriculo?.habilidades?.join("\n") || "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      ...form,
      habilidades: form.habilidades.split("\n").filter(h => h.trim()),
      experiencias: [],
      educacao: [],
      idiomas: [],
      certificacoes: [],
      status: "ativo",
    };
    onSave(dados);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{curriculo ? "Editar Currículo" : "Novo Currículo"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo *</label>
            <textarea
              value={form.objetivo}
              onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades (uma por linha)</label>
            <textarea
              value={form.habilidades}
              onChange={(e) => setForm({ ...form, habilidades: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {curriculo ? "Salvar Alterações" : "Cadastrar Currículo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

