"use client";

// Caminho: C:\valente_conecta\app\cozinha\pedido\[id]\page.tsx
//
// Tela do cliente pra acompanhar o pedido, sem precisar de login -- o UUID
// do pedido na URL funciona como token implicito (mesmo padrao ja usado e
// funcionando em app/agua-gas/pedido/[id]/page.tsx). Polling a cada 7s em
// GET /api/cozinha/pedidos?id=..., que ja devolve o pedido com a entrega
// sincronizada (moto-taxi ou entregador proprio).

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2, Package, Star, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PASSOS_ENTREGA = [
  { chave: "confirmado", label: "Confirmado" },
  { chave: "em_producao", label: "Em produção" },
  { chave: "saiu_para_entrega", label: "Saiu para entrega" },
  { chave: "entregue", label: "Entregue" },
];
const PASSOS_RETIRADA = [
  { chave: "confirmado", label: "Confirmado" },
  { chave: "em_producao", label: "Em produção" },
  { chave: "pronto_para_retirada", label: "Pronto pra retirada" },
  { chave: "entregue", label: "Entregue" },
];

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function formatarHora(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function buildEntregaMapHtml(origem: { lat: number; lng: number; label: string } | null, ponto: { lat: number; lng: number; label: string }) {
  const payload = { origem, ponto };
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>html, body, #map { height: 100%; margin: 0; }</style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${JSON.stringify(payload)};
      const map = L.map('map', { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      const bounds = [];
      const ponto = [data.ponto.lat, data.ponto.lng];
      bounds.push(ponto);
      L.circleMarker(ponto, { radius: 8, color: '#065f46', fillColor: '#10b981', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip(data.ponto.label, { permanent: true, direction: 'top' });
      if (data.origem) {
        const origem = [data.origem.lat, data.origem.lng];
        bounds.push(origem);
        L.circleMarker(origem, { radius: 7, color: '#c2410c', fillColor: '#fb923c', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip(data.origem.label, { permanent: true, direction: 'top' });
      }
      map.setView(ponto, 15);
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [32, 32] });
    </script>
  </body>
</html>`;
}

export default function PedidoCozinhaPage() {
  const params = useParams();
  const router = useRouter();
  const pedidoId = String(params?.id || "");
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [nomeRecebimento, setNomeRecebimento] = useState("");

  useEffect(() => {
    if (!pedidoId) return;
    let cancelado = false;
    const carregar = async () => {
      try {
        const resp = await fetch(`/api/cozinha/pedidos?id=${pedidoId}`);
        const resultado = await resp.json();
        if (!cancelado && resultado.success) setPedido(resultado.data);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    carregar();
    const intervalo = setInterval(carregar, 7000);
    return () => { cancelado = true; clearInterval(intervalo); };
  }, [pedidoId]);

  const passos = pedido?.tipo_entrega === "entrega" ? PASSOS_ENTREGA : PASSOS_RETIRADA;
  const indiceAtual = passos.findIndex((p) => p.chave === pedido?.status);

  const mapaHtml = useMemo(() => {
    if (!pedido?.entrega) return "";
    const { entrega, motorista, entregadorProprio } = pedido;
    if (entrega.tipo_entregador === "mototaxi_pool" && motorista?.latitude && motorista?.longitude) {
      return buildEntregaMapHtml(null, { lat: motorista.latitude, lng: motorista.longitude, label: motorista.nome || "Entregador" });
    }
    if (entrega.tipo_entregador === "proprio" && entregadorProprio?.latitude && entregadorProprio?.longitude) {
      return buildEntregaMapHtml(null, { lat: entregadorProprio.latitude, lng: entregadorProprio.longitude, label: entregadorProprio.nome || "Entregador" });
    }
    return "";
  }, [pedido]);

  const confirmarRecebimento = async () => {
    if (!nomeRecebimento.trim()) {
      toast.error("Informe quem recebeu o pedido");
      return;
    }
    setConfirmando(true);
    try {
      const resp = await fetch(`/api/cozinha/pedidos?id=${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoStatus: "entregue", recebidoPor: nomeRecebimento.trim() }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      setPedido((prev: any) => ({ ...prev, ...resp.data }));
      toast.success("Recebimento confirmado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar");
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>;
  }
  if (!pedido) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">Pedido não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <Toaster position="top-center" />
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">Pedido #{String(pedido.id).slice(0, 8)}</h1>
            <p className="text-gray-500 text-sm">{formatarMoeda(Number(pedido.total))}</p>
          </div>
        </div>

        {pedido.status === "cancelado" ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-2 mb-5">
            <XCircle className="w-5 h-5" /> Pedido cancelado.
          </div>
        ) : indiceAtual < 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 mb-5 text-sm">
            {pedido.forma_pagamento === "mercado_pago" ? "Aguardando confirmação do pagamento..." : "Aguardando a cozinha confirmar seu pedido..."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-4 mb-5 space-y-3">
            {passos.map((passo, i) => {
              const concluido = i <= indiceAtual;
              return (
                <div key={passo.chave} className="flex items-center gap-3">
                  {concluido ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                  <span className={`text-sm ${concluido ? "text-gray-800 font-medium" : "text-gray-400"}`}>{passo.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {pedido.status === "saiu_para_entrega" && (
          <div className="bg-white rounded-2xl border p-4 mb-5">
            {mapaHtml ? (
              <iframe title="rastreio da entrega" className="w-full h-64 rounded-xl border-0" srcDoc={mapaHtml} />
            ) : (
              <p className="text-sm text-gray-500">Aguardando o entregador aceitar e ligar a localização...</p>
            )}
            {pedido.entrega?.tipo_entregador === "mototaxi_pool" && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm text-gray-600">Recebeu seu pedido?</p>
                <input
                  value={nomeRecebimento}
                  onChange={(e) => setNomeRecebimento(e.target.value)}
                  placeholder="Seu nome (quem recebeu)"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={confirmarRecebimento}
                  disabled={confirmando}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
                >
                  {confirmando ? "Confirmando..." : "Confirmar que recebi"}
                </button>
              </div>
            )}
          </div>
        )}

        {pedido.status === "entregue" && (
          <div className="bg-white rounded-2xl border p-4 mb-5 space-y-3">
            <p className="text-sm text-gray-600">Recebido por: <span className="font-medium text-gray-800">{pedido.recebido_por}</span></p>
            {!pedido.jaAvaliado && (
              <button
                onClick={() => router.push(`/cozinha/pedido/${pedidoId}/avaliar`)}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-2.5 rounded-xl font-semibold"
              >
                <Star className="w-4 h-4" /> Avaliar pedido
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border p-4 space-y-1.5 text-sm">
          {(pedido.itens || []).map((item: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span>{item.quantidade}x {item.titulo}</span>
              <span className="text-gray-500">{formatarMoeda(item.subtotal)}</span>
            </div>
          ))}
          {pedido.taxa_entrega > 0 && (
            <div className="flex justify-between text-gray-500"><span>Taxa de entrega</span><span>{formatarMoeda(Number(pedido.taxa_entrega))}</span></div>
          )}
          <div className="flex justify-between font-bold pt-1.5 border-t"><span>Total</span><span>{formatarMoeda(Number(pedido.total))}</span></div>
          {pedido.confirmado_em && <p className="text-xs text-gray-400 pt-2">Confirmado em {formatarHora(pedido.confirmado_em)}</p>}
        </div>
      </div>
    </div>
  );
}
