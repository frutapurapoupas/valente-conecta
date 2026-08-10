// Caminho sugerido: C:\valente_conecta\app\mototaxi\motorista\page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bike, MapPin, Navigation, Power } from "lucide-react";

type Corrida = {
  id: string;
  passageiro_nome: string;
  origem: string;
  destino: string;
  origem_lat: number;
  origem_lng: number;
  destino_lat: number;
  destino_lng: number;
  motorista_lat?: number;
  motorista_lng?: number;
  preco: number;
  status: string;
};

// ATENCAO: enquanto nao existe login, o ID do motorista fica fixo aqui para
// teste. Quando o sistema de login for implementado, substituir por o
// motorista autenticado.
const MOTORISTA_ID_TESTE = "ae4e0ef5-591c-42a6-8d51-d912db1a8223";

export default function MotoristaMotoTaxiPage() {
  const [online, setOnline] = useState(false);
  const [pedidosPendentes, setPedidosPendentes] = useState<Corrida[]>([]);
  const [corridaAtiva, setCorridaAtiva] = useState<Corrida | null>(null);
  const [carregando, setCarregando] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const pollingRef = useRef<any>(null);

  // ============================================================
  // Localização real do motorista (GPS do dispositivo)
  // ============================================================
  const iniciarRastreamento = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocalizacao indisponivel neste dispositivo");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        await fetch("/api/mototaxi", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recurso: "motorista_localizacao",
            motoristaId: MOTORISTA_ID_TESTE,
            latitude,
            longitude,
            corridaId: corridaAtiva?.id || null,
          }),
        }).catch(() => null);
      },
      () => toast.error("Nao foi possivel capturar sua localizacao"),
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 15000 }
    );
  };

  const pararRastreamento = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const alternarOnline = async () => {
    const novoStatus = !online;
    setOnline(novoStatus);

    await fetch("/api/mototaxi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recurso: "motorista",
        id: MOTORISTA_ID_TESTE,
        patch: { online: novoStatus },
      }),
    }).catch(() => null);

    if (novoStatus) {
      iniciarRastreamento();
      toast.success("Voce esta online e pode receber corridas");
    } else {
      pararRastreamento();
      toast("Voce ficou offline");
    }
  };

  // ============================================================
  // Buscar pedidos pendentes (polling simples; pode evoluir para
  // Supabase Realtime subscription no futuro)
  // ============================================================
  const buscarPedidosPendentes = async () => {
    try {
      const res = await fetch("/api/mototaxi?recurso=corridas&status=aguardando_motorista", { cache: "no-store" });
      const data = await res.json();
      setPedidosPendentes(Array.isArray(data?.data) ? data.data : []);
    } catch {
      // silencioso — proxima tentativa de polling corrige
    } finally {
      setCarregando(false);
    }
  };

  const buscarCorridaAtiva = async () => {
    try {
      const res = await fetch(`/api/mototaxi?recurso=corridas&motorista_id=${MOTORISTA_ID_TESTE}`, { cache: "no-store" });
      const data = await res.json();
      const corridas: Corrida[] = Array.isArray(data?.data) ? data.data : [];
      const ativa = corridas.find((c) => c.status === "aceita" || c.status === "em_andamento");
      setCorridaAtiva(ativa || null);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    buscarPedidosPendentes();
    buscarCorridaAtiva();

    pollingRef.current = setInterval(() => {
      if (!corridaAtiva) buscarPedidosPendentes();
      buscarCorridaAtiva();
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pararRastreamento();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aceitarCorrida = async (corrida: Corrida) => {
    try {
      const posicaoAtual = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(null)
        );
      });

      const res = await fetch("/api/mototaxi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurso: "corrida_aceitar",
          corridaId: corrida.id,
          motoristaId: MOTORISTA_ID_TESTE,
          motoristaLat: posicaoAtual?.lat ?? corrida.origem_lat,
          motoristaLng: posicaoAtual?.lng ?? corrida.origem_lng,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Nao foi possivel aceitar — outro motorista pode ter aceitado primeiro.");
        buscarPedidosPendentes();
        return;
      }

      setCorridaAtiva(data.data);
      setPedidosPendentes([]);
      toast.success(`Corrida aceita! Va ate ${corrida.origem}`);
    } catch {
      toast.error("Erro ao aceitar corrida.");
    }
  };

  const iniciarDeslocamento = async () => {
    if (!corridaAtiva) return;
    await fetch("/api/mototaxi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurso: "corrida_status", corridaId: corridaAtiva.id, status: "em_andamento" }),
    });
    setCorridaAtiva({ ...corridaAtiva, status: "em_andamento" });
    toast.success("Corrida iniciada");
  };

  const concluirCorrida = async () => {
    if (!corridaAtiva) return;
    await fetch("/api/mototaxi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurso: "corrida_status", corridaId: corridaAtiva.id, status: "concluida" }),
    });
    toast.success("Corrida concluida");
    setCorridaAtiva(null);
  };

  if (carregando) {
    return <div className="min-h-screen bg-slate-950 text-white p-6">Carregando painel do motorista...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 shadow-lg flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2"><Bike size={18} /> Painel do Motorista</h1>
        <button
          onClick={alternarOnline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${online ? "bg-green-500 text-black" : "bg-slate-800 text-slate-300"}`}
        >
          <Power size={14} /> {online ? "Online" : "Offline"}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {!online && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/40 p-4 text-sm text-slate-300 text-center">
            Fique online para começar a receber pedidos de corrida.
          </div>
        )}

        {online && corridaAtiva && (
          <section className="bg-slate-900 border border-emerald-700 rounded-2xl p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><Navigation size={16} /> Corrida em andamento</h2>
            <p className="text-sm text-slate-300">Passageiro: {corridaAtiva.passageiro_nome}</p>
            <p className="text-sm text-slate-300 flex items-center gap-1"><MapPin size={12} /> Origem: {corridaAtiva.origem}</p>
            <p className="text-sm text-slate-300 flex items-center gap-1"><MapPin size={12} /> Destino: {corridaAtiva.destino}</p>
            <p className="text-green-400 font-bold mt-2">R$ {Number(corridaAtiva.preco).toFixed(2)}</p>

            {corridaAtiva.status === "aceita" && (
              <button onClick={iniciarDeslocamento} className="mt-3 w-full bg-blue-600 py-2.5 rounded-xl font-bold">
                Passageiro embarcou — iniciar corrida
              </button>
            )}
            {corridaAtiva.status === "em_andamento" && (
              <button onClick={concluirCorrida} className="mt-3 w-full bg-green-600 py-2.5 rounded-xl font-bold">
                Concluir corrida
              </button>
            )}
          </section>
        )}

        {online && !corridaAtiva && (
          <section className="space-y-3">
            <h2 className="font-semibold">Pedidos disponíveis</h2>
            {pedidosPendentes.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum pedido no momento. Aguardando...</p>
            )}
            {pedidosPendentes.map((pedido) => (
              <div key={pedido.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <p className="font-semibold text-sm">{pedido.passageiro_nome}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1"><MapPin size={12} /> {pedido.origem} → {pedido.destino}</p>
                <p className="text-green-400 font-bold mt-1">R$ {Number(pedido.preco).toFixed(2)}</p>
                <button
                  onClick={() => aceitarCorrida(pedido)}
                  className="mt-2 w-full bg-green-500 text-black font-bold py-2 rounded-lg text-sm"
                >
                  Aceitar corrida
                </button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
