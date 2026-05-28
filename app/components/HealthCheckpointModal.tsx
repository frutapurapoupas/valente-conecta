"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface HealthCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function HealthCheckpointModal({ isOpen, onClose, onSave }: HealthCheckpointModalProps) {
  const [peso, setPeso] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (peso) {
      const checkpoint = { data: new Date().toISOString(), peso: parseFloat(peso) };
      const historico = localStorage.getItem("academia_checkpoints");
      const lista = historico ? JSON.parse(historico) : [];
      lista.push(checkpoint);
      localStorage.setItem("academia_checkpoints", JSON.stringify(lista));
      onSave();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">📊 Checkpoint de Saúde</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>
        <div className="space-y-4">
          <input
            type="number"
            step="0.1"
            placeholder="Seu peso atual (kg)"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 rounded-xl text-white"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-green-600 rounded-xl font-bold">Salvar</button>
        </div>
      </div>
    </div>
  );
}
