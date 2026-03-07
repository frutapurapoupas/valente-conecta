"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function sanitizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 20);
}

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [codigoIndicado, setCodigoIndicado] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (!ref) return;

    const codigoLimpo = sanitizeCode(ref);
    if (!codigoLimpo) return;

    localStorage.setItem("vc_referred_by", codigoLimpo);
    setCodigoIndicado(codigoLimpo);
  }, []);

  async function finalizarCadastro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);

    try {
      const visitanteToken =
        typeof window !== "undefined"
          ? localStorage.getItem("vc_visitor_token")
          : null;

      const indicadorCodigo =
        typeof window !== "undefined"
          ? localStorage.getItem("vc_referred_by")
          : null;

      const emailLimpo = email.trim() ? email.trim() : null;
      const nomeLimpo = nome.trim();
      const telefoneLimpo = telefone.trim();

      const { error: cadastroErro } = await supabase.from("usuarios").insert([
        {
          nome: nomeLimpo,
          telefone: telefoneLimpo,
          email: emailLimpo,
          created_at: new Date().toISOString(),
        },
      ]);

      if (cadastroErro) {
        console.error("Erro ao salvar em usuarios:", cadastroErro);
        alert("Erro ao salvar cadastro");
        setCarregando(false);
        return;
      }

      if (visitanteToken) {
        const { error: updateErro } = await supabase
          .from("indicacoes")
          .update({
            telefone_indicado: telefoneLimpo,
            indicado_email: emailLimpo,
            status: "confirmado",
          })
          .eq("visitante_token", visitanteToken);

        if (updateErro) {
          console.error("Erro ao atualizar indicacao:", updateErro);
        }
      } else if (indicadorCodigo) {
        const { error: insertIndicacaoErro } = await supabase
          .from("indicacoes")
          .insert([
            {
              indicador_codigo: indicadorCodigo,
              telefone_indicado: telefoneLimpo,
              indicado_email: emailLimpo,
              status: "confirmado",
              bonus: 1,
              origem: "cadastro",
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertIndicacaoErro) {
          console.error("Erro ao inserir indicacao:", insertIndicacaoErro);
        }
      }

      alert("Cadastro concluído!");
      router.push("/");
    } catch (err) {
      console.error("Erro inesperado no cadastro:", err);
      alert("Erro inesperado");
    }

    setCarregando(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#041022] px-6 text-white">
      <form
        onSubmit={finalizarCadastro}
        className="w-full max-w-lg rounded-2xl bg-white/10 p-8 backdrop-blur space-y-4"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-400">
            APP VALENTE CONECTA
          </h1>

          <p className="mt-1 text-sm text-slate-300">
            o classificado da cidade
          </p>
        </div>

        <h2 className="text-center text-xl font-semibold">Criar cadastro</h2>

        {codigoIndicado && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Você está se cadastrando por uma indicação:{" "}
            <strong>{codigoIndicado}</strong>
          </div>
        )}

        <input
          placeholder="Nome"
          className="w-full rounded-lg p-3 text-black"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          placeholder="Telefone"
          className="w-full rounded-lg p-3 text-black"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        <input
          placeholder="Email (opcional)"
          type="email"
          className="w-full rounded-lg p-3 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          disabled={carregando}
          className="w-full rounded-lg bg-emerald-500 p-3 font-semibold hover:bg-emerald-600 disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Finalizar cadastro"}
        </button>
      </form>
    </main>
  );
}