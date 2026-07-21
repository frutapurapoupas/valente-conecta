// app/admin-master/financeiro-pessoal/transacoes/page.tsx
// Ã°Å¸â€œâ€ž Lista de TransaÃƒÂ§ÃƒÂµes com CRUD completo

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, DollarSign } from 'lucide-react';

// ============================================================
// HOOKS
// ============================================================
import { useFinanceiroPessoal } from '../../cozinha-chef/hooks/useFinanceiroPessoal';

// ============================================================
// UTILS
// ============================================================
import { 
  calcularResumo, 
  filtrarTransacoes,
  categoriasPadrao,
} from '@/utils/financeiroUtils';

// ============================================================
// COMPONENTES UI
// ============================================================
import FiltrosFinanceiro from '@/components/financeiro/FiltrosFinanceiro';
import CardsResumoFinanceiro from '@/components/financeiro/CardsResumoFinanceiro';
import TabelaTransacoes from '@/components/financeiro/TabelaTransacoes';
import ModalTransacao from '@/components/financeiro/ModalTransacao';
import ModalCategoria from '@/components/financeiro/ModalCategoria';

export default function TransacoesPessoaisPage() {
  // Estado do hook
  const { transacoes, loading, carregar, criar, atualizar, excluir } = useFinanceiroPessoal();
  
  // Estado da UI
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [categorias, setCategorias] = useState<string[]>(categoriasPadrao);

  // Filtros e cÃƒÂ¡lculos
  const transacoesFiltradas = filtrarTransacoes(transacoes, filtroPeriodo, filtroTipo);
  const resumo = calcularResumo(transacoesFiltradas);

  // Handlers
  const handleSave = async (data: any) => {
    let result;
    if (editingId) {
      result = await atualizar(editingId, data);
    } else {
      result = await criar(data);
    }
    if (result.success) {
      setShowModal(false);
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleEdit = (transacao: any) => {
    setEditingId(transacao.id);
    setEditingData(transacao);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transaÃƒÂ§ÃƒÂ£o?')) {
      await excluir(id);
    }
  };

  const handleAddCategoria = (nome: string) => {
    setCategorias([...categorias, nome]);
    setShowCategoriaModal(false);
    alert(`Ã¢Å“â€¦ Categoria "${nome}" adicionada!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando transaÃƒÂ§ÃƒÂµes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* CabeÃƒÂ§alho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/financeiro-pessoal" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <DollarSign className="text-green-400" />
              TransaÃƒÂ§ÃƒÂµes Pessoais
            </h1>
            <p className="text-sm text-gray-400">{transacoes.length} transaÃƒÂ§ÃƒÂµes registradas</p>
          </div>
          <div className="flex gap-2">
            {/* Ã¢Å“â€¦ BOTÃƒÆ’O COM FUNÃƒâ€¡ÃƒÆ’O */}
            <button
              onClick={() => {
                setEditingId(null);
                setEditingData(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Plus size={16} /> Nova TransaÃƒÂ§ÃƒÂ£o
            </button>
            <button
              onClick={carregar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosFinanceiro
          filtroPeriodo={filtroPeriodo}
          filtroTipo={filtroTipo}
          totalRegistros={transacoesFiltradas.length}
          onPeriodoChange={setFiltroPeriodo}
          onTipoChange={setFiltroTipo}
        />

        {/* Cards de Resumo */}
        <CardsResumoFinanceiro
          totalReceitas={resumo.totalReceitas}
          totalDespesas={resumo.totalDespesas}
          saldo={resumo.saldo}
          margem={resumo.margem}
        />

        {/* Tabela */}
        <TabelaTransacoes
          transacoes={transacoesFiltradas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal de TransaÃƒÂ§ÃƒÂ£o */}
      <ModalTransacao
        isOpen={showModal}
        editingId={editingId}
        initialData={editingData}
        categorias={categorias}
        onSave={handleSave}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
          setEditingData(null);
        }}
        onAddCategoria={() => setShowCategoriaModal(true)}
      />

      {/* Modal de Categoria */}
      <ModalCategoria
        isOpen={showCategoriaModal}
        categorias={categorias}
        onAdd={handleAddCategoria}
        onClose={() => setShowCategoriaModal(false)}
      />
    </div>
  );
}

