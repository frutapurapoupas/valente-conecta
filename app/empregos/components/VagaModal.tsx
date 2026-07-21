// app/empregos/components/VagaModal.tsx

import { useState } from "react";
import { X } from "lucide-react";
import { Vaga, TipoVaga, Modalidade, NivelExperiencia, StatusVaga } from "../types";

interface VagaModalProps {
  isOpen: boolean;
  vaga?: Vaga | null;
  onClose: () => void;
  onSave: (dados: any) => void;
  isAdmin: boolean;
}

export function VagaModal({ isOpen, vaga, onClose, onSave, isAdmin }: VagaModalProps) {
  const [form, setForm] = useState({
    titulo: vaga?.titulo || "",
    empresa: vaga?.empresa || "",
    descricao: vaga?.descricao || "",
    requisitos: vaga?.requisitos?.join("\n") || "",
    beneficios: vaga?.beneficios?.join("\n") || "",
    tipo: vaga?.tipo || "CLT",
    modalidade: vaga?.modalidade || "Presencial",
    nivel: vaga?.nivel || "Júnior",
    salarioMin: vaga?.salarioMin || "",
    salarioMax: vaga?.salarioMax || "",
    localizacao: vaga?.localizacao || "",
    status: vaga?.status || "aberta",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      ...form,
      requisitos: form.requisitos.split("\n").filter(r => r.trim()),
      beneficios: form.beneficios.split("\n").filter(b => b.trim()),
      salarioMin: form.salarioMin ? parseFloat(String(form.salarioMin)) : undefined,
      salarioMax: form.salarioMax ? parseFloat(String(form.salarioMax)) : undefined,
    };
    onSave(dados);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{vaga ? "Editar Vaga" : "Nova Vaga"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
              <input
                type="text"
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoVaga })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Estágio">Estágio</option>
                <option value="Temporário">Temporário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
              <select
                value={form.modalidade}
                onChange={(e) => setForm({ ...form, modalidade: e.target.value as Modalidade })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
              <select
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelExperiencia })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Estagiário">Estagiário</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusVaga })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="fechada">Fechada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input
                type="text"
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mínimo</label>
              <input
                type="number"
                value={form.salarioMin}
                onChange={(e) => setForm({ ...form, salarioMin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salário Máximo</label>
              <input
                type="number"
                value={form.salarioMax}
                onChange={(e) => setForm({ ...form, salarioMax: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos (um por linha)</label>
              <textarea
                value={form.requisitos}
                onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefícios (um por linha)</label>
              <textarea
                value={form.beneficios}
                onChange={(e) => setForm({ ...form, beneficios: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {vaga ? "Salvar Alterações" : "Criar Vaga"}
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

