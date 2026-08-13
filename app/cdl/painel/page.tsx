"use client";

// Caminho: C:\valente_conecta\app\cdl\painel\page.tsx
// Painel do representante do CDL — mostra so' as capacidades ligadas pra
// cidade dele (selo/curadoria/relatorios agregados), sem acesso a nenhum
// dado financeiro individual.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Award, Star, BarChart3, LogOut, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Representante {
  id: string;
  nome: string;
  cidade: string;
}

interface Relatorio {
  cidade: string;
  moedaNome: string;
  totalUsuarios: number;
  totalTransacoesConcluidas: number;
  totalCirculando: number;
  totalComercios: number;
}

interface ItemCuradoria {
  id: string;
  titulo: string;
  categoria: string;
  modulo: string;
  recomendado_cdl: boolean;
}

export default function CdlPainelPage() {
  const router = useRouter();
  const [rep, setRep] = useState<Representante | null>(null);
  const [config, setConfig] = useState<{ cdl_selo_ativo: boolean; cdl_curadoria_ativa: boolean; cdl_relatorios_ativo: boolean; moeda_nome: string } | null>(null);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [itens, setItens] = useState<ItemCuradoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("cdl_representante");
    if (!raw) {
      router.push("/cdl/login");
      return;
    }
    const r = JSON.parse(raw);
    setRep(r);

    fetch(`/api/moeda-conecta/cidade-config?cidade=${encodeURIComponent(r.cidade)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setConfig(res.data);
          if (res.data.cdl_relatorios_ativo) {
            fetch(`/api/cdl/relatorio?representanteId=${r.id}`)
              .then((rr) => rr.json())
              .then((rr) => rr.success && setRelatorio(rr.data));
          }
          if (res.data.cdl_curadoria_ativa) {
            fetch(`/api/cdl/curadoria?representanteId=${r.id}`)
              .then((rr) => rr.json())
              .then((rr) => rr.success && setItens(rr.data));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const alternarRecomendado = async (item: ItemCuradoria) => {
    if (!rep) return;
    try {
      const resp = await fetch("/api/cdl/curadoria", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ representanteId: rep.id, itemId: item.id, recomendado: !item.recomendado_cdl }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, recomendado_cdl: !i.recomendado_cdl } : i)));
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar");
    }
  };

  const sair = () => {
    localStorage.removeItem("cdl_representante");
    router.push("/cdl/login");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Carregando...</div>;
  if (!rep) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-white font-bold">CDL {rep.cidade}</h1>
              <p className="text-xs text-slate-400">{rep.nome}</p>
            </div>
          </div>
          <button onClick={sair} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>

        {config?.cdl_selo_ativo && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-white shrink-0" />
            <div>
              <p className="text-white font-bold">Apoiador oficial</p>
              <p className="text-white/80 text-sm">O CDL de {rep.cidade} apoia oficialmente a {config.moeda_nome}.</p>
            </div>
          </div>
        )}

        {config?.cdl_relatorios_ativo && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Panorama da cidade
            </h2>
            {relatorio ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{relatorio.totalUsuarios}</p>
                  <p className="text-xs text-slate-400">Usuários cadastrados</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{relatorio.totalComercios}</p>
                  <p className="text-xs text-slate-400">Comércios/fornecedores</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{relatorio.totalTransacoesConcluidas}</p>
                  <p className="text-xs text-slate-400">Transações concluídas</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xl font-bold text-white">{relatorio.totalCirculando.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{relatorio.moedaNome} em circulação</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Sem dados ainda.</p>
            )}
            <p className="text-[10px] text-slate-500 mt-3">Só totais da cidade — nenhum dado financeiro individual.</p>
          </div>
        )}

        {config?.cdl_curadoria_ativa && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> Curadoria de comércios
            </h2>
            {itens.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhum comércio publicado nessa cidade ainda.</p>
            ) : (
              <div className="space-y-2">
                {itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
                    <div>
                      <p className="text-white text-sm font-medium">{item.titulo}</p>
                      <p className="text-xs text-slate-400">{item.categoria}</p>
                    </div>
                    <button
                      onClick={() => alternarRecomendado(item)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        item.recomendado_cdl ? "bg-yellow-500 text-slate-950" : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {item.recomendado_cdl && <Check className="w-3.5 h-3.5" />}
                      {item.recomendado_cdl ? "Recomendado" : "Recomendar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!config?.cdl_selo_ativo && !config?.cdl_relatorios_ativo && !config?.cdl_curadoria_ativa && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            Nenhuma funcionalidade do CDL está liberada pra {rep.cidade} ainda. Fale com o admin master.
          </div>
        )}
      </div>
    </div>
  );
}
