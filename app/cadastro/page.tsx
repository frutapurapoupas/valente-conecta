"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [codigoIndicado, setCodigoIndicado] = useState("");

  useEffect(() => {

    const ref = searchParams.get("ref");

    if (!ref) return;

    const codigoLimpo = sanitizeCode(ref);

    if (!codigoLimpo) return;

    localStorage.setItem("vc_referred_by", codigoLimpo);
    setCodigoIndicado(codigoLimpo);

  }, [searchParams]);

  async function finalizarCadastro(e: FormEvent<HTMLFormElement>) {

    e.preventDefault();
    setCarregando(true);

    try {

      const visitanteToken = localStorage.getItem("vc_visitor_token");

      const { error: cadastroErro } = await supabase
        .from("usuarios")
        .insert([
          {
            nome,
            telefone,
            email
          }
        ]);

      if (cadastroErro) {

        alert("Erro ao salvar cadastro");
        console.error(cadastroErro.message);
        setCarregando(false);
        return;

      }

      if (visitanteToken) {

        await supabase
          .from("indicacoes")
          .update({
            telefone_indicado: telefone,
            indicado_email: email,
            status: "confirmado"
          })
          .eq("visitante_token", visitanteToken);

      }

      alert("Cadastro concluído!");

      router.push("/");

    } catch (err) {

      console.error(err);
      alert("Erro inesperado");

    }

    setCarregando(false);

  }

  return (

    <main className="min-h-screen flex items-center justify-center bg-[#041022] text-white px-6">

      <form
        onSubmit={finalizarCadastro}
        className="w-full max-w-lg bg-white/10 backdrop-blur p-8 rounded-2xl space-y-4"
      >

        {/* CABEÇALHO DO APP */}

        <div className="text-center mb-4">

          <h1 className="text-3xl font-bold text-emerald-400">
            App Valente Conecta
          </h1>

          <p className="text-sm text-slate-300 mt-1">
            o classificados da cidade
          </p>

        </div>

        {/* TITULO DO FORM */}

        <h2 className="text-xl font-semibold text-center mb-4">
          Criar cadastro
        </h2>

        {codigoIndicado && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-200">
            Você está se cadastrando por uma indicação.
          </div>
        )}

        <input
          placeholder="Nome"
          className="w-full p-3 rounded-lg text-black"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          placeholder="Telefone"
          className="w-full p-3 rounded-lg text-black"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        <input
          placeholder="Email"
          type="email"
          className="w-full p-3 rounded-lg text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={carregando}
          className="w-full bg-emerald-500 p-3 rounded-lg font-semibold hover:bg-emerald-600"
        >
          {carregando ? "Salvando..." : "Finalizar cadastro"}
        </button>

      </form>

    </main>

  );

}