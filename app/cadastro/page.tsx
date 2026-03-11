"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type CadastroPayload = {
  nome: string;
  telefone: string;
  email: string | null;
  cidade: string | null;
  bairro: string | null;
  ref_code: string | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) => {
        let result = "";
        if (a) result += `(${a}`;
        if (a.length === 2) result += ") ";
        if (b) result += b;
        if (c) result += `-${c}`;
        return result;
      })
      .trim();
  }

  return digits
    .replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, a, b, c) => {
      let result = "";
      if (a) result += `(${a}`;
      if (a.length === 2) result += ") ";
      if (b) result += b;
      if (c) result += `-${c}`;
      return result;
    })
    .trim();
}

function sanitizeRef(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 24);
}

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const refCode = useMemo(() => {
    return sanitizeRef(searchParams.get("ref") || "");
  }, [searchParams]);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("Valente");
  const [bairro, setBairro] = useState("");
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (refCode) {
      localStorage.setItem("vc_last_ref_code", refCode);
    }
  }, [refCode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim() || !telefone.trim()) {
      setErro("Preencha pelo menos nome e telefone.");
      return;
    }

    const telefoneLimpo = onlyDigits(telefone);

    if (telefoneLimpo.length < 10) {
      setErro("Informe um telefone válido.");
      return;
    }

    const payload: CadastroPayload = {
      nome: nome.trim(),
      telefone: telefoneLimpo,
      email: email.trim() ? email.trim() : null,
      cidade: cidade.trim() ? cidade.trim() : null,
      bairro: bairro.trim() ? bairro.trim() : null,
      ref_code: refCode || null,
    };

    try {
      setSaving(true);

      localStorage.setItem("vc_nome", payload.nome);
      localStorage.setItem("vc_telefone", payload.telefone);

      const { error: cadastroError } = await supabase.from("cadastros").insert(payload);

      if (cadastroError) {
        console.warn("Falha ao salvar cadastro no Supabase:", cadastroError.message);
      }

      if (payload.ref_code) {
        const { error: indicacaoError } = await supabase.from("indicacoes").insert({
          ref_code: payload.ref_code,
          indicado_nome: payload.nome,
          indicado_telefone: payload.telefone,
          status: "pendente",
          origem: "cadastro",
        });

        if (indicacaoError) {
          console.warn("Falha ao salvar indicação no Supabase:", indicacaoError.message);
        }
      }

      setMensagem("Cadastro salvo com sucesso.");

      setTimeout(() => {
        const query = new URLSearchParams({
          nome: payload.nome,
          telefone: payload.telefone,
        });

        if (payload.ref_code) query.set("ref", payload.ref_code);

        router.push(`/status?${query.toString()}`);
      }, 700);
    } catch (err: any) {
      setErro(err?.message || "Não foi possível concluir o cadastro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      title="Cadastro"
      subtitle={
        refCode
          ? `Você está entrando com o código de indicação ${refCode}.`
          : "Preencha seus dados para participar do Valente Conecta."
      }
    >
      <div className="grid-cards">
        {refCode ? (
          <div className="card">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="section-title">Indicação identificada</h2>
              <span className="badge">Ativa</span>
            </div>
            <p className="text-sm text-slate-600">
              Este cadastro está vinculado ao código <strong>{refCode}</strong>.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="card">
          <h2 className="section-title mb-4">Seus dados</h2>

          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Telefone / WhatsApp
              </label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(75) 99999-9999"
                inputMode="numeric"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Opcional"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Cidade
              </label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Bairro
              </label>
              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
              />
            </div>
          </div>

          {erro ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          ) : null}

          {mensagem ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {mensagem}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Salvando..." : "Concluir cadastro"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/indicar")}
            >
              Voltar para indicação
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}