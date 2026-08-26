"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv\captura-externa\page.tsx
// Quem está no "modo espião" (PDV de terceiro em paralelo) e quantas
// capturas por foto estão pendentes de preenchimento.

import { useEffect, useState } from "react";
import { Eye, Clock } from "lucide-react";

interface Comerciante {
  usuarioId: string;
  nome: string;
  ativadoEm: string;
  capturasPendentes: number;
}

export default function CapturaExternaAdminPage() {
  const [dados, setDados] = useState<{ totalAtivos: number; totalCapturas: number; comerciantes: Comerciante[] } | null>(null);

  useEffect(() => {
    fetch("/api/admin-master/pdv/captura-externa", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setDados(res.data); });
  }, []);

  if (!dados) return <p className="p-6 text-gray-500 text-sm">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" /> Captura Externa (Modo Espião)
        </h1>
        <p className="text-sm text-gray-500">Comerciantes que usam outro PDV em paralelo e alimentam o app por foto.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Ativos</p>
          <p className="text-2xl font-bold text-gray-800">{dados.totalAtivos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Capturas no total</p>
          <p className="text-2xl font-bold text-gray-800">{dados.totalCapturas}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Comerciantes ativos</h3>
        {dados.comerciantes.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Ninguém ativou esse modo ainda.</p>
        ) : (
          <div className="space-y-2">
            {dados.comerciantes.map((c) => (
              <div key={c.usuarioId} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="text-gray-800 font-medium">{c.nome}</p>
                  <p className="text-sm text-gray-500">Ativado em {new Date(c.ativadoEm).toLocaleDateString("pt-BR")}</p>
                </div>
                {c.capturasPendentes > 0 && (
                  <span className="text-sm font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.capturasPendentes} pendente{c.capturasPendentes !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
