// Caminho: C:\valente_conecta\app\mototaxi\page.tsx
// Substitui a versao anterior. Mudanca desta versao: campos de origem e
// destino agora usam o componente CampoEnderecoAutocomplete (sugestoes
// enquanto digita, combinando pontos de referencia locais + Nominatim).
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Bike, CreditCard, Package, ShieldCheck, Star, User, X } from "lucide-react";
import toast from "react-hot-toast";
import CampoEnderecoAutocomplete from "./_components/CampoEnderecoAutocomplete";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

export const dynamic = "force-dynamic";

type CorridaApi = {
  id: string;
  passageiro_id: string | null;
  passageiro_nome: string;
  passageiro_plano: string;
  motorista_id: string | null;
  origem: string;
  destino: string;
  origem_lat: number;
  origem_lng: number;
  destino_lat: number;
  destino_lng: number;
  motorista_lat: number | null;
  motorista_lng: number | null;
  preco: number;
  metodo_pagamento: string;
  status_pagamento: "pendente" | "confirmado";
  status: "aguardando_motorista" | "aceita" | "em_andamento" | "concluida" | "cancelada";
  created_at: string;
};

type MotoristaApi = {
  id: string;
  nome: string;
  foto_url?: string;
  veiculo_foto_url?: string;
  veiculo: string;
  placa: string;
  avaliacao: number;
};

type TipoCorrida = "passageiro" | "encomenda";

type AdsConfig = {
  enabled: boolean;
  show_to_free_passengers_only: boolean;
  popup_title: string;
  popup_message?: string;
  items: Array<{ id: string; titulo: string; mensagem: string; ctaLabel: string; ctaLink: string; ativo?: boolean }>;
};

type Cidade = {
  id: string;
  nome: string;
  estado: string;
  centro_lat: number;
  centro_lng: number;
  raio_km: number;
};

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dx = (aLat - bLat) * 111;
  const dy = (aLng - bLng) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function construirViewbox(cidade: Cidade) {
  const grausPorKm = 1 / 111;
  const delta = cidade.raio_km * grausPorKm;
  const minLng = cidade.centro_lng - delta;
  const maxLng = cidade.centro_lng + delta;
  const minLat = cidade.centro_lat - delta;
  const maxLat = cidade.centro_lat + delta;
  return `${minLng},${maxLat},${maxLng},${minLat}`;
}

async function geocodificarComFallback(texto: string, cidade: Cidade): Promise<{ lat: number; lng: number } | null> {
  // Tentativa 0: ponto de referencia local cadastrado (ex: APAEB, pracas, etc.)
  try {
    const urlPonto = `/api/mototaxi?recurso=ponto_referencia&cidade_id=${cidade.id}&q=${encodeURIComponent(texto)}`;
    const resPonto = await fetch(urlPonto);
    const dataPonto = await resPonto.json();
    if (dataPonto?.data) {
      return { lat: dataPonto.data.latitude, lng: dataPonto.data.longitude };
    }
  } catch {
    // segue para as tentativas com Nominatim
  }

  // Tentativa 1: busca restrita ao raio da cidade (mais segura)
  try {
    const urlRestrita = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&viewbox=${construirViewbox(cidade)}&bounded=1&q=${encodeURIComponent(texto)}`;
    const res = await fetch(urlRestrita);
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
  } catch {
    // segue para a tentativa 2
  }

  // Tentativa 2: busca ampla, mas valida distancia maxima do centro da cidade
  try {
    const urlAmpla = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(texto + ", " + cidade.nome + ", " + cidade.estado)}`;
    const res = await fetch(urlAmpla);
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      const distanciaDoCentro = distanceKm(lat, lng, cidade.centro_lat, cidade.centro_lng);
      if (distanciaDoCentro <= 50) {
        return { lat, lng };
      }
    }
  } catch {
    // sem resultado
  }

  return null;
}

async function calcularDistanciaRotaKm(origemLat: number, origemLng: number, destinoLat: number, destinoLng: number): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destinoLng},${destinoLat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    const metros = data?.routes?.[0]?.distance;
    return typeof metros === "number" ? metros / 1000 : null;
  } catch {
    return null;
  }
}

function buildRideMapHtml(corrida: CorridaApi, motorista: MotoristaApi | null) {
  const temMotorista = corrida.motorista_lat != null && corrida.motorista_lng != null;
  const payload = {
    origin: { lat: corrida.origem_lat, lng: corrida.origem_lng, label: corrida.origem || "Origem" },
    destination: { lat: corrida.destino_lat, lng: corrida.destino_lng, label: corrida.destino || "Destino" },
    driver: temMotorista ? { lat: corrida.motorista_lat, lng: corrida.motorista_lng, label: motorista?.nome || "Motorista" } : null,
    status: corrida.status,
    pagamento: corrida.status_pagamento,
    valor: Number(corrida.preco || 0),
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; }
      .hud { position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(15, 23, 42, 0.9); color: #e2e8f0; border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 10px; padding: 10px; font-family: Arial, sans-serif; font-size: 12px; max-width: 340px; line-height: 1.35; }
      .row { margin-top: 2px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="hud" id="hud"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${JSON.stringify(payload)};
      const map = L.map('map', { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

      const origem = [data.origin.lat, data.origin.lng];
      const destino = [data.destination.lat, data.destination.lng];
      const bounds = [origem, destino];

      L.circleMarker(origem, { radius: 7, color: '#1d4ed8', fillColor: '#60a5fa', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip('Origem', { permanent: true, direction: 'top' });
      L.circleMarker(destino, { radius: 7, color: '#9a3412', fillColor: '#f97316', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip('Destino', { permanent: true, direction: 'top' });

      if (data.driver) {
        const motorista = [data.driver.lat, data.driver.lng];
        bounds.push(motorista);
        L.circleMarker(motorista, { radius: 8, color: '#065f46', fillColor: '#10b981', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip('Motorista', { permanent: true, direction: 'top' });

        // Motorista -> origem (embarque) -> destino, nao so' motorista->destino
        // (achado testando: pulava o ponto de embarque, a rota real do
        // passageiro sempre passa por ali antes de seguir pro destino).
        fetch('https://router.project-osrm.org/route/v1/driving/' + data.driver.lng + ',' + data.driver.lat + ';' + data.origin.lng + ',' + data.origin.lat + ';' + data.destination.lng + ',' + data.destination.lat + '?overview=full&geometries=geojson')
          .then((r) => r.json())
          .then((json) => {
            if (json?.routes?.[0]?.geometry?.coordinates) {
              const coords = json.routes[0].geometry.coordinates.map((p) => [p[1], p[0]]);
              L.polyline(coords, { color: '#22d3ee', weight: 5, opacity: 0.95 }).addTo(map);
            } else {
              L.polyline([motorista, origem, destino], { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 5' }).addTo(map);
            }
          })
          .catch(() => L.polyline([motorista, origem, destino], { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 5' }).addTo(map));
      } else {
        // Ainda sem motorista (aguardando aceitar) -- mesma rota real que a
        // previa ja mostra antes de solicitar, com fallback pra linha reta
        // so' se o OSRM falhar (antes caia direto na linha reta sempre).
        fetch('https://router.project-osrm.org/route/v1/driving/' + data.origin.lng + ',' + data.origin.lat + ';' + data.destination.lng + ',' + data.destination.lat + '?overview=full&geometries=geojson')
          .then((r) => r.json())
          .then((json) => {
            if (json?.routes?.[0]?.geometry?.coordinates) {
              const coords = json.routes[0].geometry.coordinates.map((p) => [p[1], p[0]]);
              L.polyline(coords, { color: '#94a3b8', weight: 4, opacity: 0.8 }).addTo(map);
            } else {
              L.polyline([origem, destino], { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 5' }).addTo(map);
            }
          })
          .catch(() => L.polyline([origem, destino], { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 5' }).addTo(map));
      }

      map.fitBounds(bounds, { padding: [24, 24] });

      const hud = document.getElementById('hud');
      hud.innerHTML = '<div><strong>Status da corrida</strong></div>' +
        '<div class="row">Status: ' + data.status + '</div>' +
        '<div class="row">Pagamento: ' + data.pagamento + ' | Valor: R$ ' + Number(data.valor).toFixed(2) + '</div>' +
        (data.driver ? '' : '<div class="row">Aguardando motorista aceitar...</div>');
    </script>
  </body>
</html>`;
}

function buildPreviewMapHtml(origem: { lat: number; lng: number }, destino: { lat: number; lng: number }) {
  const payload = { origin: origem, destination: destino };

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

      const origem = [data.origin.lat, data.origin.lng];
      const destino = [data.destination.lat, data.destination.lng];

      L.circleMarker(origem, { radius: 7, color: '#1d4ed8', fillColor: '#60a5fa', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip('Origem', { permanent: true, direction: 'top' });
      L.circleMarker(destino, { radius: 7, color: '#9a3412', fillColor: '#f97316', fillOpacity: 0.95, weight: 2 }).addTo(map).bindTooltip('Destino', { permanent: true, direction: 'top' });

      fetch('https://router.project-osrm.org/route/v1/driving/' + data.origin.lng + ',' + data.origin.lat + ';' + data.destination.lng + ',' + data.destination.lat + '?overview=full&geometries=geojson')
        .then((r) => r.json())
        .then((json) => {
          if (json?.routes?.[0]?.geometry?.coordinates) {
            const coords = json.routes[0].geometry.coordinates.map((p) => [p[1], p[0]]);
            L.polyline(coords, { color: '#22d3ee', weight: 5, opacity: 0.95 }).addTo(map);
          }
        })
        .catch(() => null);

      map.fitBounds([origem, destino], { padding: [24, 24] });
    </script>
  </body>
</html>`;
}

function getStoredUserPlan(user: any) {
  const fromContext = String(user?.plan || "").toLowerCase();
  if (fromContext) return fromContext;
  if (typeof window === "undefined") return "gratis";
  try {
    const stored = JSON.parse(localStorage.getItem("valente_user") || "{}");
    return String(stored?.plan || "gratis").toLowerCase();
  } catch {
    return "gratis";
  }
}

export default function MotoTaxiPage() {
  const router = useRouter();
  const { user } = useApp();

  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const [cidadeAtiva, setCidadeAtiva] = useState<Cidade | null>(null);
  const [loading, setLoading] = useState(true);

  const [tipoCorrida, setTipoCorrida] = useState<TipoCorrida | null>(null);
  const [encomendaDescricao, setEncomendaDescricao] = useState("");
  const [destinatarioNome, setDestinatarioNome] = useState("");
  const [destinatarioTelefone, setDestinatarioTelefone] = useState("");

  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationPosition, setDestinationPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [capturandoPosicao, setCapturandoPosicao] = useState(false);
  const [solicitando, setSolicitando] = useState(false);

  const [distanciaRotaKm, setDistanciaRotaKm] = useState<number | null>(null);
  const [calculandoPreco, setCalculandoPreco] = useState(false);

  const [corridaAtiva, setCorridaAtiva] = useState<CorridaApi | null>(null);
  const [motoristaAtivo, setMotoristaAtivo] = useState<MotoristaApi | null>(null);

  const [showAdModal, setShowAdModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "saldo" | "dinheiro">("pix");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const pollingRef = useRef<any>(null);

  const passengerPlan = useMemo(() => getStoredUserPlan(user), [user]);
  const freePassenger = passengerPlan === "gratis" || passengerPlan === "free";

  // Preco = R$6 de bandeirada + R$2,30/km de distancia REAL de rota
  const precoEstimado = useMemo(() => {
    if (distanciaRotaKm === null) return null;
    return Number((6 + distanciaRotaKm * 2.3).toFixed(2));
  }, [distanciaRotaKm]);

  const rideMapHtml = useMemo(() => {
    if (!corridaAtiva) return "";
    return buildRideMapHtml(corridaAtiva, motoristaAtivo);
  }, [corridaAtiva, motoristaAtivo]);

  const previewMapHtml = useMemo(() => {
    if (!userPosition || !destinationPosition) return "";
    return buildPreviewMapHtml(userPosition, destinationPosition);
  }, [userPosition, destinationPosition]);

  const progresso = useMemo(() => {
    if (!corridaAtiva || corridaAtiva.motorista_lat == null || corridaAtiva.motorista_lng == null) return 0;
    const total = distanceKm(corridaAtiva.origem_lat, corridaAtiva.origem_lng, corridaAtiva.destino_lat, corridaAtiva.destino_lng);
    const feito = distanceKm(corridaAtiva.origem_lat, corridaAtiva.origem_lng, corridaAtiva.motorista_lat, corridaAtiva.motorista_lng);
    if (total <= 0.001) return 0;
    return clamp(Math.round((feito / total) * 100), 0, 100);
  }, [corridaAtiva]);

  // ============================================================
  // Carregamento inicial (config de anúncios + cidade ativa)
  // ============================================================
  useEffect(() => {
    (async () => {
      try {
        const [adsRes, cidadesRes] = await Promise.all([
          fetch("/api/mototaxi?recurso=ads", { cache: "no-store" }),
          fetch("/api/mototaxi?recurso=cidades", { cache: "no-store" }),
        ]);
        const adsData = await adsRes.json();
        const cidadesData = await cidadesRes.json();
        setAdsConfig(adsData?.data || null);
        setCidadeAtiva(Array.isArray(cidadesData?.data) ? cidadesData.data[0] || null : null);
      } catch {
        toast.error("Erro ao carregar modulo de moto taxi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================================================
  // Geolocalização do passageiro
  // ============================================================
  const capturarPosicaoAtual = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocalizacao indisponivel neste dispositivo");
      return;
    }
    setCapturandoPosicao(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setUserPosition({ lat, lng });
        setOrigem(`Minha localizacao (${lat}, ${lng})`);
        setCapturandoPosicao(false);
      },
      () => {
        toast.error("Nao foi possivel capturar sua localizacao. Digite a origem manualmente.");
        setCapturandoPosicao(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    capturarPosicaoAtual();
  }, []);

  // ============================================================
  // Fallback: se o usuario digitar e apertar Solicitar sem escolher uma
  // sugestao do autocomplete, tenta geocodificar o texto puro no envio.
  // ============================================================
  const garantirPosicoes = async (): Promise<boolean> => {
    if (!cidadeAtiva) return false;

    if (!userPosition && origem.trim()) {
      const coords = await geocodificarComFallback(origem, cidadeAtiva);
      if (coords) setUserPosition(coords);
      else return false;
    }
    if (!destinationPosition && destino.trim()) {
      const coords = await geocodificarComFallback(destino, cidadeAtiva);
      if (coords) setDestinationPosition(coords);
      else return false;
    }
    return true;
  };

  // ============================================================
  // Calcula distância REAL de rota (OSRM) assim que origem e destino
  // estiverem resolvidos — substitui a linha reta no cálculo do preço.
  // ============================================================
  useEffect(() => {
    if (!userPosition || !destinationPosition) {
      setDistanciaRotaKm(null);
      return;
    }
    setCalculandoPreco(true);
    calcularDistanciaRotaKm(userPosition.lat, userPosition.lng, destinationPosition.lat, destinationPosition.lng)
      .then((km) => {
        if (km !== null) {
          setDistanciaRotaKm(km);
        } else {
          const linhaReta = distanceKm(userPosition.lat, userPosition.lng, destinationPosition.lat, destinationPosition.lng);
          setDistanciaRotaKm(Number((linhaReta * 1.3).toFixed(2)));
          toast("Nao foi possivel calcular a rota exata — usando estimativa aproximada.");
        }
      })
      .finally(() => setCalculandoPreco(false));
  }, [userPosition, destinationPosition]);

  // ============================================================
  // Polling da corrida ativa — detecta quando um motorista aceita
  // ============================================================
  useEffect(() => {
    if (!corridaAtiva) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mototaxi?recurso=corridas&corrida_id=${corridaAtiva.id}`, { cache: "no-store" });
        const data = await res.json();
        const atualizada: CorridaApi | undefined = Array.isArray(data?.data) ? data.data[0] : undefined;
        if (!atualizada) return;

        const statusMudouParaAceita = corridaAtiva.status === "aguardando_motorista" && atualizada.status === "aceita";
        setCorridaAtiva(atualizada);

        if (statusMudouParaAceita && atualizada.motorista_id) {
          const resMotorista = await fetch(`/api/mototaxi?recurso=motoristas`, { cache: "no-store" });
          const motoristasData = await resMotorista.json();
          const encontrado = (motoristasData?.data || []).find((m: MotoristaApi) => m.id === atualizada.motorista_id);
          setMotoristaAtivo(encontrado || null);
          toast.success("Motorista encontrado!");

          const shouldShowAd =
            Boolean(adsConfig?.enabled) &&
            (!adsConfig?.show_to_free_passengers_only || freePassenger) &&
            Array.isArray(adsConfig?.items) &&
            adsConfig.items.some((item) => item.ativo !== false);

          if (shouldShowAd) setShowAdModal(true);
          else setShowPaymentModal(true);
        }

        if (atualizada.status === "concluida") {
          toast.success("Corrida concluida com sucesso!");
        }
      } catch {
        // silencioso — proxima tentativa corrige
      }
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [corridaAtiva, adsConfig, freePassenger]);

  const solicitarCorrida = async () => {
    if (!origem || !destino) {
      toast.error("Informe origem e destino");
      return;
    }
    if (tipoCorrida === "encomenda" && (!destinatarioNome.trim() || !encomendaDescricao.trim())) {
      toast.error("Informe o que está sendo enviado e o nome de quem vai receber");
      return;
    }

    setSolicitando(true);
    try {
      const posicoesOk = await garantirPosicoes();
      if (!posicoesOk || !userPosition || !destinationPosition || precoEstimado === null) {
        toast.error("Nao foi possivel localizar origem/destino. Selecione uma sugestao da lista.");
        setSolicitando(false);
        return;
      }

      const perfilReal = getCurrentUser();
      const payload = {
        recurso: "corridas",
        // useApp().user nunca fica preenchido hoje (login real ainda nao
        // existe — ver AppContext.tsx), entao cai pro cadastro simples
        // (lib/auth.ts) e, na falta desse tambem, pro id anonimo do
        // dispositivo — assim o limite do Plano Geral sempre tem alguem pra
        // contar, mesmo sem cadastro completo.
        passageiro_id: user?.id ? String(user.id) : perfilReal?.id || obterUsuarioLocalId(),
        passageiro_nome: user?.nome || perfilReal?.nome || "Passageiro",
        passageiro_plano: passengerPlan,
        cidade_id: cidadeAtiva?.id || null,
        tipo: tipoCorrida || "passageiro",
        encomenda_descricao: tipoCorrida === "encomenda" ? encomendaDescricao : null,
        destinatario_nome: tipoCorrida === "encomenda" ? destinatarioNome : null,
        destinatario_telefone: tipoCorrida === "encomenda" ? destinatarioTelefone : null,
        origem,
        destino,
        origem_lat: userPosition.lat,
        origem_lng: userPosition.lng,
        destino_lat: destinationPosition.lat,
        destino_lng: destinationPosition.lng,
        preco: precoEstimado,
        metodo_pagamento: paymentMethod,
      };

      const res = await fetch("/api/mototaxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data?.success || !data?.data) throw new Error(data?.error || "Nao foi possivel solicitar a corrida");

      setCorridaAtiva(data.data as CorridaApi);
      toast.success("Corrida solicitada! Procurando motorista...");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao solicitar corrida");
    } finally {
      setSolicitando(false);
    }
  };

  const confirmarPagamento = async () => {
    if (!corridaAtiva) return;
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/mototaxi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "corrida_status", corridaId: corridaAtiva.id, statusPagamento: "confirmado" }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Falha ao confirmar pagamento");
      setCorridaAtiva(data.data as CorridaApi);
      setShowPaymentModal(false);
      toast.success("Pagamento confirmado com seguranca");
    } catch (error: any) {
      toast.error(error?.message || "Erro no pagamento");
    } finally {
      setPaymentLoading(false);
    }
  };

  const cancelarBusca = () => {
    setCorridaAtiva(null);
    setMotoristaAtivo(null);
    setTipoCorrida(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-6">Carregando moto taxi...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button onClick={() => router.back()} className="text-white/90 hover:text-white">Voltar</button>
          <h1 className="font-bold text-lg">Moto Taxi {cidadeAtiva ? cidadeAtiva.nome : "Valente"}</h1>
          <button onClick={() => router.push("/mototaxi/motorista")} className="text-xs bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Bike size={13} /> Sou motorista
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {!corridaAtiva && !tipoCorrida && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setTipoCorrida("passageiro")}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl p-6 text-left transition"
            >
              <User className="w-8 h-8 text-cyan-400 mb-3" />
              <p className="font-bold text-lg">Viagem de passageiro</p>
              <p className="text-sm text-slate-400 mt-1">Peça uma moto táxi pra te levar até o destino.</p>
            </button>
            <button
              onClick={() => setTipoCorrida("encomenda")}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl p-6 text-left transition"
            >
              <Package className="w-8 h-8 text-amber-400 mb-3" />
              <p className="font-bold text-lg">Encomenda pequena</p>
              <p className="text-sm text-slate-400 mt-1">Envie um pacote pequeno com entrega rápida.</p>
            </button>
          </section>
        )}

        {!corridaAtiva && tipoCorrida && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{tipoCorrida === "encomenda" ? "Enviar encomenda" : "Solicitar corrida"}</h2>
              <button onClick={() => setTipoCorrida(null)} className="text-xs text-slate-400 hover:text-white">Trocar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CampoEnderecoAutocomplete
                placeholder={tipoCorrida === "encomenda" ? "Onde retirar" : "Origem"}
                value={origem}
                cidadeId={cidadeAtiva?.id || null}
                onChange={setOrigem}
                onSelecionar={(s) => setUserPosition({ lat: s.lat, lng: s.lng })}
              />
              <CampoEnderecoAutocomplete
                placeholder={tipoCorrida === "encomenda" ? "Onde entregar" : "Destino"}
                value={destino}
                cidadeId={cidadeAtiva?.id || null}
                onChange={setDestino}
                onSelecionar={(s) => setDestinationPosition({ lat: s.lat, lng: s.lng })}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <button onClick={capturarPosicaoAtual} className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
                {capturandoPosicao ? "Capturando..." : "Usar minha localizacao atual"}
              </button>
              {userPosition && <span className="text-cyan-300">Lat {userPosition.lat} · Lng {userPosition.lng}</span>}
            </div>

            {previewMapHtml && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                <iframe title="prévia do trajeto" className="w-full h-56" srcDoc={previewMapHtml} />
              </div>
            )}

            {tipoCorrida === "encomenda" && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  value={encomendaDescricao}
                  onChange={(e) => setEncomendaDescricao(e.target.value)}
                  placeholder="O que está sendo enviado?"
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2"
                />
                <input
                  value={destinatarioNome}
                  onChange={(e) => setDestinatarioNome(e.target.value)}
                  placeholder="Nome de quem vai receber"
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                />
                <input
                  value={destinatarioTelefone}
                  onChange={(e) => setDestinatarioTelefone(e.target.value)}
                  placeholder="Telefone de quem vai receber (opcional)"
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                />
              </div>
            )}

            {calculandoPreco && (
              <p className="text-sm text-cyan-300 mt-3">Calculando rota e valor...</p>
            )}
            {precoEstimado !== null && !calculandoPreco && (
              <p className="text-green-400 font-bold mt-3">
                Valor estimado: R$ {precoEstimado.toFixed(2)} ({distanciaRotaKm?.toFixed(2)} km de rota)
              </p>
            )}

            <button
              onClick={solicitarCorrida}
              disabled={solicitando}
              className="mt-4 w-full bg-green-500 text-black font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {solicitando ? "Solicitando..." : tipoCorrida === "encomenda" ? "Solicitar entrega" : "Solicitar corrida"}
            </button>
          </section>
        )}

        {corridaAtiva && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                {corridaAtiva.status === "aguardando_motorista" ? "Procurando motorista..." : "Corrida"}
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700">{corridaAtiva.status}</span>
            </div>

            {corridaAtiva.status === "aguardando_motorista" && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800 p-3">
                <p className="text-sm text-slate-300">Aguardando algum motorista aceitar sua corrida...</p>
                <button onClick={cancelarBusca} className="text-xs bg-red-600 px-3 py-1.5 rounded-lg">Cancelar</button>
              </div>
            )}

            {motoristaAtivo && corridaAtiva.status !== "aguardando_motorista" && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-800 p-3">
                  <p className="text-slate-400 mb-1.5">Motorista</p>
                  <div className="flex items-center gap-2">
                    {motoristaAtivo.foto_url ? (
                      <img src={motoristaAtivo.foto_url} alt={motoristaAtivo.nome} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center"><User size={18} /></div>
                    )}
                    <div>
                      <p className="font-semibold">{motoristaAtivo.nome}</p>
                      <p className="text-xs text-yellow-300 flex items-center gap-1"><Star size={12} /> {motoristaAtivo.avaliacao.toFixed(1)}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs mt-2">{motoristaAtivo.veiculo} · {motoristaAtivo.placa}</p>
                  {motoristaAtivo.veiculo_foto_url && (
                    <img src={motoristaAtivo.veiculo_foto_url} alt="Veículo" className="mt-2 w-full h-20 rounded-lg object-cover border border-slate-700" />
                  )}
                </div>
                <div className="rounded-xl bg-slate-800 p-3">
                  <p className="text-slate-400">Deslocamento</p>
                  <p className="font-semibold">{progresso}%</p>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${progresso}%` }} /></div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3">
                  <p className="text-slate-400">Pagamento</p>
                  <p className="font-semibold">R$ {Number(corridaAtiva.preco || 0).toFixed(2)}</p>
                  <p className="text-xs text-slate-300">Metodo: {corridaAtiva.metodo_pagamento}</p>
                  <p className="text-xs text-green-300">Status: {corridaAtiva.status_pagamento}</p>
                </div>
              </div>
            )}

            {rideMapHtml && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                <iframe title="mapa corrida" className="w-full h-72" srcDoc={rideMapHtml} />
              </div>
            )}
          </section>
        )}
      </main>

      {showAdModal && adsConfig && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{adsConfig.popup_title || "Publicidade"}</h3>
              <button onClick={() => { setShowAdModal(false); setShowPaymentModal(true); }}><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-300">{adsConfig.popup_message}</p>
            <div className="mt-3 space-y-2">
              {(adsConfig.items || []).filter((item) => item.ativo !== false).map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-800 p-3 border border-slate-700">
                  <p className="font-semibold text-sm">{item.titulo}</p>
                  <p className="text-xs text-slate-300 mt-1">{item.mensagem}</p>
                  <button onClick={() => router.push(item.ctaLink)} className="mt-2 text-xs bg-cyan-600 px-2.5 py-1 rounded">{item.ctaLabel}</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowAdModal(false); setShowPaymentModal(true); }}
              className="mt-3 w-full bg-green-600 py-2 rounded-xl font-semibold"
            >
              Continuar para pagamento
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && corridaAtiva && motoristaAtivo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><CreditCard size={16} /> Pagamento seguro</h3>
              <button onClick={() => setShowPaymentModal(false)}><X size={18} /></button>
            </div>

            <p className="text-sm text-slate-300">Motorista: {motoristaAtivo.nome}</p>
            <p className="text-sm text-slate-300">Placa: {motoristaAtivo.placa}</p>
            <p className="text-lg font-bold text-green-400 mt-2">R$ {Number(corridaAtiva.preco).toFixed(2)}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["pix", "cartao", "saldo", "dinheiro"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-lg text-sm border ${paymentMethod === m ? "border-green-500 bg-green-500/10" : "border-slate-700"}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-xl bg-slate-800 p-3 text-xs text-slate-300 space-y-1">
              <p className="flex items-center gap-1"><ShieldCheck size={12} /> Tokenizacao ativa para metodo de pagamento.</p>
              <p>ID da corrida: {corridaAtiva.id}</p>
            </div>

            <button
              onClick={confirmarPagamento}
              disabled={paymentLoading}
              className="mt-4 w-full bg-green-600 py-2.5 rounded-xl font-bold disabled:opacity-70"
            >
              {paymentLoading ? "Confirmando..." : "Confirmar pagamento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
