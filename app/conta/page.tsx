"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type Indicacao = {
  id: string;
  ref_code: string;
  indicado_nome: string;
  indicado_telefone: string;
  status: "pendente" | "ativo";
  origem?: string | null;
  created_at?: string | null;
};

function formatPhone(value?: string) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return value;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function ContaPage() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [refCode, setRefCode] = useState("");
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarIndicacoes = useCallback(async (codigo: string) => {
    if (!codigo) {
      setIndicacoes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    const { data, error } = await supabase
      .from("indicacoes")
      .select("*")
      .eq("ref_code", codigo)
      .order("created_at", { ascending: false });

    if (error) {
      setErro(error.message);
      setIndicacoes([]);
      setLoading(false);
      return;
    }

    setIndicacoes((data as Indicacao[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedNome = localStorage.getItem("vc_nome") || "";
    const storedTelefone = localStorage.getItem("vc_telefone") || "";
    const storedRefCode =
      localStorage.getItem("vc_ref_code") ||
      localStorage.getItem("vc_last_ref_code") ||
      "VALENTE001";

    setNome(storedNome);
    setTelefone(storedTelefone);
    setRefCode(storedRefCode);

    carregarIndicacoes(storedRefCode);

    const channel = supabase
      .channel("realtime-indicacoes-conta")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "indicacoes" },
        () => {
          carregarIndicacoes(storedRefCode);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregarIndicacoes]);

  const pendentes = useMemo(
    () => indicacoes.filter((item) => item.status === "pendente"),
    [indicacoes]
  );

  const ativos = useMemo(
    () => indicacoes.filter((item) => item.status === "ativo"),
    [indicacoes]
  );

  async function marcarComoAtivo(id: string) {
    const { error } = await supabase
      .from("indicacoes")
      .update({ status: "ativo" })
      .eq("id", id);

    if (error) {
      alert("Não foi possível atualizar o status.");
      return;
    }

    await carregarIndicacoes(refCode);
  }

  return (
    <AppShell
      title="Minha conta"
      subtitle="Acompanhe seu código, seus dados e o andamento das indicações."
    >
      <div className="grid-cards">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Seus dados</h2>
            <span className="badge">Conta</span>
          </div>

          <div className="grid gap-3 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Nome:</span>{" "}
              {nome || "Ainda não informado"}
            </div>
            <div>
              <span className="font-semibold">Telefone:</span>{" "}
              {formatPhone(telefone)}
            </div>
            <div>
              <span className="font-semibold">Código de indicação:</span>{" "}
              {refCode || "-"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <p className="text-sm text-slate-500">Indicados pendentes</p>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
              {pendentes.length}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Pessoas que entraram pelo link, mas ainda aguardam ativação.
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-slate-500">Indicados ativos</p>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
              {ativos.length}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Pessoas já confirmadas como ativas.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card">Carregando indicações...</div>
        ) : null}

        {erro ? (
          <div className="card border border-red-200 bg-red-50 text-red-700">
            {erro}
          </div>
        ) : null}

        {!loading && !erro && (
          <>
            <section className="card">
              <h2 className="section-title mb-4">Lista de indicados pendentes</h2>

              {pendentes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-slate-500">
                  Nenhum indicado pendente no momento.
                </div>
              ) : (
                <div className="grid gap-3">
                  {pendentes.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.indicado_nome}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {formatPhone(item.indicado_telefone)}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            Entrou em: {formatDate(item.created_at)}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary !w-auto px-4 py-2"
                          onClick={() => marcarComoAtivo(item.id)}
                        >
                          Marcar ativo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="section-title mb-4">Lista de indicados ativos</h2>

              {ativos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-slate-500">
                  Nenhum indicado ativo ainda.
                </div>
              ) : (
                <div className="grid gap-3">
                  {ativos.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-green-200 bg-green-50 p-4"
                    >
                      <div className="font-bold text-slate-900">
                        {item.indicado_nome}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {formatPhone(item.indicado_telefone)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Ativado em: {formatDate(item.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}