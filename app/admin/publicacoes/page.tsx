"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Publicacao = {
  id: string;
  tipo: string | null;
  categoria: string | null;
  titulo: string | null;
  descricao: string | null;
  preco: number | null;
  nome_contato: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cidade: string | null;
  foto_url: string | null;
  status: string | null;
  created_at: string | null;
  modo_contato: string | null;
  valor_desbloqueio: number | null;
  liberar_contato_automatico: boolean | null;
  exibir_contato: boolean | null;
};

type FiltroStatus = "todos" | "pendente" | "aprovado" | "rejeitado";

function formatarData(valor: string | null) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleString("pt-BR");
}

function formatarMoeda(valor: number | null | undefined) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "R$ 0,00";
  }
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AdminPublicacoesPage() {
  const [itens, setItens] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarPublicacoes();
  }, []);

  async function carregarPublicacoes() {
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase
      .from("publicacoes_app")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar publicações.");
      setCarregando(false);
      return;
    }

    setItens((data || []) as Publicacao[]);
    setCarregando(false);
  }

  async function atualizarStatus(
    id: string,
    novoStatus: "aprovado" | "rejeitado" | "pendente"
  ) {
    const { error } = await supabase
      .from("publicacoes_app")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      setMensagem(`Erro ao marcar como ${novoStatus}.`);
      return;
    }

    setMensagem(`Publicação marcada como ${novoStatus}.`);
    await carregarPublicacoes();
  }

  async function atualizarCampo(
    id: string,
    campo: keyof Publicacao,
    valor: string | number | boolean
  ) {
    const { error } = await supabase
      .from("publicacoes_app")
      .update({ [campo]: valor })
      .eq("id", id);

    if (error) {
      setMensagem(`Erro ao atualizar ${String(campo)}.`);
      return;
    }

    setMensagem("Configuração salva com sucesso.");
    await carregarPublicacoes();
  }

  const pendentes = itens.filter((item) => item.status === "pendente");
  const aprovados = itens.filter((item) => item.status === "aprovado");
  const rejeitados = itens.filter((item) => item.status === "rejeitado");

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return itens.filter((item) => {
      const bateStatus =
        filtroStatus === "todos" ? true : item.status === filtroStatus;

      const textoBase = [
        item.titulo,
        item.descricao,
        item.categoria,
        item.tipo,
        item.nome_contato,
        item.telefone,
        item.whatsapp,
        item.cidade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const bateBusca = termo ? textoBase.includes(termo) : true;

      return bateStatus && bateBusca;
    });
  }, [itens, filtroStatus, busca]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Aprovação de Publicações
            </h1>
            <p className="mt-2 text-slate-600">
              Gerencie anúncios enviados pelos usuários do app, com controle de
              status, contato e monetização.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resumo rápido
            </div>
            <div className="mt-2 text-sm text-slate-700">
              Total de publicações: <strong>{itens.length}</strong>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow">
            <div className="text-sm text-slate-500">Pendentes</div>
            <div className="mt-2 text-3xl font-bold text-amber-600">
              {pendentes.length}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <div className="text-sm text-slate-500">Aprovados</div>
            <div className="mt-2 text-3xl font-bold text-emerald-600">
              {aprovados.length}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <div className="text-sm text-slate-500">Rejeitados</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {rejeitados.length}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Buscar publicação
              </label>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, descrição, WhatsApp, cidade..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Filtrar por status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value as FiltroStatus)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>
          </div>
        </div>

        {mensagem && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow">
            {mensagem}
          </div>
        )}

        <div className="rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Lista de publicações
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {itensFiltrados.length} item(ns) encontrado(s)
            </p>
          </div>

          {carregando ? (
            <div className="px-5 py-8 text-slate-500">Carregando...</div>
          ) : itensFiltrados.length === 0 ? (
            <div className="px-5 py-8 text-slate-500">
              Nenhuma publicação encontrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {itensFiltrados.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                          {item.categoria || "sem categoria"}
                        </span>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                          {item.tipo || "anúncio"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            item.status === "pendente"
                              ? "bg-amber-100 text-amber-700"
                              : item.status === "aprovado"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status || "sem status"}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        {item.titulo || "Sem título"}
                      </h3>

                      <p className="mt-3 leading-7 text-slate-600">
                        {item.descricao || "Sem descrição"}
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                        <div>
                          <strong>Preço anunciado:</strong>{" "}
                          {item.preco !== null && item.preco !== undefined
                            ? formatarMoeda(item.preco)
                            : "A combinar"}
                        </div>
                        <div>
                          <strong>Cidade:</strong> {item.cidade || "-"}
                        </div>
                        <div>
                          <strong>Nome do contato:</strong>{" "}
                          {item.nome_contato || "-"}
                        </div>
                        <div>
                          <strong>Telefone:</strong> {item.telefone || "-"}
                        </div>
                        <div>
                          <strong>WhatsApp:</strong> {item.whatsapp || "-"}
                        </div>
                        <div>
                          <strong>Enviado em:</strong>{" "}
                          {formatarData(item.created_at)}
                        </div>
                      </div>

                      {item.foto_url ? (
                        <div className="mt-5">
                          <img
                            src={item.foto_url}
                            alt={item.titulo || "Foto da publicação"}
                            className="h-52 w-full max-w-md rounded-xl border border-slate-200 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="mt-5 flex h-40 w-full max-w-md items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                          Sem foto enviada
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-3 text-sm font-bold text-slate-900">
                          Ações rápidas
                        </h4>

                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => atualizarStatus(item.id, "aprovado")}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Aprovar
                          </button>

                          <button
                            onClick={() => atualizarStatus(item.id, "pendente")}
                            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                          >
                            Voltar para pendente
                          </button>

                          <button
                            onClick={() => atualizarStatus(item.id, "rejeitado")}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-3 text-sm font-bold text-slate-900">
                          Controle de contato e monetização
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Modo do contato
                            </label>
                            <select
                              value={item.modo_contato || "livre"}
                              onChange={(e) =>
                                atualizarCampo(
                                  item.id,
                                  "modo_contato",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="livre">Livre</option>
                              <option value="bloqueado">Bloqueado</option>
                              <option value="pagamento">Por pagamento</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Valor para desbloqueio
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={item.valor_desbloqueio || 0}
                              onBlur={(e) =>
                                atualizarCampo(
                                  item.id,
                                  "valor_desbloqueio",
                                  Number(e.target.value || 0)
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Exibir contato
                            </label>
                            <select
                              value={item.exibir_contato ? "sim" : "nao"}
                              onChange={(e) =>
                                atualizarCampo(
                                  item.id,
                                  "exibir_contato",
                                  e.target.value === "sim"
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="sim">Sim</option>
                              <option value="nao">Não</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Liberação automática
                            </label>
                            <select
                              value={
                                item.liberar_contato_automatico ? "sim" : "nao"
                              }
                              onChange={(e) =>
                                atualizarCampo(
                                  item.id,
                                  "liberar_contato_automatico",
                                  e.target.value === "sim"
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="nao">Manual</option>
                              <option value="sim">Automática</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-2 text-sm font-bold text-slate-900">
                          Prévia da mensagem ao usuário
                        </h4>

                        {item.modo_contato === "pagamento" ? (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Desbloqueie o contato por{" "}
                            <strong>
                              {formatarMoeda(item.valor_desbloqueio || 0)}
                            </strong>{" "}
                            (PIX ou cartão débito).
                          </div>
                        ) : item.modo_contato === "bloqueado" ||
                          item.exibir_contato === false ? (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Contato indisponível no momento.
                          </div>
                        ) : (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            Contato liberado normalmente para o usuário.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}