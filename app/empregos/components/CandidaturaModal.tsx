// app/empregos/components/CandidaturaModal.tsx

import { useState } from "react";
import { X } from "lucide-react";
import { Vaga, Curriculo } from "../types";

interface CandidaturaModalProps {
  isOpen: boolean;
  vaga: Vaga;
  curriculos: Curriculo[];
  curriculoAtivo: Curriculo | null;
  onClose: () => void;
  onConfirmar: (curriculoId?: string) => void;
}

export function CandidaturaModal({
  isOpen,
  vaga,
  curriculos,
  curriculoAtivo,
  onClose,
  onConfirmar,
}: CandidaturaModalProps) {
  const [curriculoSelecionado, setCurriculoSelecionado] = useState<string>(
    curriculoAtivo?.id || ""
  );

  if (!isOpen) return null;

  const handleConfirmar = () => {
    onConfirmar(curriculoSelecionado || curriculoAtivo?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Confirmar Candidatura</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Você está se candidatando para:</p>
            <p className="font-semibold text-lg">{vaga.titulo}</p>
            <p className="text-gray-600">{vaga.empresa}</p>
          </div>

          {curriculos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecione o currículo
              </label>
              <select
                value={curriculoSelecionado}
                onChange={(e) => setCurriculoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {curriculos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleConfirmar}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Confirmar Candidatura
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

