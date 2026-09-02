"use client";

// Caminho: C:\valente_conecta\app\pdv\interesses\page.tsx
//
// Lojista vê os interesses recebidos na vitrine pública (catalogo_itens +
// interesses, ver 003_marketplace_interesse.sql) e marca "Concluído" quando
// o negócio foi fechado — dispara a notificação de avaliação pro comprador
// (ver 096_avaliacoes.sql, app/api/catalogo/interesses/[id]/concluir).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";

interface InteresseItem {
  id: string;
  item_titulo: string;
  comprador_nome: string;
  concluido_em: string | null;
  created_at: string;
}

export default function PdvInteressesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);
  const [lista, setLista] = useState<InteresseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [concluindo, setConcluindo] = useState<string | null>(null);

  const carregar = (usuarioId: string) => {
    setLoading(true);
    fetch(`/api/pdv/interesses?usuarioId=${usuarioId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const marcarConcluido = async (id: string) => {
    if (!usuario) return;
    setConcluindo(id);
    try {
      const resp = await fetch(`/api/catalogo/interesses/${id}/concluir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fornecedorId: usuario.id }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success("Marcado como concluído — comprador vai receber um aviso pra avaliar!");
      carregar(usuario.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao concluir");
    } finally {
      setConcluindo(null);
    }
  };

  if (!loading && !usuario) {
    return <div className="max-w-md mx-auto p-6 text-center text-gray-500">Complete seu cadastro no app pra usar essa área.</div>;
  }

  if (operador && !temPermissao(operador, "interesses")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-600" /> Interesses</h1>
      </header>
      <PdvSubNav ativa="interesses" operador={operador} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          Pessoas que demonstraram interesse nos seus itens da vitrine. Marque como concluído depois que fechar o negócio — o comprador recebe um aviso pra avaliar.
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-500 py-8">Carregando...</p>
        ) : lista.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-500">Nenhum interesse recebido ainda.</div>
        ) : (
          <div className="space-y-3">
            {lista.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{item.item_titulo}</p>
                  <p className="text-sm text-gray-500">{item.comprador_nome} · {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                {item.concluido_em ? (
                  <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                  </span>
                ) : (
                  <button
                    onClick={() => marcarConcluido(item.id)}
                    disabled={concluindo === item.id}
                    className="shrink-0 text-xs font-semibold px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg disabled:opacity-60"
                  >
                    {concluindo === item.id ? "..." : "Marcar concluído"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
