"use client";

// Caminho: C:\valente_conecta\app\plano-geral\page.tsx
//
// Tela do usuario pra ver e assinar o Plano Geral (055_plano_geral.sql) —
// nao confundir com /planos, que e' o plano de FORNECEDOR pra destaque no
// catalogo. Aqui e' o plano do consumidor: limite mensal de uso em Carona
// Solidaria, Fila de Hospital, Moto Táxi/Encomendas, Água e Gás, Academia,
// mais busca no Google (limite diario).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface TierConfig {
  tier: string;
  nome: string;
  preco: number;
  limites: Record<string, number | null>;
}

interface StatusServico {
  servico: string;
  periodo: string;
  limite: number | null;
  usado: number;
  restante: number | null;
}

const SERVICO_LABEL: Record<string, string> = {
  carona_desbloqueio: "Desbloqueios na Carona Solidária",
  fila_hospital: "Entradas em fila de hospital/clínica",
  mototaxi: "Corridas e encomendas no Moto Táxi",
  agua_gas: "Pedidos de Água e Gás",
  academia: "Check-ins na academia",
  busca_google: "Buscas no Google (por dia)",
};

export default function PlanoGeralPage() {
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [meuTier, setMeuTier] = useState("gratis");
  const [servicos, setServicos] = useState<StatusServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [assinando, setAssinando] = useState("");

  const usuarioId = getCurrentUser()?.id || obterUsuarioLocalId();

  const carregar = () => {
    Promise.all([
      fetch("/api/plano-geral/config").then((r) => r.json()),
      fetch(`/api/plano-geral/status?usuarioId=${usuarioId}`).then((r) => r.json()),
    ]).then(([configRes, statusRes]) => {
      if (configRes.success) setTiers(configRes.data.tiers);
      if (statusRes.success) {
        setMeuTier(statusRes.data.tier);
        setServicos(statusRes.data.servicos);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const assinar = async (tier: string) => {
    setAssinando(tier);
    try {
      const perfil = getCurrentUser();
      if (!perfil) {
        toast.error("Complete seu cadastro no app primeiro (nome e WhatsApp).");
        return;
      }
      const resp = await fetch("/api/plano-geral/assinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: perfil.id, tier, nomeUsuario: perfil.nome }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      window.location.href = resultado.checkoutUrl;
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar assinatura");
    } finally {
      setAssinando("");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-600 px-4 py-10 text-white text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Plano Valente Conecta</h1>
        <p className="text-blue-100 mt-1 max-w-md mx-auto text-sm">
          Mais usos por mês em Carona Solidária, Fila de Hospital, Moto Táxi, Água e Gás, Academia e buscas no Google.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const souEu = meuTier === t.tier;
            return (
              <div key={t.tier} className={`bg-white rounded-2xl shadow p-5 border-2 ${souEu ? "border-blue-500" : "border-transparent"}`}>
                {souEu && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">SEU PLANO ATUAL</span>}
                <h2 className="text-lg font-bold text-gray-800 mt-1">{t.nome}</h2>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {t.preco > 0 ? `R$ ${t.preco.toFixed(2)}` : "Grátis"}
                  {t.preco > 0 && <span className="text-sm font-normal text-gray-400">/mês</span>}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {Object.entries(SERVICO_LABEL).map(([servico, label]) => {
                    const limite = t.limites[servico];
                    return (
                      <li key={servico} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>
                          {limite === null || limite === undefined ? "Ilimitado" : `${limite}${servico === "busca_google" ? "/dia" : "/mês"}`} — {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {t.tier === "gratis" ? (
                  <div className="mt-5 text-center text-xs text-gray-400 py-2.5">Nível de entrada</div>
                ) : (
                  <button
                    onClick={() => assinar(t.tier)}
                    disabled={!!assinando || souEu}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold"
                  >
                    {assinando === t.tier ? "Abrindo pagamento..." : souEu ? "Plano ativo" : "Assinar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {servicos.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5 mt-6">
            <h3 className="font-bold text-gray-800 mb-3">Seu uso neste período</h3>
            <div className="space-y-2">
              {servicos.map((s) => (
                <div key={s.servico} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{SERVICO_LABEL[s.servico] || s.servico}</span>
                  <span className="font-medium text-gray-800">
                    {s.limite === null ? `${s.usado} (ilimitado)` : `${s.usado} de ${s.limite}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
