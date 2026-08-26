"use client";

import { useState } from "react";
import { Plus, Save, X, CreditCard } from "lucide-react";
import type { Plano, Funcionalidade } from "../hooks/useAcademiaMaster";

const NOVO_PLANO_VAZIO = { nome: "", descricao: "", preco_mensal: "0", limite_alunos: "", limite_usuarios_adicionais: "1", ordem_exibicao: "99" };

export default function PlanosTab({
  planos, funcionalidades, criarPlano, atualizarPlano, alternarFuncionalidadePlano,
}: {
  planos: Plano[];
  funcionalidades: Funcionalidade[];
  criarPlano: (payload: any) => Promise<void>;
  atualizarPlano: (id: string, patch: Partial<Plano>) => Promise<void>;
  alternarFuncionalidadePlano: (planoId: string, funcionalidadeId: string, incluida: boolean) => Promise<void>;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState(NOVO_PLANO_VAZIO);
  const [busyToggle, setBusyToggle] = useState<string | null>(null);

  const handleCriar = async () => {
    if (!novo.nome.trim()) return;
    setSalvando(true);
    try {
      await criarPlano({
        nome: novo.nome,
        descricao: novo.descricao || undefined,
        preco_mensal: Number(novo.preco_mensal) || 0,
        limite_alunos: novo.limite_alunos ? Number(novo.limite_alunos) : null,
        limite_usuarios_adicionais: Number(novo.limite_usuarios_adicionais) || 1,
        ordem_exibicao: Number(novo.ordem_exibicao) || 99,
      });
      setNovo(NOVO_PLANO_VAZIO);
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  };

  const isIncluida = (plano: Plano, funcionalidadeId: string) => {
    const pivot = plano.funcionalidades?.find((f) => f.gym_funcionalidades?.id === funcionalidadeId);
    return pivot?.incluida ?? false;
  };

  const handleToggle = async (plano: Plano, funcionalidade: Funcionalidade) => {
    const key = `${plano.id}:${funcionalidade.id}`;
    setBusyToggle(key);
    try {
      await alternarFuncionalidadePlano(plano.id, funcionalidade.id, !isIncluida(plano, funcionalidade.id));
    } finally {
      setBusyToggle(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Planos (gratuito e pagos)</h2>
        <button onClick={() => setMostrarForm((v) => !v)} className="text-sm px-3 py-1.5 rounded bg-slate-800 text-white flex items-center gap-1">
          {mostrarForm ? <X size={13} /> : <Plus size={13} />} {mostrarForm ? "Cancelar" : "Novo plano"}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <input placeholder="Nome do plano *" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <input placeholder="Preço mensal (0 = gratuito)" type="number" step="0.01" value={novo.preco_mensal} onChange={(e) => setNovo({ ...novo, preco_mensal: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <input placeholder="Descrição" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} className="border rounded px-2 py-1.5 text-sm md:col-span-2" />
          <input placeholder="Limite de alunos (vazio = ilimitado)" type="number" value={novo.limite_alunos} onChange={(e) => setNovo({ ...novo, limite_alunos: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <input placeholder="Usuários de equipe inclusos" type="number" value={novo.limite_usuarios_adicionais} onChange={(e) => setNovo({ ...novo, limite_usuarios_adicionais: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <button onClick={handleCriar} disabled={salvando || !novo.nome.trim()} className="md:col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={14} /> {salvando ? "Salvando..." : "Criar plano"}
          </button>
        </div>
      )}

      {planos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum plano cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {planos.map((plano) => (
            <div key={plano.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800">{plano.nome}</h3>
                <span className="text-sm font-semibold text-violet-700">
                  {plano.preco_mensal > 0 ? `R$ ${Number(plano.preco_mensal).toFixed(2)}/mês` : "Grátis"}
                </span>
              </div>
              {plano.descricao && <p className="text-sm text-gray-500 mb-2">{plano.descricao}</p>}
              <p className="text-sm text-gray-500 mb-3">
                {plano.limite_alunos ? `Até ${plano.limite_alunos} alunos` : "Alunos ilimitados"} · {plano.limite_usuarios_adicionais} usuário(s) de equipe
              </p>

              {funcionalidades.length > 0 && (
                <div className="border-t pt-2 space-y-1">
                  {funcionalidades.map((f) => {
                    const key = `${plano.id}:${f.id}`;
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isIncluida(plano, f.id)}
                          disabled={busyToggle === key}
                          onChange={() => handleToggle(plano, f)}
                        />
                        {f.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
