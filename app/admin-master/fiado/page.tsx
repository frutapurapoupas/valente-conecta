"use client";

// Caminho: C:\valente_conecta\app\admin-master\fiado\page.tsx
// Admin master libera/revoga o módulo Fiado por loja, sob solicitação.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Habilitacao {
  id: string;
  dono_id: string;
  ativo: boolean;
  solicitado_em: string;
  liberado_em: string | null;
}

export default function AdminFiadoPage() {
  const [itens, setItens] = useState<Habilitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    fetch("/api/admin-master/fiado")
      .then((r) => r.json())
      .then((res) => setItens(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const alternar = async (id: string, ativo: boolean) => {
    const resp = await fetch(`/api/admin-master/fiado?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error("Erro ao atualizar");
      return;
    }
    toast.success(ativo ? "Módulo liberado!" : "Módulo revogado.");
    carregar();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-blue-600" /> Módulo Fiado
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Venda a prazo com cobrança automática por notificação. Opcional por loja — libere sob solicitação.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhuma solicitação ainda.</div>
      ) : (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Loja {item.dono_id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">
                  Solicitado em {new Date(item.solicitado_em).toLocaleString("pt-BR")}
                  {item.liberado_em && ` · Liberado em ${new Date(item.liberado_em).toLocaleString("pt-BR")}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {item.ativo ? (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Pendente
                  </span>
                )}
                <button
                  onClick={() => alternar(item.id, !item.ativo)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    item.ativo ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {item.ativo ? "Revogar" : "Liberar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
