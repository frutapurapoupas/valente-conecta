"use client";

// Caminho: C:\valente_conecta\app\admin-master\usuarios\page.tsx
//
// Lista real de usuarios cadastrados (nome+whatsapp+cidade), com status,
// plano ativo e cidades adicionais, atualizando sozinha via Supabase
// Realtime (nao polling) sempre que alguem se cadastra ou muda de status.

import { useCallback, useEffect, useState } from "react";
import { Search, Radio, MapPin, CreditCard } from "lucide-react";
import { useUsuariosRealtime } from "@/lib/hooks/useUsuariosRealtime";
import { CardsResumoUsuarios, GraficoCadastrosPorDia, GraficoPorCidade, GraficoPorStatus, type MetricasUsuarios } from "../components/GraficosUsuarios";

interface UsuarioLinha {
  id: string;
  nome: string;
  whatsapp: string;
  cidade_base: string | null;
  status: "admin" | "trial" | "viral" | "expirado";
  created_at: string;
  planos_ativos: { plano_id: string; servico_id: string }[];
  cidades_adicionais: string[];
}

const STATUS_LABEL: Record<string, string> = { admin: "Admin", trial: "Trial", viral: "Viral", expirado: "Expirado" };
const STATUS_COR: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  trial: "bg-yellow-100 text-yellow-700",
  viral: "bg-green-100 text-green-700",
  expirado: "bg-red-100 text-red-700",
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioLinha[]>([]);
  const [metricas, setMetricas] = useState<MetricasUsuarios | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [somenteNovos, setSomenteNovos] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  const carregar = useCallback(async () => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (statusFiltro) params.set("status", statusFiltro);
    if (somenteNovos) params.set("novos", "true");

    const [resLista, resMetricas] = await Promise.all([
      fetch(`/api/admin-master/usuarios-lista?${params}`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin-master/usuarios-metricas", { cache: "no-store" }).then((r) => r.json()),
    ]);
    if (resLista.success) setUsuarios(resLista.data);
    if (resMetricas.success) setMetricas(resMetricas.data);
    setUltimaAtualizacao(new Date());
    setCarregando(false);
  }, [busca, statusFiltro, somenteNovos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useUsuariosRealtime(carregar);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-sm text-gray-500">Cadastros reais, atualizando automaticamente.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Ao vivo
          {ultimaAtualizacao && (
            <span className="text-gray-400 font-normal">
              · última atualização {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      {metricas && (
        <>
          <CardsResumoUsuarios metricas={metricas} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GraficoCadastrosPorDia dados={metricas.cadastrosPorDia} />
            <GraficoPorCidade dados={metricas.porCidade} />
            <GraficoPorStatus status={metricas.porStatus} />
          </div>
        </>
      )}

      <div className="bg-white border rounded-lg p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Todos os status</option>
          <option value="trial">Trial</option>
          <option value="viral">Viral</option>
          <option value="expirado">Expirado</option>
          <option value="admin">Admin</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 px-2">
          <input type="checkbox" checked={somenteNovos} onChange={(e) => setSomenteNovos(e.target.checked)} />
          Só novos (7 dias)
        </label>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhum usuário encontrado.</p>
        ) : (
          usuarios.map((u) => (
            <div key={u.id} className="p-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium text-gray-800">{u.nome}</p>
                <p className="text-xs text-gray-500">{u.whatsapp}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" /> {u.cidade_base || "—"}
                {u.cidades_adicionais.length > 0 && ` +${u.cidades_adicionais.length}`}
              </span>
              {u.planos_ativos.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <CreditCard className="w-3 h-3" /> {u.planos_ativos.length} plano(s)
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COR[u.status]}`}>
                {STATUS_LABEL[u.status]}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(u.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
