"use client";

// Caminho: C:\valente_conecta\app\agua-gas\taxas\page.tsx
//
// Lista as taxas de uso do pedido expresso de Agua e Gas (cliente ou
// fornecedor) do usuario logado, com botao pra pagar via Mercado Pago. E'
// pra onde o lembrete automatico (push, ver lib/aguaGas/taxaUso.ts) leva
// quando toca na notificacao. Mesmo padrao de app/mototaxi/taxas/page.tsx.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Droplets, CheckCircle2, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface TaxaUso {
  id: string;
  pedido_id: string;
  papel: "cliente" | "fornecedor";
  valor: number;
  status: "pendente" | "pago";
  created_at: string;
  agua_gas_pedidos?: { produto: string; quantidade: number; fornecedor_nome: string; created_at: string } | null;
}

export default function AguaGasTaxasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destaque = searchParams?.get("destaque") || null;

  const [taxas, setTaxas] = useState<TaxaUso[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const usuario = getCurrentUser();
      const usuarioId = usuario?.id || obterUsuarioLocalId();
      const resp = await fetch(`/api/agua-gas/taxas?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json());
      setTaxas(resp.success ? resp.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const pagar = async (taxaId: string) => {
    setPagando(taxaId);
    try {
      const resp = await fetch(`/api/agua-gas/taxas/${taxaId}/pagar`, { method: "POST" }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      if (resp.precisaPagamento && resp.checkoutUrl) {
        window.location.href = resp.checkoutUrl;
        return;
      }
      carregar();
    } catch (err: any) {
      alert(err.message || "Erro ao iniciar pagamento");
    } finally {
      setPagando(null);
    }
  };

  const pendentes = taxas.filter((t) => t.status === "pendente");
  const pagas = taxas.filter((t) => t.status === "pago");

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
        <Droplets className="w-5 h-5 text-blue-600" />
        <h1 className="text-lg font-bold text-gray-800">Taxas de uso — Água e Gás</h1>
      </div>
      <p className="text-sm text-gray-600 mb-5">Taxa cobrada pela plataforma nos pedidos rápidos pagos em dinheiro. Com um plano pago, essa taxa não é cobrada.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : taxas.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma taxa registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendentes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Pendentes</p>
              <div className="space-y-2">
                {pendentes.map((taxa) => (
                  <div
                    key={taxa.id}
                    className={`bg-white border rounded-xl p-4 flex items-center justify-between gap-3 ${taxa.id === destaque ? "ring-2 ring-blue-400" : ""}`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800">
                        {taxa.papel === "cliente" ? "Taxa como cliente" : "Taxa como fornecedor"}
                      </p>
                      {taxa.agua_gas_pedidos && (
                        <p className="text-sm text-gray-600 truncate">
                          {taxa.agua_gas_pedidos.produto} × {taxa.agua_gas_pedidos.quantidade} · {taxa.agua_gas_pedidos.fornecedor_nome}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" /> {new Date(taxa.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 mb-2">R$ {Number(taxa.valor).toFixed(2)}</p>
                      <button
                        onClick={() => pagar(taxa.id)}
                        disabled={pagando === taxa.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
                      >
                        {pagando === taxa.id ? "Abrindo..." : "Pagar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagas.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Pagas</p>
              <div className="space-y-2">
                {pagas.map((taxa) => (
                  <div key={taxa.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3 opacity-70">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-700">
                        {taxa.papel === "cliente" ? "Taxa como cliente" : "Taxa como fornecedor"}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(taxa.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <p className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> R$ {Number(taxa.valor).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
