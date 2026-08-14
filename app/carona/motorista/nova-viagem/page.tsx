"use client";

// Caminho: C:\valente_conecta\app\carona\motorista\nova-viagem\page.tsx
//
// Motorista anuncia uma viagem — fica "aguardando_pagamento" ate a taxa de
// exibicao ser confirmada (checkout Mercado Pago), so' entao aparece na
// vitrine pra todo mundo (ver app/api/carona/viagens/route.ts).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Car, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function NovaViagemCaronaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [motorista, setMotorista] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [taxa, setTaxa] = useState(0);

  const [cidadeOrigem, setCidadeOrigem] = useState("");
  const [cidadeDestino, setCidadeDestino] = useState("");
  const [dataViagem, setDataViagem] = useState("");
  const [horarioSaida, setHorarioSaida] = useState("");
  const [vagas, setVagas] = useState(1);
  const [precoSugerido, setPrecoSugerido] = useState<number | "">("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (!u) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/carona/motoristas?usuarioId=${u.id}`).then((r) => r.json()),
      fetch("/api/admin-master/carona/config").then((r) => r.json()),
    ])
      .then(([motoristaRes, configRes]) => {
        setMotorista(motoristaRes.success ? motoristaRes.data : null);
        setTaxa(configRes.success ? Number(configRes.data.taxaMotorista || 0) : 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const anunciar = async () => {
    if (!cidadeOrigem.trim() || !cidadeDestino.trim() || !dataViagem || vagas <= 0) {
      toast.error("Preencha origem, destino, data e vagas disponíveis.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/carona/viagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motoristaId: motorista.id,
          nomeMotorista: motorista.nome,
          cidadeOrigem: cidadeOrigem.trim(),
          cidadeDestino: cidadeDestino.trim(),
          dataViagem,
          horarioSaida: horarioSaida || null,
          vagasDisponiveis: vagas,
          precoSugeridoVaga: precoSugerido === "" ? null : precoSugerido,
          observacoes: observacoes.trim() || null,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.precisaPagamento && resultado.checkoutUrl) {
        toast.success("Viagem registrada! Falta só pagar a taxa de exibição.");
        window.location.href = resultado.checkoutUrl;
      } else {
        toast.success("Viagem publicada!");
        router.push("/carona");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao anunciar viagem");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" /></div>;
  }

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-500">Complete seu cadastro no app primeiro.</div>;
  }

  if (!motorista) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-gray-600">Você ainda não é motorista cadastrado na Carona Solidária.</p>
        <button onClick={() => router.push("/carona/motorista/cadastro")} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold">Cadastrar agora</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center gap-2 text-white">
          <Car size={18} />
          <h1 className="font-bold text-lg">Anunciar viagem</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={cidadeOrigem} onChange={(e) => setCidadeOrigem(e.target.value)} placeholder="Cidade de origem" className="w-full pl-9 pr-3 py-2 border rounded-lg" />
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={cidadeDestino} onChange={(e) => setCidadeDestino(e.target.value)} placeholder="Cidade de destino" className="w-full pl-9 pr-3 py-2 border rounded-lg" />
            </div>
            <input type="date" value={dataViagem} onChange={(e) => setDataViagem(e.target.value)} className="border rounded-lg px-3 py-2" />
            <input type="time" value={horarioSaida} onChange={(e) => setHorarioSaida(e.target.value)} className="border rounded-lg px-3 py-2" />
            <input type="number" min={1} value={vagas} onChange={(e) => setVagas(parseInt(e.target.value, 10) || 1)} placeholder="Vagas disponíveis" className="border rounded-lg px-3 py-2" />
            <input type="number" step="0.01" value={precoSugerido} onChange={(e) => setPrecoSugerido(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Valor sugerido por vaga (opcional)" className="border rounded-lg px-3 py-2" />
          </div>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações (opcional)" rows={2} className="w-full border rounded-lg px-3 py-2" />

          <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-orange-800 text-xs">
            {taxa > 0
              ? `Pra sua viagem aparecer na vitrine, tem uma taxa de R$ ${taxa.toFixed(2)} — depois de anunciar você vai pra tela de pagamento.`
              : "Sem taxa de exibição no momento."}
          </div>

          <button onClick={anunciar} disabled={enviando} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-60">
            {enviando ? "Enviando..." : taxa > 0 ? "Anunciar e pagar taxa" : "Anunciar viagem"}
          </button>
        </div>
      </main>
    </div>
  );
}
