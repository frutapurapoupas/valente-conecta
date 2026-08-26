"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Settings, CreditCard, Building2, Shield, Star } from "lucide-react";

interface PlanConfig {
  id: string;
  nome: string;
  preco: number | null;
  periodo: string;
  negociavel: boolean;
  ativo: boolean;
  descricao: string;
  fotosPorItem: number;
  featuresPadrao: string[];
  descontoPixRecorrenteAtivo?: boolean;
  descontoPixRecorrentePercent?: number;
}

interface ServiceConfig {
  id: string;
  nome: string;
  enabledPlans: string[];
  planFeatures: Record<string, string[]>;
}

interface PlanosConfig {
  version: number;
  settings: {
    unlockContactPrice: number;
    blurContactOnFree: boolean;
    paidAdsOpen: boolean;
    freePhotosPerItem: number;
    basicoPhotosPerItem: number;
    premiumPhotosPerItem: number;
  };
  plans: PlanConfig[];
  services: ServiceConfig[];
}

const iconByPlan: Record<string, any> = {
  gratis: Shield,
  basico: CreditCard,
  premium: Star,
  fisco: Building2
};

export default function AdminPlanosPage() {
  const [config, setConfig] = useState<PlanosConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openService, setOpenService] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/planos-config", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && data?.data) setConfig(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const planById = useMemo(() => {
    const map: Record<string, PlanConfig> = {};
    (config?.plans || []).forEach((p) => { map[p.id] = p; });
    return map;
  }, [config]);

  const setSetting = (key: keyof PlanosConfig["settings"], value: any) => {
    if (!config) return;
    setConfig({ ...config, settings: { ...config.settings, [key]: value } });
  };

  const updatePlan = (planId: string, patch: Partial<PlanConfig>) => {
    if (!config) return;
    setConfig({
      ...config,
      plans: config.plans.map((p) => p.id === planId ? { ...p, ...patch } : p)
    });
  };

  const togglePlanForService = (serviceId: string, planId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      services: config.services.map((s) => {
        if (s.id !== serviceId) return s;
        const exists = s.enabledPlans.includes(planId);
        return {
          ...s,
          enabledPlans: exists ? s.enabledPlans.filter((id) => id !== planId) : [...s.enabledPlans, planId]
        };
      })
    });
  };

  const updateServiceFeature = (serviceId: string, planId: string, idx: number, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      services: config.services.map((s) => {
        if (s.id !== serviceId) return s;
        const arr = [...(s.planFeatures?.[planId] || [])];
        arr[idx] = value;
        return {
          ...s,
          planFeatures: {
            ...s.planFeatures,
            [planId]: arr
          }
        };
      })
    });
  };

  const addServiceFeature = (serviceId: string, planId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      services: config.services.map((s) => {
        if (s.id !== serviceId) return s;
        const arr = [...(s.planFeatures?.[planId] || []), "Nova funcionalidade"];
        return {
          ...s,
          planFeatures: {
            ...s.planFeatures,
            [planId]: arr
          }
        };
      })
    });
  };

  const removeServiceFeature = (serviceId: string, planId: string, idx: number) => {
    if (!config) return;
    setConfig({
      ...config,
      services: config.services.map((s) => {
        if (s.id !== serviceId) return s;
        const arr = [...(s.planFeatures?.[planId] || [])].filter((_, i) => i !== idx);
        return {
          ...s,
          planFeatures: {
            ...s.planFeatures,
            [planId]: arr
          }
        };
      })
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planos-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Falha ao salvar");
      alert("Configuracoes de planos salvas com sucesso!");
    } catch (e: any) {
      alert(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-white rounded-xl animate-pulse" />
        <div className="h-64 bg-white rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💳 Configuração de Planos</h1>
          <p className="text-gray-500 text-sm">Defina preços, fotos por item, desbloqueio e o que cada serviço libera em cada plano.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Save size={16} /> {saving ? "Salvando..." : "Salvar Tudo"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
          <Settings size={18} /> Regras Gerais
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="text-sm">Preço desbloqueio contato (R$)
            <input type="number" step="0.01" value={config.settings.unlockContactPrice}
              onChange={(e) => setSetting("unlockContactPrice", Number(e.target.value || 0))}
              className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="text-sm">Fotos por item (Grátis)
            <input type="number" value={config.settings.freePhotosPerItem}
              onChange={(e) => setSetting("freePhotosPerItem", Number(e.target.value || 0))}
              className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="text-sm">Fotos por item (Básico)
            <input type="number" value={config.settings.basicoPhotosPerItem}
              onChange={(e) => setSetting("basicoPhotosPerItem", Number(e.target.value || 0))}
              className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="text-sm">Fotos por item (Premium)
            <input type="number" value={config.settings.premiumPhotosPerItem}
              onChange={(e) => setSetting("premiumPhotosPerItem", Number(e.target.value || 0))}
              className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={config.settings.blurContactOnFree}
              onChange={(e) => setSetting("blurContactOnFree", e.target.checked)} />
            Borrar contato no plano grátis
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" checked={config.settings.paidAdsOpen}
              onChange={(e) => setSetting("paidAdsOpen", e.target.checked)} />
            Anúncios pagos sempre abertos
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-3">Planos (valores globais)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {config.plans.map((p) => {
            const Icon = iconByPlan[p.id] || CreditCard;
            return (
              <div key={p.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 font-semibold text-sm mb-2"><Icon size={15} /> {p.nome}</div>
                <label className="text-sm text-gray-600">Preço
                  <input
                    type="number"
                    step="0.01"
                    value={p.preco ?? 0}
                    disabled={p.negociavel}
                    onChange={(e) => updatePlan(p.id, { preco: Number(e.target.value || 0) })}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>
                <label className="text-sm text-gray-600 block mt-2">Fotos por item
                  <input
                    type="number"
                    value={p.fotosPorItem}
                    onChange={(e) => updatePlan(p.id, { fotosPorItem: Number(e.target.value || 0) })}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm mt-2">
                  <input
                    type="checkbox"
                    checked={p.ativo}
                    onChange={(e) => updatePlan(p.id, { ativo: e.target.checked })}
                  />
                  Ativo
                </label>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!p.descontoPixRecorrenteAtivo}
                      onChange={(e) => updatePlan(p.id, { descontoPixRecorrenteAtivo: e.target.checked })}
                    />
                    Desconto para PIX recorrente (12 meses)
                  </label>
                  {p.descontoPixRecorrenteAtivo && (
                    <label className="text-sm text-gray-600 block mt-2">
                      % de desconto (sugestão: valores baixos, ex. 5%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        value={p.descontoPixRecorrentePercent ?? 5}
                        onChange={(e) => updatePlan(p.id, { descontoPixRecorrentePercent: Number(e.target.value || 0) })}
                        className="w-full mt-1 p-2 border rounded"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {config.services.map((service) => {
          const isOpen = !!openService[service.id];
          return (
            <div key={service.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenService((prev) => ({ ...prev, [service.id]: !prev[service.id] }))}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{service.nome}</h3>
                  <p className="text-sm text-gray-500">Planos habilitados: {service.enabledPlans.join(", ") || "nenhum"}</p>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {config.plans.map((p) => {
                      const enabled = service.enabledPlans.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePlanForService(service.id, p.id)}
                          className={`text-sm px-3 py-1.5 rounded-full border ${enabled ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}`}
                        >
                          {enabled ? "✓" : "+"} {p.nome}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {service.enabledPlans.map((planId) => {
                      const plan = planById[planId];
                      if (!plan) return null;
                      const features = service.planFeatures?.[planId] || [];
                      return (
                        <div key={`${service.id}_${planId}`} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2">{plan.nome}</h4>
                          <div className="space-y-2">
                            {features.map((f, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  value={f}
                                  onChange={(e) => updateServiceFeature(service.id, planId, idx, e.target.value)}
                                  className="flex-1 p-2 border rounded text-sm"
                                />
                                <button onClick={() => removeServiceFeature(service.id, planId, idx)} className="text-red-600">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button onClick={() => addServiceFeature(service.id, planId)} className="text-sm text-blue-600 flex items-center gap-1">
                              <Plus size={13} /> Adicionar funcionalidade
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

