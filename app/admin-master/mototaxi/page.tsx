"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bell, CheckCircle2, CreditCard, Megaphone, Plus, Save, UserCheck, XCircle } from "lucide-react";

interface Driver {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  placa: string;
  plano: "gratis" | "basico" | "premium";
  online: boolean;
  cnhValida: boolean;
  documentoVeiculoOk: boolean;
  licenciamentoVencimento: string;
}

interface Ride {
  id: string;
  passengerName: string;
  driverName: string;
  price: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Metrics {
  totalDrivers: number;
  activeDrivers: number;
  compliantDrivers: number;
  ridesToday: number;
  inProgress: number;
  completedToday: number;
  pendingPayment: number;
  revenueToday: number;
  avgTicket: number;
  cancellationRate: number;
  docAlerts: number;
}

interface AdsItem {
  id: string;
  titulo: string;
  mensagem: string;
  ctaLabel: string;
  ctaLink: string;
  ativo?: boolean;
}

interface AdsConfig {
  enabled: boolean;
  showToFreePassengersOnly: boolean;
  cooldownMinutes: number;
  popupTitle: string;
  popupMessage?: string;
  items: AdsItem[];
}

export default function AdminMasterMotoTaxiPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAds, setSavingAds] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [driversRes, ridesRes, metricsRes, adsRes] = await Promise.all([
        fetch("/api/mototaxi?recurso=drivers", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=rides", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=metrics", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=ads", { cache: "no-store" })
      ]);

      const driversData = await driversRes.json();
      const ridesData = await ridesRes.json();
      const metricsData = await metricsRes.json();
      const adsData = await adsRes.json();

      setDrivers(Array.isArray(driversData?.data) ? driversData.data : []);
      setRides(Array.isArray(ridesData?.data) ? ridesData.data : []);
      setMetrics(metricsData?.data || null);
      setAdsConfig(adsData?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const expiringDrivers = useMemo(() => {
    const threshold = Date.now() + 1000 * 60 * 60 * 24 * 30;
    return drivers.filter((driver) => {
      const lic = new Date(driver.licenciamentoVencimento).getTime();
      return !driver.cnhValida || !driver.documentoVeiculoOk || lic < threshold;
    });
  }, [drivers]);

  const updateDriver = async (id: string, patch: Partial<Driver>) => {
    await fetch("/api/mototaxi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurso: "driver", id, patch })
    });
    load();
  };

  const updateRideStatus = async (rideId: string, status: string) => {
    await fetch("/api/mototaxi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurso: "ride_status", rideId, status })
    });
    load();
  };

  const saveAds = async () => {
    if (!adsConfig) return;
    setSavingAds(true);
    try {
      await fetch("/api/mototaxi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "ads", config: adsConfig })
      });
      await load();
      alert("Configuracoes de publicidade salvas.");
    } finally {
      setSavingAds(false);
    }
  };

  const addAd = () => {
    if (!adsConfig) return;
    setAdsConfig({
      ...adsConfig,
      items: [
        ...adsConfig.items,
        {
          id: `ad_${Date.now()}`,
          titulo: "Novo anuncio",
          mensagem: "Mensagem do popup",
          ctaLabel: "Saiba mais",
          ctaLink: "/planos",
          ativo: true
        }
      ]
    });
  };

  const updateAd = (id: string, patch: Partial<AdsItem>) => {
    if (!adsConfig) return;
    setAdsConfig({
      ...adsConfig,
      items: adsConfig.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  };

  if (loading) {
    return <div className="p-6">Carregando Moto Taxi...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Moto Taxi - Admin Master</h1>
        <p className="text-gray-500 text-sm">Métricas, compliance documental, corridas e publicidade para passageiros sem plano pago.</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <CardMetric icon={<UserCheck size={16} />} label="Motoristas ativos" value={metrics.activeDrivers} />
          <CardMetric icon={<BarChart3 size={16} />} label="Corridas hoje" value={metrics.ridesToday} />
          <CardMetric icon={<CreditCard size={16} />} label="Pag. pendentes" value={metrics.pendingPayment} />
          <CardMetric icon={<CheckCircle2 size={16} />} label="Concluidas hoje" value={metrics.completedToday} />
          <CardMetric icon={<Bell size={16} />} label="Alertas docs" value={metrics.docAlerts} />
          <CardMetric icon={<Megaphone size={16} />} label="Receita hoje" value={`R$ ${Number(metrics.revenueToday || 0).toFixed(2)}`} />
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Compliance e plano dos motoristas</h2>
        <div className="space-y-2">
          {drivers.map((driver) => {
            const docOk = driver.cnhValida && driver.documentoVeiculoOk;
            return (
              <div key={driver.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{driver.nome}</p>
                  <p className="text-xs text-gray-600">{driver.veiculo} · {driver.placa}</p>
                  <p className={`text-xs ${docOk ? "text-green-600" : "text-red-600"}`}>
                    {docOk ? "Documentacao OK" : "Pendencia documental"} · Licenciamento: {driver.licenciamentoVencimento}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={driver.plano}
                    onChange={(e) => updateDriver(driver.id, { plano: e.target.value as Driver["plano"] })}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="gratis">Gratis</option>
                    <option value="basico">Basico</option>
                    <option value="premium">Premium</option>
                  </select>
                  <button onClick={() => updateDriver(driver.id, { online: !driver.online })} className="text-xs px-3 py-1 rounded bg-slate-800 text-white">
                    {driver.online ? "Ficar offline" : "Ficar online"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Corridas recentes</h2>
        <div className="space-y-2">
          {rides.slice(0, 12).map((ride) => (
            <div key={ride.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{ride.passengerName} com {ride.driverName}</p>
                <p className="text-xs text-gray-600">R$ {Number(ride.price || 0).toFixed(2)} · {ride.paymentStatus} · {ride.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateRideStatus(ride.id, "em_andamento")} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">Iniciar</button>
                <button onClick={() => updateRideStatus(ride.id, "concluida")} className="text-xs px-3 py-1 rounded bg-green-600 text-white">Concluir</button>
                <button onClick={() => updateRideStatus(ride.id, "cancelada")} className="text-xs px-3 py-1 rounded bg-red-600 text-white">Cancelar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Publicidade para passageiros sem plano</h2>
          <button onClick={addAd} className="text-xs px-3 py-1 rounded bg-slate-800 text-white flex items-center gap-1"><Plus size={13} /> Novo</button>
        </div>

        {adsConfig && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <label className="text-xs text-gray-600">Titulo do popup
                <input value={adsConfig.popupTitle} onChange={(e) => setAdsConfig({ ...adsConfig, popupTitle: e.target.value })} className="w-full mt-1 border rounded px-2 py-1.5" />
              </label>
              <label className="text-xs text-gray-600">Mensagem do popup
                <input value={adsConfig.popupMessage || ""} onChange={(e) => setAdsConfig({ ...adsConfig, popupMessage: e.target.value })} className="w-full mt-1 border rounded px-2 py-1.5" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={adsConfig.enabled} onChange={(e) => setAdsConfig({ ...adsConfig, enabled: e.target.checked })} /> Ativar popup
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={adsConfig.showToFreePassengersOnly} onChange={(e) => setAdsConfig({ ...adsConfig, showToFreePassengersOnly: e.target.checked })} /> Somente plano gratis
              </label>
            </div>

            <div className="space-y-2">
              {adsConfig.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={item.titulo} onChange={(e) => updateAd(item.id, { titulo: e.target.value })} className="border rounded px-2 py-1.5 text-sm" placeholder="Titulo" />
                    <input value={item.mensagem} onChange={(e) => updateAd(item.id, { mensagem: e.target.value })} className="border rounded px-2 py-1.5 text-sm" placeholder="Mensagem" />
                    <input value={item.ctaLabel} onChange={(e) => updateAd(item.id, { ctaLabel: e.target.value })} className="border rounded px-2 py-1.5 text-sm" placeholder="Texto CTA" />
                    <input value={item.ctaLink} onChange={(e) => updateAd(item.id, { ctaLink: e.target.value })} className="border rounded px-2 py-1.5 text-sm" placeholder="Link CTA" />
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={item.ativo !== false} onChange={(e) => updateAd(item.id, { ativo: e.target.checked })} /> Ativo
                  </label>
                </div>
              ))}
            </div>

            <button onClick={saveAds} disabled={savingAds} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <Save size={14} /> {savingAds ? "Salvando..." : "Salvar publicidade"}
            </button>
          </>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-2">Alertas documentais</h2>
        {expiringDrivers.length === 0 ? (
          <p className="text-sm text-green-600">Nenhum alerta no momento.</p>
        ) : (
          <div className="space-y-2">
            {expiringDrivers.map((driver) => (
              <div key={driver.id} className="border border-red-200 bg-red-50 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
                <span>{driver.nome} · Licenciamento {driver.licenciamentoVencimento}</span>
                <XCircle size={16} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CardMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="text-slate-500 mb-1">{icon}</div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
