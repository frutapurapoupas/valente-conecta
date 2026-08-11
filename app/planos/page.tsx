"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, CreditCard, Shield, Star, Building2 } from "lucide-react";

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

const cardByPlan: Record<string, string> = {
  gratis: "border-slate-600 bg-slate-900",
  basico: "border-blue-500/50 bg-blue-950/30",
  premium: "border-yellow-500/50 bg-yellow-950/20",
  fisco: "border-purple-500/50 bg-purple-950/20"
};

export default function PlanosPage() {
  const [config, setConfig] = useState<PlanosConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [openServices, setOpenServices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/planos-config", { cache: "no-store" });
        const data = await res.json();
        if (data?.success && data?.data) {
          setConfig(data.data);
        } else {
          setConfig(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const planById = useMemo(() => {
    const map: Record<string, PlanConfig> = {};
    (config?.plans || []).forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [config]);

  const toggleService = (serviceId: string) => {
    setOpenServices((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-5xl mx-auto animate-pulse space-y-3">
          <div className="h-10 rounded bg-slate-800" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <p>Nao foi possivel carregar os planos agora.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="bg-gradient-to-r from-blue-700 to-cyan-600 p-4 sticky top-0 z-40 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white font-bold text-lg">PLANOS E ASSINATURA</h1>
          <p className="text-white/80 text-xs mt-1">Gratis, Basico, Premium e Fisco (quando aplicavel)</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300">
          <p className="font-semibold text-white mb-2">Regras gerais</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Gratis e Basico: 1 foto por produto/servico.</li>
            <li>Premium: 5 fotos por produto/servico.</li>
            <li>Itens pagos ficam com anuncio aberto (nome, endereco e localizador visiveis).</li>
            <li>No gratis, contato pode ficar borrado com desbloqueio de R$ {Number(config.settings.unlockContactPrice || 0).toFixed(2)}.</li>
            <li>Fotos, descricao e preco sao visiveis em todos os planos.</li>
            <li>A cada 3 indicacoes pagas (usuario, empresa, profissional liberal e outros), quem indicou recebe integralmente o valor do primeiro pagamento via PIX.</li>
          </ul>
        </div>

        {(config.services || []).map((service) => {
          const isOpen = !!openServices[service.id];
          return (
            <section key={service.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleService(service.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <h2 className="text-base font-bold text-white">{service.nome}</h2>
                  <p className="text-xs text-slate-400 mt-1">{service.enabledPlans.length} plano(s) disponivel(is)</p>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {service.enabledPlans.map((planId) => {
                    const plan = planById[planId];
                    if (!plan) return null;
                    const Icon = iconByPlan[plan.id] || CreditCard;
                    const features = (service.planFeatures?.[plan.id] || []).length > 0
                      ? service.planFeatures[plan.id]
                      : plan.featuresPadrao;

                    return (
                      <div key={`${service.id}-${plan.id}`} className={`rounded-xl border p-3 ${cardByPlan[plan.id] || "border-slate-600 bg-slate-900"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <h3 className="font-bold">{plan.nome}</h3>
                          </div>
                          <span className="text-xs text-slate-300">{plan.negociavel ? "A negociar" : `R$ ${Number(plan.preco || 0).toFixed(2)}/${plan.periodo}`}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{plan.descricao}</p>
                        {plan.descontoPixRecorrenteAtivo && !plan.negociavel && plan.preco ? (
                          <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
                            💸 {plan.descontoPixRecorrentePercent}% de desconto pagando via PIX por 12 meses
                            <span className="text-slate-400 font-normal">
                              (R$ {(plan.preco * (1 - (plan.descontoPixRecorrentePercent || 0) / 100)).toFixed(2)}/mês)
                            </span>
                          </p>
                        ) : null}
                        <ul className="mt-3 space-y-1">
                          {features.map((f, i) => (
                            <li key={i} className="text-xs text-slate-200 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-400 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}

