"use client";

// Caminho: C:\valente_conecta\app\planos\checkout\page.tsx
// Confirma a forma de pagamento do plano escolhido em /planos. Fiado nao
// cobra nada aqui (fica pendente pro admin master aprovar manualmente); pix
// e cartao mandam pro checkout real do Mercado Pago.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, QrCode, CreditCard, HandCoins, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

type Metodo = "pix" | "cartao" | "fiado";

export default function PlanoCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const servico = searchParams?.get("servico") || "";
  const servicoNome = searchParams?.get("servicoNome") || "";
  const plano = searchParams?.get("plano") || "";
  const planoNome = searchParams?.get("planoNome") || "";
  const valorBase = Number(searchParams?.get("valor") || 0);

  const [usuario, setUsuario] = useState<any>(null);
  const [addonFiado, setAddonFiado] = useState<{ disponivel: boolean; precoAdicional: number; descricao: string } | null>(null);
  const [incluirFiado, setIncluirFiado] = useState(false);
  const [metodo, setMetodo] = useState<Metodo>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [processando, setProcessando] = useState(false);
  const [aguardandoPagamento, setAguardandoPagamento] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    setUsuario(getCurrentUser());
    fetch("/api/planos-config")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const svc = (res.data.services || []).find((s: any) => s.id === servico);
          if (svc?.addonFiado) setAddonFiado(svc.addonFiado);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valorTotal = valorBase + (incluirFiado && addonFiado ? addonFiado.precoAdicional : 0);

  const confirmar = async () => {
    if (!usuario) {
      toast.error("Faça seu cadastro primeiro");
      return;
    }
    setProcessando(true);
    try {
      const resp = await fetch("/api/planos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          usuarioLocalId: obterUsuarioLocalId(),
          nomeUsuario: usuario.nome,
          servicoId: servico,
          servicoNome,
          planoId: plano,
          planoNome,
          comFiado: incluirFiado,
          valor: valorTotal,
          metodoPagamento: metodo,
          parcelas,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (!resultado.precisaPagamento) {
        if (resultado.data.status === "pago") {
          toast.success("Plano confirmado! Só falta completar os dados.");
          router.push(`/planos/dados?id=${resultado.data.id}`);
        } else {
          toast.success("Pedido registrado! O suporte vai combinar o pagamento fiado com você.");
          router.push("/chat");
        }
        return;
      }

      window.open(resultado.checkoutUrl, "_blank");
      setAguardandoPagamento(resultado.data.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar plano");
    } finally {
      setProcessando(false);
    }
  };

  const verificarPagamento = async () => {
    if (!aguardandoPagamento) return;
    setVerificando(true);
    try {
      const resp = await fetch(`/api/planos/assinatura/${aguardandoPagamento}`);
      const resultado = await resp.json();
      if (resultado.success && resultado.data.status === "pago") {
        toast.success("Pagamento confirmado!");
        router.push(`/planos/dados?id=${aguardandoPagamento}`);
      } else {
        toast("Ainda não identificamos o pagamento. Se já pagou, aguarde alguns segundos e tente de novo.");
      }
    } finally {
      setVerificando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="mb-4">Complete seu cadastro pra escolher um plano.</p>
          <button onClick={() => router.push("/")} className="text-cyan-400 underline text-sm">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (aguardandoPagamento) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-cyan-400" />
          <h2 className="font-bold text-lg mb-2">Aguardando pagamento</h2>
          <p className="text-sm text-slate-400 mb-6">
            Abrimos o checkout do Mercado Pago em outra aba. Depois de pagar, volte aqui e toque no botão abaixo.
          </p>
          <button
            onClick={verificarPagamento}
            disabled={verificando}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg font-medium"
          >
            {verificando ? "Verificando..." : "Já paguei, verificar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10">
      <header className="bg-gradient-to-r from-blue-700 to-cyan-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">Confirmar plano</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400">{servicoNome}</p>
          <p className="font-bold text-lg">{planoNome}</p>
          <p className="text-cyan-400 font-semibold mt-1">R$ {valorBase.toFixed(2)}/mês</p>
        </div>

        {addonFiado?.disponivel && (
          <label className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={incluirFiado} onChange={(e) => setIncluirFiado(e.target.checked)} className="mt-1" />
            <div>
              <p className="text-sm font-medium">Incluir módulo de fiado (+ R$ {addonFiado.precoAdicional.toFixed(2)}/mês)</p>
              <p className="text-xs text-slate-400 mt-0.5">{addonFiado.descricao}</p>
            </div>
          </label>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Forma de pagamento</p>
          <div className="space-y-2">
            <button
              onClick={() => setMetodo("pix")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${metodo === "pix" ? "border-cyan-400 bg-cyan-950/30" : "border-slate-700"}`}
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium">Pix à vista</p>
                <p className="text-xs text-slate-400">Confirmação imediata</p>
              </div>
            </button>
            <button
              onClick={() => setMetodo("cartao")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${metodo === "cartao" ? "border-cyan-400 bg-cyan-950/30" : "border-slate-700"}`}
            >
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium">Cartão de débito/crédito</p>
                <p className="text-xs text-slate-400">Parcelamento disponível no crédito</p>
              </div>
            </button>
            {metodo === "cartao" && (
              <select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x de R$ {(valorTotal / n).toFixed(2)}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setMetodo("fiado")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${metodo === "fiado" ? "border-cyan-400 bg-cyan-950/30" : "border-slate-700"}`}
            >
              <HandCoins className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium">Fiado</p>
                <p className="text-xs text-slate-400">O suporte combina o pagamento com você pelo chat</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-slate-300">Total</span>
          <span className="font-bold text-lg text-cyan-400">R$ {valorTotal.toFixed(2)}/mês</span>
        </div>

        <button
          onClick={confirmar}
          disabled={processando}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-xl font-bold"
        >
          {processando ? "Processando..." : "Confirmar"}
        </button>
      </main>
    </div>
  );
}
