// app/empregos/components/EmpregosList.tsx

import { Briefcase, Loader2 } from "lucide-react";
import { Vaga } from "../types";
import { VagaCard } from "./VagaCard";

interface EmpregosListProps {
  vagas: Vaga[];
  loading: boolean;
  isAdmin: boolean;
  onEditar: (vaga: Vaga) => void;
  onExcluir: (id: string) => void;
  onCandidatar: (vaga: Vaga) => void;
  onVerDetalhes: (vaga: Vaga) => void;
}

// ============================================================================
// COMPONENTE DE DESIGN - APENAS UI
// ============================================================================

export function EmpregosList({
  vagas,
  loading,
  isAdmin,
  onEditar,
  onExcluir,
  onCandidatar,
  onVerDetalhes,
}: EmpregosListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  if (vagas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Nenhuma vaga encontrada</p>
          <p className="text-sm text-gray-400">Ajuste os filtros ou tente novamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vagas.map((vaga) => (
        <VagaCard
          key={vaga.id}
          vaga={vaga}
          isAdmin={isAdmin}
          onEditar={onEditar}
          onExcluir={onExcluir}
          onCandidatar={onCandidatar}
          onVerDetalhes={onVerDetalhes}
        />
      ))}
    </div>
  );
}

