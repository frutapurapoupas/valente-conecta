"use client";

// Caminho: C:\valente_conecta\app\agua-gas\pedido\[id]\page.tsx
//
// Tela do cliente pra acompanhar a entrega no mapa. Mesmo padrao visual do
// mapa de corrida do Moto Taxi (Leaflet + OpenStreetMap via iframe srcDoc),
// so' que aqui o "motorista" e' o entregador do agua_gas_entregadores, com
// origem sendo a localizacao do fornecedor (endereco do cliente e' texto
// livre, entao nao da' pra tracar rota exata ate' a porta — mostra so' a
// posicao do entregador se aproximando).

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Package, Clock } from "lucide-react";

interface Entregador {
  id: string; nome: string; telefone: string; latitude: number | null; longitude: number | null;
}
interface Pedido {
  id: string; fornecedorId: string; fornecedorNome: string; produto: string; quantidade: number;
  status: string; endereco: string; entregadorId: string | null; entregador: Entregador | null;
}
interface Fornecedor {
  id: string; nome: string; latitude: number | null; longitude: number | null;
}

function buildDeliveryMapHtml(fornecedor: Fornecedor, entregador: Entregador) {
  const payload = {
    origin: { lat: fornecedor.latitude, lng: fornecedor.longitude, label: fornecedor.nome },
    driver: { lat: entregador.latitude, lng: entregador.longitude, label: entregador.nome },
  };

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
      const driver = [data.driver.lat, data.driver.lng];
      bounds.push(driver);
      L.circleMarker(driver, { radius: 8, color: '#065f46', fillColor: '#10b981', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip(data.driver.label, { permanent: true, direction: 'top' });

      if (data.origin.lat != null && data.origin.lng != null) {
        const origem = [data.origin.lat, data.origin.lng];
        bounds.push(origem);
        L.circleMarker(origem, { radius: 7, color: '#1d4ed8', fillColor: '#60a5fa', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip(data.origin.label, { permanent: true, direction: 'top' });
      }

      map.setView(driver, 15);
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [32, 32] });
    </script>
  </body>
</html>`;
}

export default function PedidoRastreioPage() {
  const params = useParams();
  const pedidoId = String(params?.id || "");

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;
    let cancelado = false;

    const carregar = async () => {
      try {
        const resp = await fetch(`/api/agua-gas?recurso=pedidos&id=${pedidoId}`);
        const resultado = await resp.json();
        if (cancelado) return;
        if (resultado.success) {
          setPedido(resultado.data);
          if (resultado.data.fornecedorId && !fornecedor) {
            const respForn = await fetch(`/api/agua-gas?id=${resultado.data.fornecedorId}`);
            const resultadoForn = await respForn.json();
            if (!cancelado && resultadoForn.success && resultadoForn.data[0]) setFornecedor(resultadoForn.data[0]);
          }
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    carregar();
    const intervalo = setInterval(carregar, 5000);
    return () => { cancelado = true; clearInterval(intervalo); };
  }, [pedidoId]);

  const mapaHtml = useMemo(() => {
    if (!fornecedor || !pedido?.entregador?.latitude || !pedido?.entregador?.longitude) return "";
    return buildDeliveryMapHtml(fornecedor, pedido.entregador);
  }, [fornecedor, pedido]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-400 text-sm">
        Pedido não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-bold">{pedido.produto} × {pedido.quantidade}</h1>
            <p className="text-gray-400 text-sm">{pedido.fornecedorNome}</p>
          </div>
        </div>

        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium mb-4 ${
          pedido.status === "em_entrega" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" :
          pedido.status === "entregue" ? "bg-blue-500/15 text-blue-300 border border-blue-500/30" :
          pedido.status === "cancelado" ? "bg-red-500/15 text-red-300 border border-red-500/30" :
          "bg-amber-500/15 text-amber-300 border border-amber-500/30"
        }`}>
          {pedido.status === "pendente" && "Aguardando o fornecedor confirmar seu pedido..."}
          {pedido.status === "confirmado" && "Pedido confirmado — aguardando saída pra entrega."}
          {pedido.status === "em_entrega" && "A caminho! Acompanhe abaixo."}
          {pedido.status === "entregue" && "Pedido entregue. 🎉"}
          {pedido.status === "cancelado" && "Pedido cancelado."}
        </div>

        {pedido.status === "em_entrega" && pedido.entregador && (
          mapaHtml ? (
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <iframe title="rastreio da entrega" className="w-full h-80" srcDoc={mapaHtml} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm bg-slate-900 rounded-xl p-4">
              <Clock className="w-4 h-4" /> Aguardando o entregador ligar a localização...
            </div>
          )
        )}

        {pedido.entregador && (
          <p className="text-xs text-gray-500 mt-3">Entregador: {pedido.entregador.nome} · {pedido.entregador.telefone}</p>
        )}
        {pedido.endereco && <p className="text-xs text-gray-500 mt-1">Endereço: {pedido.endereco}</p>}
      </div>
    </div>
  );
}
