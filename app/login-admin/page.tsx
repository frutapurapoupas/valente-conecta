"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginAdmin() {
  const router = useRouter();

  const [email, setEmail] = useState("frutapurapoupas@gmail.com");
  const [password, setPassword] = useState("12345");
  const [loading, setLoading] = useState(false);

  async function criarAcessoInicial() {
    if (!email.trim() || !password.trim()) {
      alert("Preencha o e-mail e a senha antes de criar o acesso inicial.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(`Erro ao criar acesso inicial: ${error.message}`);
        return;
      }

      alert("Acesso inicial criado com sucesso. Agora clique em Entrar.");
    } catch (err: any) {
      alert(
        `Erro ao criar acesso inicial: ${err?.message || "erro desconhecido"}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(`Erro ao fazer login: ${error.message}`);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      alert(`Erro ao fazer login: ${err?.message || "erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-2xl bg-slate-800/90 p-8 shadow-2xl"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">
          Login Administrador
        </h1>

        <input
          type="email"
          className="mb-4 w-full rounded bg-slate-700 p-3 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-4 w-full rounded bg-slate-700 p-3 outline-none"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="mb-3 w-full rounded bg-green-500 p-3 font-bold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={criarAcessoInicial}
          className="w-full rounded border border-white/20 bg-slate-700 p-3 font-bold disabled:opacity-60"
        >
          Criar acesso inicial
        </button>
      </form>
    </div>
  );
}