// app/empregos/components/EmpregosFiltros.tsx

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { FiltrosVaga, TipoVaga, Modalidade, NivelExperiencia, StatusVaga } from "../types";

interface EmpregosFiltrosProps {
  filtros: FiltrosVaga;
  onAplicarFiltros: (filtros: Partial<FiltrosVaga>) => void;
  onLimparFiltros: () => void;
}

// ============================================================================
// COMPONENTE DE DESIGN - APENAS UI
// ============================================================================

export function EmpregosFiltros({ filtros, onAplicarFiltros, onLimparFiltros }: EmpregosFiltrosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosLocais, setFiltrosLocais] = useState<Partial<FiltrosVaga>>(filtros);

  const handleAplicar = () => {
    onAplicarFiltros(filtrosLocais);
    setMostrarFiltros(false);
  };

  const handleLimpar = () => {
    setFiltrosLocais({});
    onLimparFiltros();
    setMostrarFiltros(false);
  };

  const handleChange = <K extends keyof FiltrosVaga>(key: K, value: FiltrosVaga[K]) => {
    setFiltrosLocais(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Busca */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtrosLocais.busca || ""}
            onChange={(e) => handleChange("busca", e.target.value)}
            placeholder="Buscar vagas, empresas..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAplicar()}
          />
        </div>

        {/* Botão Filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${
            mostrarFiltros
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {Object.keys(filtros).length > 0 && (
            <span className="ml-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {Object.keys(filtros).length}
            </span>
          )}
        </button>

        {Object.keys(filtros).length > 0 && (
          <button
            onClick={handleLimpar}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Painel de Filtros Expandido */}
      {mostrarFiltros && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select
                value={filtrosLocais.tipo || ""}
                onChange={(e) => handleChange("tipo", e.target.value as TipoVaga || undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Estágio">Estágio</option>
                <option value="Temporário">Temporário</option>
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Modalidade</label>
              <select
                value={filtrosLocais.modalidade || ""}
                onChange={(e) => handleChange("modalidade", e.target.value as Modalidade || undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todas</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nível</label>
              <select
                value={filtrosLocais.nivel || ""}
                onChange={(e) => handleChange("nivel", e.target.value as NivelExperiencia || undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="Estagiário">Estagiário</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filtrosLocais.status || ""}
                onChange={(e) => handleChange("status", e.target.value as StatusVaga || undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos</option>
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="fechada">Fechada</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAplicar}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimpar}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
            >
              Limpar Todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

