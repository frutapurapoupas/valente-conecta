"use client";

// Caminho: C:\valente_conecta\app\planos\dados\page.tsx
// Depois que o pagamento (ou fiado aprovado) confirma a assinatura, pede os
// dados do negocio — so' chega aqui com status 'pago', nunca antes.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PlanoDadosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";

  const [assinatura, setAssinatura] = useState<any>(null);
  const [servicoTipo, setServicoTipo] = useState<"comercio" | "servico">("servico");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const [nomeNegocio, setNomeNegocio] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [localizador, setLocalizador] = useState("");
  const [faturamentoBruto, setFaturamentoBruto] = useState("");

  useEffect(() => {
    if (!id) {
      setCarregando(false);
      return;
    }
    Promise.all([
      fetch(`/api/planos/assinatura/${id}`).then((r) => r.json()),
      fetch("/api/planos-config").then((r) => r.json()),
    ])
      .then(([resAssinatura, resConfig]) => {
        if (resAssinatura.success) {
          setAssinatura(resAssinatura.data);
          if (resAssinatura.data.status === "ativo" && resAssinatura.data.dados_complementares) {
            setConcluido(true);
          }
        }
        if (resConfig.success) {
          const svc = (resConfig.data.services || []).find((s: any) => s.id === resAssinatura?.data?.servico_id);
          if (svc) setServicoTipo(svc.tipo);
        }
      })
      .finally(() => setCarregando(false));
  }, [id]);

  const salvar = async () => {
    if (!nomeNegocio.trim() || !endereco.trim() || !localizador.trim()) {
      toast.error("Preencha nome, endereço e localizador");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch(`/api/planos/assinatura/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dadosComplementares: {
            nomeNegocio: nomeNegocio.trim(),
            cnpj: cnpj.trim() || null,
            endereco: endereco.trim(),
            localizador: localizador.trim(),
            faturamentoBruto: faturamentoBruto.trim() || null,
          },
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setConcluido(true);
      toast.success("Plano ativado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar dados");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Carregando...</div>;
  }

  if (!assinatura || !["pago", "ativo"].includes(assinatura.status)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="mb-4">Essa assinatura ainda não está paga.</p>
          <button onClick={() => router.push("/planos")} className="text-cyan-400 underline text-sm">
            Ver planos
          </button>
        </div>
      </div>
    );
  }

  if (concluido) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h2 className="font-bold text-lg mb-2">Plano ativado!</h2>
          <p className="text-sm text-slate-400 mb-6">Seus dados foram salvos e seu plano já está ativo.</p>
          <button onClick={() => router.push("/")} className="text-cyan-400 underline text-sm">
            Voltar pro início
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
        <h1 className="font-bold text-lg">Complete seu cadastro</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <p className="text-sm text-slate-400">
          Pagamento confirmado! Falta só completar os dados do seu negócio pra ativar o plano.
        </p>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            {servicoTipo === "comercio" ? "Nome do estabelecimento" : "Nome que utiliza (apelido ou nome da empresa)"}
          </label>
          <input
            value={nomeNegocio}
            onChange={(e) => setNomeNegocio(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">CNPJ (opcional)</label>
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Endereço</label>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Localizador (link do mapa ou ponto de referência)</label>
          <input
            value={localizador}
            onChange={(e) => setLocalizador(e.target.value)}
            placeholder="Ex: link do Google Maps ou perto de..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {servicoTipo === "comercio" && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Faturamento bruto mensal (opcional)</label>
            <input
              value={faturamentoBruto}
              onChange={(e) => setFaturamentoBruto(e.target.value)}
              placeholder="R$"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-xl font-bold"
        >
          {salvando ? "Salvando..." : "Ativar plano"}
        </button>
      </main>
    </div>
  );
}
