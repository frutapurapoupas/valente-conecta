"use client";

// Caminho: C:\valente_conecta\components\admin\PainelPlanoUsuario.tsx
//
// Controle do Plano Geral (055_plano_geral.sql) por usuário individual,
// dentro do painel expandido de app/admin-master/usuarios/page.tsx. Dois
// níveis de controle, os dois opcionais:
//   1. Nível do usuário (grátis/básico/ilimitado) — troca direto
//      usuarios.plano_geral, mesmo campo que o Mercado Pago já escreve.
//   2. Exceção por serviço (066_plano_geral_excecoes_usuario.sql) —
//      bloquear, liberar ilimitado ou dar limite customizado num serviço
//      específico, sem mexer no nível inteiro. Mesmos rótulos de serviço
//      de app/admin-master/configuracoes/plano-geral/page.tsx, pra ficar
//      harmonizado com a config global.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Save, RotateCcw } from "lucide-react";

const SERVICOS: { chave: string; label: string; periodo: string }[] = [
  { chave: "carona_desbloqueio", label: "Carona Solidária — desbloqueios", periodo: "/mês" },
  { chave: "fila_hospital", label: "Fila de Hospital/Clínica — entradas", periodo: "/mês" },
  { chave: "mototaxi", label: "Moto Táxi/Encomendas — corridas", periodo: "/mês" },
  { chave: "agua_gas", label: "Água e Gás — pedidos", periodo: "/mês" },
  { chave: "academia", label: "Academia — check-ins", periodo: "/mês" },
  { chave: "busca_google", label: "Buscas no Google", periodo: "/dia" },
];

const TIERS = [
  { id: "gratis", label: "Grátis" },
  { id: "basico", label: "Básico" },
  { id: "ilimitado", label: "Ilimitado" },
];

interface ServicoStatus {
  servico: string;
  limite: number | null;
  usado: number;
  restante: number | null;
}

interface Excecao {
  servico: string;
  modo: "bloqueado" | "ilimitado" | "limite_customizado";
  limite_customizado: number | null;
  motivo: string | null;
}

export function PainelPlanoUsuario({ usuarioId }: { usuarioId: string }) {
  const [carregando, setCarregando] = useState(true);
  const [tier, setTier] = useState("gratis");
  const [validoAte, setValidoAte] = useState("");
  const [servicosStatus, setServicosStatus] = useState<ServicoStatus[]>([]);
  const [excecoes, setExcecoes] = useState<Record<string, Excecao | undefined>>({});
  const [rascunho, setRascunho] = useState<Record<string, { modo: string; limite: string; motivo: string }>>({});
  const [salvandoTier, setSalvandoTier] = useState(false);
  const [salvandoServico, setSalvandoServico] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    try {
      const [resStatus, resExcecoes] = await Promise.all([
        fetch(`/api/plano-geral/status?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/admin-master/usuarios/${usuarioId}/plano-excecoes`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (resStatus.success) {
        setTier(resStatus.data.tier);
        setValidoAte(resStatus.data.validoAte ? resStatus.data.validoAte.slice(0, 10) : "");
        setServicosStatus(resStatus.data.servicos);
      }
      if (resExcecoes.success) {
        const mapa: Record<string, Excecao> = {};
        const rasc: Record<string, { modo: string; limite: string; motivo: string }> = {};
        for (const e of resExcecoes.data as Excecao[]) {
          mapa[e.servico] = e;
          rasc[e.servico] = { modo: e.modo, limite: e.limite_customizado?.toString() || "", motivo: e.motivo || "" };
        }
        setExcecoes(mapa);
        setRascunho((prev) => ({ ...prev, ...rasc }));
      }
    } catch {
      toast.error("Erro ao carregar plano do usuário");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const salvarTier = async () => {
    setSalvandoTier(true);
    try {
      const resp = await fetch(`/api/admin-master/usuarios/${usuarioId}/plano`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, validoAte: validoAte || null }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Nível atualizado");
      carregar();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar nível");
    } finally {
      setSalvandoTier(false);
    }
  };

  const rascunhoDe = (servico: string) => rascunho[servico] || { modo: "padrao", limite: "", motivo: "" };

  const salvarExcecao = async (servico: string) => {
    const r = rascunhoDe(servico);
    setSalvandoServico(servico);
    try {
      const resp = await fetch(`/api/admin-master/usuarios/${usuarioId}/plano-excecoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servico,
          modo: r.modo,
          limiteCustomizado: r.modo === "limite_customizado" ? Number(r.limite) : undefined,
          motivo: r.motivo,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(r.modo === "padrao" ? "Voltou ao padrão do plano" : "Exceção salva");
      carregar();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar exceção");
    } finally {
      setSalvandoServico(null);
    }
  };

  if (carregando) return <p className="text-xs text-gray-400">Carregando plano...</p>;

  return (
    <div className="col-span-full mt-2 pt-3 border-t space-y-3">
      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Plano & Limites
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-[10px] text-gray-500 mb-0.5">Nível</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} className="px-2 py-1.5 border rounded-lg text-xs bg-white">
            {TIERS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        {tier !== "gratis" && (
          <div>
            <label className="block text-[10px] text-gray-500 mb-0.5">Válido até</label>
            <input
              type="date"
              value={validoAte}
              onChange={(e) => setValidoAte(e.target.value)}
              className="px-2 py-1.5 border rounded-lg text-xs"
            />
          </div>
        )}
        <button
          onClick={salvarTier}
          disabled={salvandoTier}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
        >
          Salvar nível
        </button>
      </div>

      <div className="space-y-1.5">
        {SERVICOS.map((s) => {
          const status = servicosStatus.find((x) => x.servico === s.chave);
          const r = rascunhoDe(s.chave);
          const excecaoAtiva = excecoes[s.chave];
          return (
            <div key={s.chave} className="flex flex-wrap items-center gap-2 bg-white border rounded-lg px-2.5 py-2">
              <div className="flex-1 min-w-[160px]">
                <p className="text-xs text-gray-700">{s.label}</p>
                <p className="text-[10px] text-gray-400">
                  {status ? `${status.usado} usado(s) ${s.periodo}${status.limite !== null ? ` · limite do plano: ${status.limite}` : " · sem limite"}` : "—"}
                  {excecaoAtiva && (
                    <span className="text-amber-600 font-medium">
                      {" "}· exceção ativa: {excecaoAtiva.modo === "bloqueado" ? "bloqueado" : excecaoAtiva.modo === "ilimitado" ? "ilimitado" : `limite ${excecaoAtiva.limite_customizado}`}
                    </span>
                  )}
                </p>
              </div>
              <select
                value={r.modo}
                onChange={(e) => setRascunho((prev) => ({ ...prev, [s.chave]: { ...r, modo: e.target.value } }))}
                className="px-2 py-1.5 border rounded-lg text-xs bg-white"
              >
                <option value="padrao">Padrão do plano</option>
                <option value="bloqueado">Bloquear</option>
                <option value="ilimitado">Liberar ilimitado</option>
                <option value="limite_customizado">Limite customizado</option>
              </select>
              {r.modo === "limite_customizado" && (
                <input
                  type="number"
                  min={0}
                  value={r.limite}
                  onChange={(e) => setRascunho((prev) => ({ ...prev, [s.chave]: { ...r, limite: e.target.value } }))}
                  placeholder="Nº"
                  className="w-16 px-2 py-1.5 border rounded-lg text-xs"
                />
              )}
              <input
                type="text"
                value={r.motivo}
                onChange={(e) => setRascunho((prev) => ({ ...prev, [s.chave]: { ...r, motivo: e.target.value } }))}
                placeholder="Motivo (opcional)"
                className="min-w-[100px] flex-1 px-2 py-1.5 border rounded-lg text-xs"
              />
              <button
                onClick={() => salvarExcecao(s.chave)}
                disabled={salvandoServico === s.chave}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-gray-600"
                title="Salvar"
              >
                {r.modo === "padrao" ? <RotateCcw className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
