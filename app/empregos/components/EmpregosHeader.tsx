// app/empregos/components/EmpregosHeader.tsx

import { Briefcase, Plus, FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmpregosHeaderProps {
  isAdmin: boolean;
  onNovaVaga: () => void;
  onNovoCurriculo: () => void;
}

// ============================================================================
// COMPONENTE DE DESIGN - APENAS UI
// ============================================================================

export function EmpregosHeader({ isAdmin, onNovaVaga, onNovoCurriculo }: EmpregosHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Briefcase className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-white font-bold text-xl">ðŸ’¼ Portal de Empregos</h1>
            <p className="text-white/70 text-sm">Encontre as melhores oportunidades</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={onNovaVaga}
              className="bg-white text-blue-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition"
            >
              <Plus className="w-4 h-4" />
              Nova Vaga
            </button>
          )}
          <button
            onClick={onNovoCurriculo}
            className="bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition"
          >
            <FileText className="w-4 h-4" />
            Meu Currículo
          </button>
        </div>
      </div>
    </header>
  );
}

