"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CadastroPage() {

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function finalizarCadastro(e: any) {

    e.preventDefault();

    setCarregando(true);

    try {

      const visitanteToken = localStorage.getItem("vc_visitor_token");
      const indicadorCodigo = localStorage.getItem("vc_referred_by");

      // salvar usuário
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

      // confirmar indicação
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

        <h1 className="text-2xl font-bold">
          Criar cadastro
        </h1>

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
          className="w-full bg-emerald-500 p-3 rounded-lg font-semibold"
        >
          {carregando ? "Salvando..." : "Finalizar cadastro"}
        </button>

      </form>

    </main>

  );

}