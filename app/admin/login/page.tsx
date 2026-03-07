"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/admin/dashboard");
      }
    };

    verificarSessao();
  }, [router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setErro("Não foi possível fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Painel Administrativo
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Login do Admin
          </h1>
          <p className="text-slate-600 mt-2">
            Entre com seu usuário do Supabase Auth.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 text-white font-semibold py-3 hover:bg-emerald-600 transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}