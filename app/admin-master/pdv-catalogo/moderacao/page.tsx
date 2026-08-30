"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv-catalogo\moderacao\page.tsx
//
// Fila de comprovantes (foto do código de barras) de produtos novos do
// catálogo colaborativo do PDV (086_catalogo_colaborativo_bonus_moderacao.sql)
// pendentes de revisão. Aprovar libera o bônus em Moeda Conecta do
// fornecedor (a RPC cuida do lote/idempotência); recusar pede motivo — o
// fornecedor pode reenviar uma foto nova pro mesmo produto depois.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface ItemModeracao {
  id: string;
  nome_produto: string;
  ean: string | null;
  sku: string;
  cidade: string;
  tipo_identificador: "ean" | "sku_sem_ean";
  foto_codigo_barras_signed_url: string | null;
  foto_produto_url: string | null;
  created_at: string;
}

export default function PdvCatalogoModeracaoPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [lista, setLista] = useState<ItemModeracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [motivoPorId, setMotivoPorId] = useState<Record<string, string>>({});

  const carregar = () => {
    setLoading(true);
    fetch("/api/admin-master/pdv-catalogo-moderacao?status=pendente")
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setAdmin(getCurrentUser());
    carregar();
  }, []);

  const processar = async (id: string, acao: "aprovar" | "recusar") => {
    setProcessando(id);
    try {
      const resp = await fetch(`/api/admin-master/pdv-catalogo-moderacao?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, adminId: admin?.id, motivo: motivoPorId[id] || undefined }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Aprovado — bônus processado!" : "Recusado");
      setLista((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-blue-600" /> Moderação — Catálogo Colaborativo
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Comprovante (foto do código de barras) de produto novo cadastrado por fornecedor. Aprovar libera o bônus em Moeda Conecta dele.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum comprovante pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4">
              <div className="flex gap-3 mb-3">
                {item.foto_codigo_barras_signed_url && (
                  <img src={item.foto_codigo_barras_signed_url} alt="Comprovante" className="w-24 h-24 object-cover rounded-lg border" />
                )}
                {item.foto_produto_url && (
                  <img src={item.foto_produto_url} alt="Produto" className="w-24 h-24 object-cover rounded-lg border" />
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {item.cidade} · {item.tipo_identificador === "ean" ? `EAN ${item.ean}` : `SKU ${item.sku} (sem EAN)`}
              </p>
              <p className="font-medium text-sm mb-3">{item.nome_produto}</p>
              <input
                value={motivoPorId[item.id] || ""}
                onChange={(e) => setMotivoPorId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Motivo da recusa (opcional se aprovar)"
                className="w-full mb-3 px-3 py-1.5 border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => processar(item.id, "aprovar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(item.id, "recusar")}
                  disabled={processando === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
