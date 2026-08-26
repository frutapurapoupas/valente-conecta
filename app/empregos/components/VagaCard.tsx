// app/empregos/components/VagaCard.tsx

import { Calendar, MapPin, DollarSign, Users, Edit2, Trash2 } from "lucide-react";
import { Vaga } from "../types";
import {
  formatarData,
  formatarDataRelativa,
  formatarSalario,
  getStatusVagaCor,
  getStatusVagaLabel,
  getTipoVagaBadge,
  getModalidadeBadge,
  getNivelBadge,
} from "../utils/empregosUtils";

interface VagaCardProps {
  vaga: Vaga;
  isAdmin: boolean;
  onEditar: (vaga: Vaga) => void;
  onExcluir: (id: string) => void;
  onCandidatar: (vaga: Vaga) => void;
  onVerDetalhes: (vaga: Vaga) => void;
}

// ============================================================================
// COMPONENTE DE DESIGN - APENAS UI
// ============================================================================

export function VagaCard({
  vaga,
  isAdmin,
  onEditar,
  onExcluir,
  onCandidatar,
  onVerDetalhes,
}: VagaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition"
              onClick={() => onVerDetalhes(vaga)}
            >
              {vaga.titulo}
            </h3>
            <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${getStatusVagaCor(vaga.status)}`}>
              {getStatusVagaLabel(vaga.status)}
            </span>
          </div>

          <p className="text-gray-600 font-medium">{vaga.empresa}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`text-sm px-2 py-0.5 rounded-full ${getTipoVagaBadge(vaga.tipo)}`}>
              {vaga.tipo}
            </span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${getModalidadeBadge(vaga.modalidade)}`}>
              {vaga.modalidade}
            </span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${getNivelBadge(vaga.nivel)}`}>
              {vaga.nivel}
            </span>
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {vaga.descricao}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {vaga.localizacao}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatarSalario(vaga.salarioMin, vaga.salarioMax)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {vaga.candidatos || 0} candidatos
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatarDataRelativa(vaga.dataPublicacao)}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {isAdmin ? (
            <>
              <button
                onClick={() => onEditar(vaga)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => onExcluir(vaga.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onVerDetalhes(vaga)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
              >
                Ver Detalhes
              </button>
              {vaga.status === "aberta" && (
                <button
                  onClick={() => onCandidatar(vaga)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  Candidatar-se
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

