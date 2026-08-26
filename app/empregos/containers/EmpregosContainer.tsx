// app/empregos/containers/EmpregosContainer.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

import { useEmpregos } from "../hooks/useEmpregos";
import { Vaga, FiltrosVaga } from "../types";
import { filtrarVagas, calcularEstatisticasVagas } from "../utils/empregosUtils";

import {
  EmpregosHeader,
  EmpregosStats,
  EmpregosFiltros,
  EmpregosList,
  VagaModal,
  CandidaturaModal,
  CurriculoModal,
} from "../components";

// ============================================================================
// CONTAINER - LÃ“GICA PURA
// ============================================================================

export function EmpregosContainer() {
  const router = useRouter();
  const { user } = useApp();
  const [mounted, setMounted] = useState(false);
  // TODO: substituir por checagem real de "sou dono desta vaga" quando o
  // login existir (ver MASTER_SPEC secao 9). Ate la, qualquer visitante pode
  // se declarar empregador — o antigo gate por isAdmin (admin master) deixava
  // essa area impossivel de alcançar, ja que isAdmin nunca fica true sem login.
  const [souEmpregador, setSouEmpregador] = useState(false);

  // ==========================================================================
  // HOOKS DE NEGÃ“CIO
  // ==========================================================================

  const {
    vagas,
    curriculos,
    candidaturas,
    loading,
    filtros,
    vagaSelecionada,
    curriculoAtivo,
    criarVaga,
    atualizarVaga,
    excluirVaga,
    criarCurriculo,
    candidatar,
    aplicarFiltros,
    limparFiltros,
    setVagaSelecionada,
    setCurriculoAtivo,
  } = useEmpregos();

  // ==========================================================================
  // ESTADOS LOCAIS (UI)
  // ==========================================================================

  const [showVagaModal, setShowVagaModal] = useState(false);
  const [showCandidaturaModal, setShowCandidaturaModal] = useState(false);
  const [showCurriculoModal, setShowCurriculoModal] = useState(false);
  const [editandoVaga, setEditandoVaga] = useState<Vaga | null>(null);
  const [vagaParaCandidatar, setVagaParaCandidatar] = useState<Vaga | null>(null);

  // ==========================================================================
  // INICIALIZAÃ‡ÃƒO
  // ==========================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================================================
  // HANDLERS - LÃ“GICA PURA
  // ==========================================================================

  if (!mounted) return null;

  const estatisticas = calcularEstatisticasVagas(vagas);
  const vagasFiltradas = filtrarVagas(vagas, filtros);

  const handleNovaVaga = () => {
    setEditandoVaga(null);
    setShowVagaModal(true);
  };

  const handleEditarVaga = (vaga: Vaga) => {
    setEditandoVaga(vaga);
    setShowVagaModal(true);
  };

  const handleSalvarVaga = async (dados: any) => {
    if (editandoVaga) {
      await atualizarVaga(editandoVaga.id, dados);
    } else {
      await criarVaga(dados);
    }
    setShowVagaModal(false);
    setEditandoVaga(null);
  };

  const handleExcluirVaga = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta vaga?")) {
      await excluirVaga(id);
    }
  };

  const handleCandidatar = (vaga: Vaga) => {
    if (!user) {
      toast.error("Faça login para se candidatar");
      router.push("/login");
      return;
    }
    if (!curriculoAtivo && !curriculos.length) {
      setVagaParaCandidatar(vaga);
      setShowCurriculoModal(true);
      return;
    }
    setVagaParaCandidatar(vaga);
    setShowCandidaturaModal(true);
  };

  const handleConfirmarCandidatura = async (curriculoId?: string) => {
    if (!vagaParaCandidatar) return;
    await candidatar(vagaParaCandidatar.id, curriculoId || curriculoAtivo?.id);
    setShowCandidaturaModal(false);
    setVagaParaCandidatar(null);
  };

  const handleSalvarCurriculo = async (dados: any) => {
    const result = await criarCurriculo(dados);
    if (result) {
      setShowCurriculoModal(false);
      // Se veio de candidatura, abre a candidatura
      if (vagaParaCandidatar) {
        setShowCandidaturaModal(true);
      }
    }
  };

  const handleAplicarFiltros = (novosFiltros: Partial<FiltrosVaga>) => {
    aplicarFiltros(novosFiltros);
  };

  const handleLimparFiltros = () => {
    limparFiltros();
  };

  const handleVerDetalhes = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
  };

  const handleFecharDetalhes = () => {
    setVagaSelecionada(null);
  };

  // ==========================================================================
  // RENDER - APENAS COMPOSIÃ‡ÃƒO DE COMPONENTES
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-1.5 flex justify-end">
        <button
          onClick={() => setSouEmpregador((v) => !v)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          {souEmpregador ? "Voltar para busca de vagas" : "Sou empregador · publicar vaga"}
        </button>
      </div>
      {/* HEADER */}
      <EmpregosHeader
        isAdmin={souEmpregador}
        onNovaVaga={handleNovaVaga}
        onNovoCurriculo={() => setShowCurriculoModal(true)}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATS */}
        <EmpregosStats estatisticas={estatisticas} />

        {/* FILTROS */}
        <EmpregosFiltros
          filtros={filtros}
          onAplicarFiltros={handleAplicarFiltros}
          onLimparFiltros={handleLimparFiltros}
        />

        {/* LISTA DE VAGAS */}
        <EmpregosList
          vagas={vagasFiltradas}
          loading={loading}
          isAdmin={souEmpregador}
          onEditar={handleEditarVaga}
          onExcluir={handleExcluirVaga}
          onCandidatar={handleCandidatar}
          onVerDetalhes={handleVerDetalhes}
        />

        {/* MODAL DE VAGA (Criar/Editar) */}
        {showVagaModal && (
          <VagaModal
            isOpen={showVagaModal}
            vaga={editandoVaga}
            onClose={() => {
              setShowVagaModal(false);
              setEditandoVaga(null);
            }}
            onSave={handleSalvarVaga}
            isAdmin={souEmpregador}
          />
        )}

        {/* MODAL DE CANDIDATURA */}
        {showCandidaturaModal && vagaParaCandidatar && (
          <CandidaturaModal
            isOpen={showCandidaturaModal}
            vaga={vagaParaCandidatar}
            curriculos={curriculos}
            curriculoAtivo={curriculoAtivo}
            onClose={() => {
              setShowCandidaturaModal(false);
              setVagaParaCandidatar(null);
            }}
            onConfirmar={handleConfirmarCandidatura}
          />
        )}

        {/* MODAL DE CURRÍCULO */}
        {showCurriculoModal && (
          <CurriculoModal
            isOpen={showCurriculoModal}
            curriculo={curriculoAtivo}
            onClose={() => {
              setShowCurriculoModal(false);
              setVagaParaCandidatar(null);
            }}
            onSave={handleSalvarCurriculo}
          />
        )}

        {/* MODAL DE DETALHES */}
        {vagaSelecionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{vagaSelecionada.titulo}</h2>
                  <p className="text-gray-600">{vagaSelecionada.empresa}</p>
                </div>
                <button
                  onClick={handleFecharDetalhes}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  âœ•
                </button>
              </div>
              {/* Conteúdo do detalhe */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-sm px-2 py-1 rounded-full ${getTipoVagaBadge(vagaSelecionada.tipo)}`}>
                    {vagaSelecionada.tipo}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${getModalidadeBadge(vagaSelecionada.modalidade)}`}>
                    {vagaSelecionada.modalidade}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded-full ${getNivelBadge(vagaSelecionada.nivel)}`}>
                    {vagaSelecionada.nivel}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{vagaSelecionada.descricao}</p>
                <div>
                  <h4 className="font-semibold mb-2">Requisitos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {vagaSelecionada.requisitos.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Benefícios:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {vagaSelecionada.beneficios.map((beneficio, i) => (
                      <li key={i}>{beneficio}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>ðŸ“ {vagaSelecionada.localizacao}</span>
                  <span>ðŸ’° {formatarSalario(vagaSelecionada.salarioMin, vagaSelecionada.salarioMax)}</span>
                </div>
                {!souEmpregador && (
                  <button
                    onClick={() => {
                      handleFecharDetalhes();
                      handleCandidatar(vagaSelecionada);
                    }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    Candidatar-se
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Importar funções utilitárias para o modal de detalhes
import { formatarSalario, getTipoVagaBadge, getModalidadeBadge, getNivelBadge } from "../utils/empregosUtils";

