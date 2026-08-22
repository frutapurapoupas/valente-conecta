"use client";

// Caminho: C:\valente_conecta\app\agua-gas\entregador\[id]\page.tsx
//
// Pagina que o entregador abre no celular dele (link mandado pelo
// fornecedor, ver AbaEntregadores em app/agua-gas/fornecedor/page.tsx).
// Enquanto ficar aberta com o compartilhamento ligado, atualiza a
// localizacao do entregador a cada poucos segundos via watchPosition —
// mesmo padrao ja usado pelo motorista de Moto Taxi, so' que aqui a
// localizacao fica no proprio registro do entregador (nao por corrida),
// porque um entregador so' faz uma entrega de cada vez na pratica.

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EntregadorRastreioPage() {
  const params = useParams();
  const entregadorId = String(params?.id || "");

  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [compartilhando, setCompartilhando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!entregadorId) return;
    fetch(`/api/agua-gas?recurso=entregadores&id=${entregadorId}`)
      .then((r) => r.json())
      .then((res) => {
        const encontrado = Array.isArray(res.data) ? res.data.find((e: any) => e.id === entregadorId) : null;
        setNome(encontrado?.nome || "");
      })
      .finally(() => setCarregando(false));
  }, [entregadorId]);

  const enviarLocalizacao = async (lat: number, lng: number) => {
    await fetch(`/api/agua-gas?recurso=entregadores&id=${entregadorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    setUltimaAtualizacao(new Date());
  };

  const ligarCompartilhamento = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta localização");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => enviarLocalizacao(pos.coords.latitude, pos.coords.longitude),
      () => toast.error("Não foi possível acessar sua localização"),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    setCompartilhando(true);
    toast.success("Localização ligada — o cliente já pode te acompanhar");
  };

  const desligarCompartilhamento = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setCompartilhando(false);
  };

  useEffect(() => {
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
        <Navigation className="w-8 h-8 text-blue-400" />
      </div>
      <h1 className="text-white text-xl font-bold mb-1">{nome ? `Oi, ${nome}!` : "Rastreio de entrega"}</h1>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">
        Liga o compartilhamento enquanto estiver saindo pra entregar — o cliente vai acompanhar sua localização no mapa em tempo real.
      </p>

      {!compartilhando ? (
        <button
          onClick={ligarCompartilhamento}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
        >
          <MapPin className="w-5 h-5" /> Ligar minha localização
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Compartilhando ao vivo
            {ultimaAtualizacao && <span className="text-emerald-300/70">· atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR')}</span>}
          </div>
          <button
            onClick={desligarCompartilhamento}
            className="w-full px-6 py-2.5 border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/5"
          >
            Desligar
          </button>
        </div>
      )}
    </div>
  );
}
