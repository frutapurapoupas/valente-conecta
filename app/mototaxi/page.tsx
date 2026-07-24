"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import {
  AlertTriangle,
  Bike,
  CreditCard,
  ShieldCheck,
  Star,
  User,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

type Driver = {
  id: string;
  nome: string;
  fotoUrl?: string;
  telefone?: string;
  veiculo: string;
  placa: string;
  avaliacao: number;
  plano: "gratis" | "basico" | "premium";
  online: boolean;
  latitude: number;
  longitude: number;
};

type Ride = {
  id: string;
  passengerName: string;
  passengerId: string;
  passengerPlan: string;
  driverId: string;
  driverName: string;
  driverPhoto?: string;
  vehicle: string;
  plate: string;
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  driverLat: number;
  driverLng: number;
  price: number;
  paymentMethod: string;
  paymentStatus: "pendente" | "confirmado";
  status: "solicitada" | "aceita" | "em_andamento" | "concluida" | "cancelada";
  createdAt: string;
};

type AdsConfig = {
  enabled: boolean;
  showToFreePassengersOnly: boolean;
  popupTitle: string;
  popupMessage?: string;
  items: Array<{ id: string; titulo: string; mensagem: string; ctaLabel: string; ctaLink: string; ativo?: boolean }>;
};

type NearbyDriver = Driver & { distancia?: number; ordem: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dx = (aLat - bLat) * 111;
  const dy = (aLng - bLng) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildNearbyMapHtml(userPosition: { lat: number; lng: number } | null, drivers: NearbyDriver[]) {
  const center = userPosition
    ? { lat: userPosition.lat, lng: userPosition.lng }
    : drivers.length > 0
      ? { lat: drivers[0].latitude, lng: drivers[0].longitude }
      : null;

  if (!center) return "";

  const payload = {
    center,
    user: userPosition,
    drivers: drivers.map((driver) => ({
      id: driver.id,
      nome: driver.nome,
      lat: driver.latitude,
      lng: driver.longitude,
      ordem: driver.ordem,
      distancia: driver.distancia
    }))
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; }
      .hud {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background: rgba(15, 23, 42, 0.88);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 10px;
        padding: 8px 10px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        max-width: 320px;
      }
      .chip {
        display: inline-block;
        margin-top: 4px;
        margin-right: 6px;
        background: rgba(14, 116, 144, 0.28);
        border: 1px solid rgba(34, 211, 238, 0.5);
        border-radius: 999px;
        padding: 2px 8px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="hud">
      <div><strong>Mapa real de proximidade</strong></div>
      <div>Legenda: ponto azul = voce, pontos verdes = motoristas</div>
      <div class="chip">M1 mais proximo</div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${JSON.stringify(payload)};
      const map = L.map('map', { zoomControl: true }).setView([data.center.lat, data.center.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const bounds = [];
      if (data.user) {
        const userMarker = L.circleMarker([data.user.lat, data.user.lng], {
          radius: 8,
          color: '#1d4ed8',
          fillColor: '#60a5fa',
          fillOpacity: 0.95,
          weight: 2
        }).addTo(map);
        userMarker.bindTooltip('Voce', { permanent: true, direction: 'top' });
        bounds.push([data.user.lat, data.user.lng]);
      }

      data.drivers.forEach((driver) => {
        const marker = L.circleMarker([driver.lat, driver.lng], {
          radius: 7,
          color: '#065f46',
          fillColor: '#10b981',
          fillOpacity: 0.95,
          weight: 2
        }).addTo(map);

        const distancia = typeof driver.distancia === 'number' ? (' - ' + driver.distancia.toFixed(2) + ' km') : '';
        marker.bindTooltip('M' + driver.ordem + ' - ' + driver.nome + distancia, { permanent: true, direction: 'top' });
        bounds.push([driver.lat, driver.lng]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    </script>
  </body>
</html>`;
}

function buildRideMapHtml(ride: Ride) {
  const payload = {
    origin: { lat: ride.originLat, lng: ride.originLng, label: ride.origin || "Origem" },
    destination: { lat: ride.destinationLat, lng: ride.destinationLng, label: ride.destination || "Destino" },
    driver: { lat: ride.driverLat, lng: ride.driverLng, label: ride.driverName || "Motorista" },
    status: ride.status,
    pagamento: ride.paymentStatus,
    valor: Number(ride.price || 0)
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; }
      .hud {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1000;
        background: rgba(15, 23, 42, 0.9);
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 10px;
        padding: 10px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        max-width: 340px;
        line-height: 1.35;
      }
      .row { margin-top: 2px; }
      .badge {
        display: inline-block;
        margin-top: 5px;
        margin-right: 6px;
        border-radius: 999px;
        padding: 2px 8px;
        border: 1px solid rgba(56, 189, 248, 0.5);
        background: rgba(14, 116, 144, 0.26);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="hud" id="hud"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${JSON.stringify(payload)};

      function km(aLat, aLng, bLat, bLng) {
        const dx = (aLat - bLat) * 111;
        const dy = (aLng - bLng) * 111;
        return Math.sqrt(dx * dx + dy * dy);
      }

      const map = L.map('map', { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const origem = [data.origin.lat, data.origin.lng];
      const destino = [data.destination.lat, data.destination.lng];
      const motorista = [data.driver.lat, data.driver.lng];

      const origemMarker = L.circleMarker(origem, { radius: 7, color: '#1d4ed8', fillColor: '#60a5fa', fillOpacity: 0.95, weight: 2 }).addTo(map);
      origemMarker.bindTooltip('Origem', { permanent: true, direction: 'top' });

      const destinoMarker = L.circleMarker(destino, { radius: 7, color: '#9a3412', fillColor: '#f97316', fillOpacity: 0.95, weight: 2 }).addTo(map);
      destinoMarker.bindTooltip('Destino', { permanent: true, direction: 'top' });

      const motoristaMarker = L.circleMarker(motorista, { radius: 8, color: '#065f46', fillColor: '#10b981', fillOpacity: 0.95, weight: 2 }).addTo(map);
      motoristaMarker.bindTooltip('Motorista', { permanent: true, direction: 'top' });

      const bounds = L.latLngBounds([origem, destino, motorista]);
      map.fitBounds(bounds, { padding: [24, 24] });

      L.polyline([origem, destino], { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 5' }).addTo(map);

      fetch('https://router.project-osrm.org/route/v1/driving/' + data.driver.lng + ',' + data.driver.lat + ';' + data.destination.lng + ',' + data.destination.lat + '?overview=full&geometries=geojson')
        .then((response) => response.json())
        .then((json) => {
          if (json && json.routes && json.routes[0] && json.routes[0].geometry && json.routes[0].geometry.coordinates) {
            const coords = json.routes[0].geometry.coordinates.map((point) => [point[1], point[0]]);
            L.polyline(coords, { color: '#22d3ee', weight: 5, opacity: 0.95 }).addTo(map);
          } else {
            L.polyline([motorista, destino], { color: '#22d3ee', weight: 5, opacity: 0.95 }).addTo(map);
          }
        })
        .catch(() => {
          L.polyline([motorista, destino], { color: '#22d3ee', weight: 5, opacity: 0.95 }).addTo(map);
        });

      const distTotal = km(data.origin.lat, data.origin.lng, data.destination.lat, data.destination.lng);
      const distRestante = km(data.driver.lat, data.driver.lng, data.destination.lat, data.destination.lng);
      const eta = Math.max(1, Math.round((distRestante / 0.35) * 6));

      const hud = document.getElementById('hud');
      hud.innerHTML = '' +
        '<div><strong>Descricao da rota no mapa</strong></div>' +
        '<div class="row">Origem: ' + data.origin.label + '</div>' +
        '<div class="row">Destino: ' + data.destination.label + '</div>' +
        '<div class="row">Status: ' + data.status + '</div>' +
        '<div class="row">Distancia estimada: ' + distTotal.toFixed(2) + ' km</div>' +
        '<div class="row">Distancia restante: ' + distRestante.toFixed(2) + ' km</div>' +
        '<div class="row">ETA aproximado: ' + eta + ' min</div>' +
        '<div class="badge">Rota principal: origem -> destino</div>' +
        '<div class="badge">Rota em ciano: trecho restante</div>' +
        '<div class="row">Pagamento: ' + data.pagamento + ' | Valor: R$ ' + Number(data.valor).toFixed(2) + '</div>';
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

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationPosition, setDestinationPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [resolvendoDestino, setResolvendoDestino] = useState(false);
  const [capturandoPosicao, setCapturandoPosicao] = useState(false);
  const [preco, setPreco] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  const [showAdModal, setShowAdModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "saldo" | "dinheiro">("pix");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showDriverRegister, setShowDriverRegister] = useState(false);
  const [driverFormLoading, setDriverFormLoading] = useState(false);
  const [driverForm, setDriverForm] = useState({
    nome: "",
    telefone: "",
    veiculo: "",
    placa: "",
    fotoUrl: "",
    cnhNumero: "",
    cnhValida: false,
    documentoVeiculoOk: false,
    licenciamentoVencimento: "",
    plano: "gratis"
  });

  const trackingInterval = useRef<any>(null);
  const watchPositionRef = useRef<number | null>(null);

  const passengerPlan = useMemo(() => getStoredUserPlan(user), [user]);
  const freePassenger = passengerPlan === "gratis" || passengerPlan === "free";

  const myRides = useMemo(() => {
    const userId = String(user?.id || "anonimo");
    return rides.filter((r) => r.passengerId === userId).slice(0, 12);
  }, [rides, user?.id]);

  const driversOrdenados = useMemo(() => {
    if (!userPosition) return drivers;
    return [...drivers]
      .map((driver) => ({
        ...driver,
        distancia: distanceKm(userPosition.lat, userPosition.lng, driver.latitude, driver.longitude)
      }))
      .sort((a, b) => a.distancia - b.distancia);
  }, [drivers, userPosition]);

  const displayedDrivers = useMemo<NearbyDriver[]>(() => {
    const base = (selectedDriver
      ? driversOrdenados.filter((driver) => driver.id === selectedDriver.id)
      : driversOrdenados.slice(0, 8)) as Array<Driver & { distancia?: number }>;

    return base.map((driver, idx) => ({ ...driver, ordem: idx + 1 }));
  }, [driversOrdenados, selectedDriver]);

  const destinationReady = useMemo(() => destino.trim().length >= 3, [destino]);

  const priceByDriver = useMemo(() => {
    if (!userPosition || !destinationPosition) return {} as Record<string, { totalKm: number; pickupKm: number; price: number }>;

    const tripKm = distanceKm(userPosition.lat, userPosition.lng, destinationPosition.lat, destinationPosition.lng);
    const map: Record<string, { totalKm: number; pickupKm: number; price: number }> = {};

    displayedDrivers.forEach((driver) => {
      const pickupKm = distanceKm(driver.latitude, driver.longitude, userPosition.lat, userPosition.lng);
      const totalKm = pickupKm + tripKm;
      const valor = 6 + totalKm * 2.3;
      map[driver.id] = {
        totalKm,
        pickupKm,
        price: Number(valor.toFixed(2))
      };
    });

    return map;
  }, [destinationPosition, displayedDrivers, userPosition]);

  const nearbyMapHtml = useMemo(() => {
    if (!userPosition && displayedDrivers.length === 0) return "";
    return buildNearbyMapHtml(userPosition, displayedDrivers);
  }, [displayedDrivers, userPosition]);

  const activeRideProgress = useMemo(() => {
    if (!activeRide) return 0;
    const total = distanceKm(activeRide.originLat, activeRide.originLng, activeRide.destinationLat, activeRide.destinationLng);
    const done = distanceKm(activeRide.originLat, activeRide.originLng, activeRide.driverLat, activeRide.driverLng);
    if (total <= 0.001) return 0;
    return clamp(Math.round((done / total) * 100), 0, 100);
  }, [activeRide]);

  const activeRideEta = useMemo(() => {
    if (!activeRide || activeRide.status === "concluida") return "Chegou";
    const remaining = distanceKm(activeRide.driverLat, activeRide.driverLng, activeRide.destinationLat, activeRide.destinationLng);
    const mins = Math.max(1, Math.round((remaining / 0.35) * 6));
    return `${mins} min`;
  }, [activeRide]);

  const activeRideMapHtml = useMemo(() => {
    if (!activeRide) return "";
    return buildRideMapHtml(activeRide);
  }, [activeRide]);

  const geocodeDestino = async (query: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [driversRes, ridesRes, adsRes] = await Promise.all([
        fetch("/api/mototaxi?recurso=drivers&online=true", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=rides", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=ads", { cache: "no-store" })
      ]);

      const driversData = await driversRes.json();
      const ridesData = await ridesRes.json();
      const adsData = await adsRes.json();

      setDrivers(Array.isArray(driversData?.data) ? driversData.data : []);
      setRides(Array.isArray(ridesData?.data) ? ridesData.data : []);
      setAdsConfig(adsData?.data || null);
    } catch {
      toast.error("Erro ao carregar modulo de moto taxi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
        toast.error("Nao foi possivel capturar sua localizacao");
        setCapturandoPosicao(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    capturarPosicaoAtual();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    watchPositionRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setUserPosition((prev) => {
          const movedKm = prev ? distanceKm(prev.lat, prev.lng, lat, lng) : 999;
          if (!prev || movedKm >= 0.05) {
            setOrigem(`Minha localizacao (${lat}, ${lng})`);
          }
          return { lat, lng };
        });
      },
      () => null,
      { enableHighAccuracy: true, maximumAge: 8000, timeout: 15000 }
    );

    return () => {
      if (watchPositionRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!destinationReady) {
      setDestinationPosition(null);
      return;
    }

    const timer = setTimeout(async () => {
      setResolvendoDestino(true);
      const coords = await geocodeDestino(destino);
      setDestinationPosition(coords);
      setResolvendoDestino(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [destino, destinationReady]);

  useEffect(() => {
    if (!activeRide || activeRide.status !== "em_andamento") {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }
      return;
    }

    if (trackingInterval.current) return;

    trackingInterval.current = setInterval(async () => {
      setActiveRide((prev) => {
        if (!prev || prev.status !== "em_andamento") return prev;

        const nextLat = prev.driverLat + (prev.destinationLat - prev.driverLat) * 0.15;
        const nextLng = prev.driverLng + (prev.destinationLng - prev.driverLng) * 0.15;
        const arrived = distanceKm(nextLat, nextLng, prev.destinationLat, prev.destinationLng) < 0.12;

        const updated = {
          ...prev,
          driverLat: arrived ? prev.destinationLat : nextLat,
          driverLng: arrived ? prev.destinationLng : nextLng,
          status: arrived ? "concluida" : prev.status
        } as Ride;

        fetch("/api/mototaxi", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recurso: "driver_location",
            rideId: prev.id,
            driverLat: updated.driverLat,
            driverLng: updated.driverLng,
            status: updated.status
          })
        }).catch(() => null);

        if (arrived) {
          toast.success("Corrida concluida com sucesso");
        }

        return updated;
      });
    }, 4500);

    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }
    };
  }, [activeRide]);

  const solicitarCorrida = async (driver: Driver) => {
    if (!origem || !destino) {
      toast.error("Informe origem e destino");
      return;
    }

    const valorMotorista = priceByDriver[driver.id]?.price;
    if (!valorMotorista) {
      toast.error("Digite um destino valido para calcular os valores");
      return;
    }

    setSelectedDriver(driver);
    setPreco(valorMotorista);

    try {
      const payload = {
        recurso: "rides",
        passengerName: user?.nome || "Passageiro",
        passengerId: String(user?.id || "anonimo"),
        passengerPlan,
        driverId: driver.id,
        origin: origem,
        destination: destino,
        originLat: Number(userPosition?.lat || driver.latitude - 0.006),
        originLng: Number(userPosition?.lng || driver.longitude - 0.004),
        destinationLat: Number(destinationPosition?.lat || (userPosition?.lat || driver.latitude) + 0.008),
        destinationLng: Number(destinationPosition?.lng || (userPosition?.lng || driver.longitude) + 0.007),
        price: valorMotorista,
        paymentMethod
      };

      const res = await fetch("/api/mototaxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data?.success || !data?.data) {
        throw new Error(data?.error || "Nao foi possivel criar corrida");
      }

      const createdRide = data.data as Ride;
      setRides((prev) => [createdRide, ...prev]);
      setActiveRide(createdRide);
      setSelectedDriver(driver);

      const shouldShowAd =
        Boolean(adsConfig?.enabled) &&
        (!adsConfig?.showToFreePassengersOnly || freePassenger) &&
        Array.isArray(adsConfig?.items) &&
        adsConfig.items.some((item) => item.ativo !== false);

      if (shouldShowAd) {
        setShowAdModal(true);
      } else {
        setShowPaymentModal(true);
      }

      toast.success("Corrida solicitada. Falta confirmar pagamento");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao solicitar corrida");
    }
  };

  const confirmarPagamento = async () => {
    if (!activeRide) return;

    setPaymentLoading(true);
    try {
      const res = await fetch("/api/mototaxi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurso: "ride_status",
          rideId: activeRide.id,
          status: "em_andamento",
          paymentStatus: "confirmado"
        })
      });
      const data = await res.json();
      if (!data?.success) {
        throw new Error(data?.error || "Falha ao confirmar pagamento");
      }

      const updated = data.data as Ride;
      setActiveRide(updated);
      setRides((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowPaymentModal(false);
      toast.success("Pagamento confirmado com seguranca");
    } catch (error: any) {
      toast.error(error?.message || "Erro no pagamento");
    } finally {
      setPaymentLoading(false);
    }
  };

  const cadastrarMotorista = async () => {
    setDriverFormLoading(true);
    try {
      const res = await fetch("/api/mototaxi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "drivers", ...driverForm })
      });
      const data = await res.json();
      if (!data?.success) {
        throw new Error(data?.error || "Falha no cadastro");
      }

      toast.success("Cadastro enviado para validacao");
      setShowDriverRegister(false);
      setDriverForm({
        nome: "",
        telefone: "",
        veiculo: "",
        placa: "",
        fotoUrl: "",
        cnhNumero: "",
        cnhValida: false,
        documentoVeiculoOk: false,
        licenciamentoVencimento: "",
        plano: "gratis"
      });
      loadAll();
    } catch (error: any) {
      toast.error(error?.message || "Erro no cadastro do motorista");
    } finally {
      setDriverFormLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-6">Carregando moto taxi...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button onClick={() => router.back()} className="text-white/90 hover:text-white">Voltar</button>
          <h1 className="font-bold text-lg">Moto Taxi Valente</h1>
          <button onClick={() => setShowDriverRegister(true)} className="text-xs bg-white/15 px-3 py-1.5 rounded-full">Sou motorista</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Solicitar corrida</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="Origem"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2"
            />
            <input
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Destino"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2"
            />
            <div className="bg-blue-600/20 border border-blue-500/40 rounded-xl px-4 py-2 text-sm text-blue-100 flex items-center">
              Digite apenas o destino para ver motoristas e valores
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={capturarPosicaoAtual}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5"
            >
              {capturandoPosicao ? "Capturando..." : "Usar minha localizacao atual"}
            </button>
            {userPosition && <span className="text-cyan-300">Origem autoatualizada: Lat {userPosition.lat} · Lng {userPosition.lng}</span>}
          </div>
          {preco !== null && selectedDriver && (
            <p className="text-green-400 font-bold mt-3">Estimativa escolhida para {selectedDriver.nome}: R$ {preco.toFixed(2)}</p>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Motoristas proximos</h2>
          {!destinationReady && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">
              Digite o destino para carregar os motoristas mais proximos e os valores.
            </div>
          )}
          {destinationReady && resolvendoDestino && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-cyan-300">
              Localizando destino e calculando valores...
            </div>
          )}
          {destinationReady && !resolvendoDestino && !destinationPosition && (
            <div className="rounded-xl border border-amber-700/40 bg-amber-950/30 p-3 text-sm text-amber-200">
              Nao foi possivel localizar este destino no mapa. Ajuste o texto do destino para exibir as opcoes.
            </div>
          )}
          {destinationReady && destinationPosition && nearbyMapHtml && (
            <div className="mb-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
              <p className="text-xs text-slate-300 mb-2">Mapa local em tempo real</p>
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <iframe title="mapa motoristas proximos" className="w-full h-64" srcDoc={nearbyMapHtml} />
              </div>
              {selectedDriver && (
                <p className="text-xs text-emerald-300 mt-2">Motorista aceito: {selectedDriver.nome}. Os demais foram ocultados.</p>
              )}
            </div>
          )}
          {destinationReady && destinationPosition && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedDrivers.map((driver) => (
              <div key={driver.id} className="rounded-xl border border-slate-700 p-3 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <img
                    src={driver.fotoUrl || "https://via.placeholder.com/80x80"}
                    alt={driver.nome}
                    className="w-14 h-14 rounded-full object-cover border border-slate-600"
                  />
                  <div className="flex-1">
                    <p className="font-bold flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/40">M{driver.ordem}</span>
                      {driver.nome}
                    </p>
                    <p className="text-xs text-slate-300">{driver.veiculo} · Placa {driver.placa}</p>
                    <p className="text-xs text-yellow-300 flex items-center gap-1"><Star size={12} /> {driver.avaliacao.toFixed(1)}</p>
                    {typeof driver.distancia === "number" && (
                      <p className="text-[11px] text-emerald-300">{driver.distancia.toFixed(2)} km de voce · ordem {driver.ordem}</p>
                    )}
                    {priceByDriver[driver.id] && (
                      <p className="text-[12px] text-green-300 font-semibold">
                        R$ {priceByDriver[driver.id].price.toFixed(2)} · percurso total {priceByDriver[driver.id].totalKm.toFixed(2)} km
                      </p>
                    )}
                    <p className="text-[11px] text-cyan-300 uppercase">Plano {driver.plano}</p>
                  </div>
                  <button onClick={() => solicitarCorrida(driver)} className="bg-green-500 text-black font-bold px-3 py-1.5 rounded-full text-sm">
                    Aceitar
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </section>

        {activeRide && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Corrida ativa</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700">{activeRide.status}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="text-slate-400">Motorista</p>
                <p className="font-semibold flex items-center gap-2"><User size={14} /> {activeRide.driverName}</p>
                <p className="text-slate-300 text-xs">{activeRide.vehicle} · {activeRide.plate}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="text-slate-400">Deslocamento</p>
                <p className="font-semibold">{activeRideProgress}%</p>
                <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${activeRideProgress}%` }} /></div>
                <p className="text-xs text-cyan-300 mt-1">ETA: {activeRideEta}</p>
              </div>
              <div className="rounded-xl bg-slate-800 p-3">
                <p className="text-slate-400">Pagamento</p>
                <p className="font-semibold">R$ {Number(activeRide.price || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-300">Metodo: {activeRide.paymentMethod}</p>
                <p className="text-xs text-green-300">Status: {activeRide.paymentStatus}</p>
              </div>
            </div>

            {activeRideMapHtml && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                <iframe title="mapa corrida" className="w-full h-72" srcDoc={activeRideMapHtml} />
              </div>
            )}
          </section>
        )}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Historico</h2>
          <div className="space-y-2">
            {myRides.length === 0 && <p className="text-sm text-slate-400">Nenhuma corrida registrada.</p>}
            {myRides.map((ride) => (
              <div key={ride.id} className="text-sm rounded-lg bg-slate-800 px-3 py-2 flex items-center justify-between">
                <span>{ride.origin} ? {ride.destination}</span>
                <span className="text-green-300">R$ {Number(ride.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showAdModal && adsConfig && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{adsConfig.popupTitle || "Publicidade"}</h3>
              <button onClick={() => { setShowAdModal(false); setShowPaymentModal(true); }}><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-300">{adsConfig.popupMessage}</p>
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

      {showPaymentModal && activeRide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><CreditCard size={16} /> Pagamento seguro</h3>
              <button onClick={() => setShowPaymentModal(false)}><X size={18} /></button>
            </div>

            <p className="text-sm text-slate-300">Motorista: {activeRide.driverName}</p>
            <p className="text-sm text-slate-300">Placa: {activeRide.plate}</p>
            <p className="text-lg font-bold text-green-400 mt-2">R$ {Number(activeRide.price).toFixed(2)}</p>

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
              <p>ID da corrida: {activeRide.id}</p>
              <p>Metodo mascarado: {paymentMethod === "cartao" ? "cartao_****" : paymentMethod === "pix" ? "pix_tokenizado" : paymentMethod === "saldo" ? "saldo_interno" : "dinheiro_confirmado"}</p>
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

      {showDriverRegister && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><Bike size={16} /> Cadastro de motorista</h3>
              <button onClick={() => setShowDriverRegister(false)}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={driverForm.nome} onChange={(e) => setDriverForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input value={driverForm.telefone} onChange={(e) => setDriverForm((p) => ({ ...p, telefone: e.target.value }))} placeholder="Telefone" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input value={driverForm.veiculo} onChange={(e) => setDriverForm((p) => ({ ...p, veiculo: e.target.value }))} placeholder="Veiculo" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input value={driverForm.placa} onChange={(e) => setDriverForm((p) => ({ ...p, placa: e.target.value }))} placeholder="Placa" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input value={driverForm.cnhNumero} onChange={(e) => setDriverForm((p) => ({ ...p, cnhNumero: e.target.value }))} placeholder="Numero da CNH" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input type="date" value={driverForm.licenciamentoVencimento} onChange={(e) => setDriverForm((p) => ({ ...p, licenciamentoVencimento: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" />
              <input value={driverForm.fotoUrl} onChange={(e) => setDriverForm((p) => ({ ...p, fotoUrl: e.target.value }))} placeholder="URL da foto (opcional)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2" />
              <select value={driverForm.plano} onChange={(e) => setDriverForm((p) => ({ ...p, plano: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2">
                <option value="gratis">Plano Gratis</option>
                <option value="basico">Plano Basico</option>
                <option value="premium">Plano Premium</option>
              </select>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={driverForm.cnhValida} onChange={(e) => setDriverForm((p) => ({ ...p, cnhValida: e.target.checked }))} /> CNH valida confirmada</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={driverForm.documentoVeiculoOk} onChange={(e) => setDriverForm((p) => ({ ...p, documentoVeiculoOk: e.target.checked }))} /> Documentacao do veiculo valida</label>
            </div>

            <div className="mt-3 rounded-xl bg-amber-950/40 border border-amber-700/50 p-3 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5" />
              Somente motoristas com CNH valida e licenciamento em dia podem ser aprovados.
            </div>

            <button
              onClick={cadastrarMotorista}
              disabled={driverFormLoading}
              className="mt-4 w-full bg-cyan-600 py-2.5 rounded-xl font-bold disabled:opacity-70"
            >
              {driverFormLoading ? "Enviando..." : "Cadastrar motorista"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

