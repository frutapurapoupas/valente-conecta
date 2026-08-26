"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Building2 } from "lucide-react";
import type { Empresa, Plano } from "../hooks/useAcademiaMaster";

const STATUS_ASSINATURA = ["trial", "ativo", "inadimplente", "cancelado"];

export default function EmpresasTab({
  empresas, planos, aprovarEmpresa, definirPlanoEmpresa,
}: {
  empresas: Empresa[];
  planos: Plano[];
  aprovarEmpresa: (id: string, ativa: boolean) => Promise<void>;
  definirPlanoEmpresa: (gymUnitId: string, planoId: string, statusAssinatura?: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const handleToggleAtiva = async (empresa: Empresa) => {
    setBusy(empresa.id);
    try { await aprovarEmpresa(empresa.id, !empresa.ativa); } finally { setBusy(null); }
  };

  const handlePlano = async (empresa: Empresa, planoId: string) => {
    if (!planoId) return;
    setBusy(empresa.id);
    try { await definirPlanoEmpresa(empresa.id, planoId, empresa.status_assinatura === 'trial' ? 'ativo' : undefined); } finally { setBusy(null); }
  };

  const handleStatusAssinatura = async (empresa: Empresa, status: string) => {
    if (!empresa.plano_id) return;
    setBusy(empresa.id);
    try { await definirPlanoEmpresa(empresa.id, empresa.plano_id, status); } finally { setBusy(null); }
  };

  if (empresas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Nenhuma academia cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {empresas.map((empresa) => (
        <div key={empresa.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-800">{empresa.nome}</p>
              <span className={`text-sm px-2 py-0.5 rounded-full ${empresa.ativa ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {empresa.ativa ? "Ativa" : "Aguardando aprovação"}
              </span>
            </div>
            <p className="text-sm text-gray-600">{empresa.cidade} · {empresa.responsavel} · {empresa.contato}</p>
            <p className="text-sm text-gray-500">{empresa.alunos} aluno(s)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={empresa.plano_id || ""}
              onChange={(e) => handlePlano(empresa, e.target.value)}
              disabled={busy === empresa.id}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Sem plano</option>
              {planos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <select
              value={empresa.status_assinatura}
              onChange={(e) => handleStatusAssinatura(empresa, e.target.value)}
              disabled={busy === empresa.id || !empresa.plano_id}
              className="border rounded px-2 py-1 text-sm"
            >
              {STATUS_ASSINATURA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={() => handleToggleAtiva(empresa)}
              disabled={busy === empresa.id}
              className={`text-sm px-3 py-1.5 rounded flex items-center gap-1 text-white ${empresa.ativa ? "bg-red-600" : "bg-green-600"}`}
            >
              {empresa.ativa ? <><XCircle size={13} /> Suspender</> : <><CheckCircle2 size={13} /> Aprovar</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
