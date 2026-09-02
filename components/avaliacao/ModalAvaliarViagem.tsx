"use client";

// Caminho: C:\valente_conecta\components\avaliacao\ModalAvaliarViagem.tsx
//
// Modal de avaliação (até 5 estrelas) pro motorista E o veículo, com
// ocorrência opcional — aberto assim que uma corrida de Moto-Táxi ou
// viagem de Carona Solidária é marcada como concluída (ver
// 096_avaliacoes.sql). Reutilizado nos dois módulos: só muda o endpoint
// de destino conforme `tipoViagem`.

import { useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  tipoViagem: "mototaxi" | "carona";
  viagemId: string;
  motoristaId: string;
  passageiroId: string | null;
  nomeMotorista: string;
  fotoMotorista?: string | null;
  onFechar: () => void;
  onEnviado: () => void;
}

function LinhaEstrelas({ label, valor, onChange }: { label: string; valor: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star className={`w-8 h-8 transition-colors ${n <= valor ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ModalAvaliarViagem({ tipoViagem, viagemId, motoristaId, passageiroId, nomeMotorista, fotoMotorista, onFechar, onEnviado }: Props) {
  const [estrelasMotorista, setEstrelasMotorista] = useState(0);
  const [estrelasVeiculo, setEstrelasVeiculo] = useState(0);
  const [ocorrencia, setOcorrencia] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (estrelasMotorista === 0 || estrelasVeiculo === 0) {
      toast.error("Avalie o motorista e o veículo pra continuar.");
      return;
    }
    setEnviando(true);
    try {
      const rota = tipoViagem === "mototaxi" ? "/api/mototaxi/avaliacoes" : "/api/carona/avaliacoes";
      const corpo =
        tipoViagem === "mototaxi"
          ? { corridaId: viagemId, motoristaId, passageiroId, estrelasMotorista, estrelasVeiculo, ocorrencia: ocorrencia.trim() || null }
          : { viagemId, motoristaId, passageiroId, estrelasMotorista, estrelasVeiculo, ocorrencia: ocorrencia.trim() || null };

      const resp = await fetch(rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);

      toast.success("Obrigado pela avaliação!");
      onEnviado();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar avaliação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Como foi sua viagem?</h2>
          <button onClick={onFechar}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {fotoMotorista && <img src={fotoMotorista} alt={nomeMotorista} className="w-12 h-12 rounded-full object-cover border" />}
          <p className="text-sm text-gray-600">Motorista: <strong>{nomeMotorista}</strong></p>
        </div>

        <div className="space-y-4">
          <LinhaEstrelas label="Motorista" valor={estrelasMotorista} onChange={setEstrelasMotorista} />
          <LinhaEstrelas label="Veículo" valor={estrelasVeiculo} onChange={setEstrelasVeiculo} />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Teve algum problema? (opcional)</label>
            <textarea
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              placeholder="Conte pra gente o que aconteceu..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar avaliação"}
          </button>
        </div>
      </div>
    </div>
  );
}
