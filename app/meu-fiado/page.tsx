"use client";

// Caminho: C:\valente_conecta\app\meu-fiado\page.tsx
//
// Consulta do cliente: o que ele comprou fiado, em qual loja, e quando
// vence — agrupado por loja (ver app/api/fiado/minhas-dividas/route.ts).
// So' aparece loja onde o cliente ja tem fiado_clientes com
// cliente_usuario_id resolvido (acontece quando a loja lanca um debito e
// o telefone bate com um usuario cadastrado).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Calendar, AlertTriangle, CheckCircle2, Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface Divida {
  id: string;
  valor_total: number;
  valor_pago: number;
  data_venda: string;
  data_vencimento: string;
  status: "pendente" | "parcial" | "pago" | "vencido";
  itens: { nome?: string; descricao?: string }[];
  observacoes: string | null;
}

interface LojaFiado {
  clienteId: string;
  donoId: string;
  lojaNome: string;
  limiteCredito: number;
  saldoDevedor: number;
  dividas: Divida[];
}

const STATUS_LABEL: Record<string, { label: string; classe: string }> = {
  pendente: { label: "Em aberto", classe: "bg-amber-100 text-amber-700" },
  parcial: { label: "Pago parcial", classe: "bg-blue-100 text-blue-700" },
  pago: { label: "Quitado", classe: "bg-emerald-100 text-emerald-700" },
  vencido: { label: "Vencido", classe: "bg-red-100 text-red-700" },
};

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function MeuFiadoPage() {
  const router = useRouter();
  const [lojas, setLojas] = useState<LojaFiado[] | null>(null);
  const [lojaAberta, setLojaAberta] = useState<string | null>(null);

  useEffect(() => {
    const usuario = getCurrentUser();
    if (!usuario) {
      router.push("/");
      return;
    }
    fetch(`/api/fiado/minhas-dividas?usuarioId=${usuario.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => setLojas(res.success ? res.data : []));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3 text-white">
          <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-lg flex items-center gap-2"><Receipt className="w-5 h-5" /> Meu Fiado</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3">
        {lojas === null ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : lojas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-400">
            <Store className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Você ainda não tem fiado em nenhuma loja.
          </div>
        ) : (
          lojas.map((loja) => {
            const aberta = lojaAberta === loja.clienteId;
            return (
              <div key={loja.clienteId} className="bg-white rounded-2xl shadow overflow-hidden">
                <button
                  onClick={() => setLojaAberta(aberta ? null : loja.clienteId)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{loja.lojaNome}</p>
                      <p className="text-xs text-gray-400">
                        {loja.dividas.length} compra{loja.dividas.length !== 1 ? "s" : ""} registrada{loja.dividas.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${loja.saldoDevedor > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatarMoeda(loja.saldoDevedor)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {loja.saldoDevedor > 0 ? "em aberto" : "quitado"}
                    </p>
                  </div>
                </button>

                {aberta && (
                  <div className="border-t divide-y">
                    {loja.limiteCredito > 0 && (
                      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
                        Limite de crédito: {formatarMoeda(loja.limiteCredito)}
                      </div>
                    )}
                    {loja.dividas.map((d) => {
                      const saldo = Number(d.valor_total) - Number(d.valor_pago);
                      const status = STATUS_LABEL[d.status] || STATUS_LABEL.pendente;
                      return (
                        <div key={d.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">{formatarMoeda(Number(d.valor_total))}</p>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.classe}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Comprado em {formatarData(d.data_venda)} · vence {formatarData(d.data_vencimento)}
                          </p>
                          {d.itens?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {d.itens.map((i) => i.nome || i.descricao).filter(Boolean).join(", ")}
                            </p>
                          )}
                          {d.status !== "pago" && saldo > 0 && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Saldo devedor: {formatarMoeda(saldo)}
                            </p>
                          )}
                          {d.status === "pago" && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Quitado
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
