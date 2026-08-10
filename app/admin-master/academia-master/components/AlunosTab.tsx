"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { Aluno, Empresa } from "../hooks/useAcademiaMaster";

export default function AlunosTab({ alunos, empresas }: { alunos: Aluno[]; empresas: Empresa[] }) {
  const [busca, setBusca] = useState("");

  const nomeEmpresa = (id: string | null) => empresas.find((e) => e.id === id)?.nome || "—";

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return alunos;
    return alunos.filter((a) => a.nome.toLowerCase().includes(termo) || (a.email || "").toLowerCase().includes(termo));
  }, [alunos, busca]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar aluno por nome ou e-mail..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">E-mail</th>
                <th className="py-2 pr-3">Academia</th>
                <th className="py-2 pr-3">Plano</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium text-gray-800">{a.nome}</td>
                  <td className="py-2 pr-3 text-gray-600">{a.email || "—"}</td>
                  <td className="py-2 pr-3 text-gray-600">{nomeEmpresa(a.gym_unit_id)}</td>
                  <td className="py-2 pr-3 text-gray-600 capitalize">{a.plano}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
