"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login-admin");
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Verificando acesso...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-64 bg-slate-900 p-6 space-y-4">
        <h2 className="text-xl font-bold">Valente Conecta</h2>

        <nav className="space-y-3">

          <a href="/admin/dashboard" className="block hover:text-green-400">
            Dashboard
          </a>

          <a href="/admin/empresas" className="block hover:text-green-400">
            Empresas
          </a>

          <a href="/admin/ofertas" className="block hover:text-green-400">
            Ofertas
          </a>

          <a href="/admin/classificados" className="block hover:text-green-400">
            Classificados
          </a>

          <a href="/admin/usuarios" className="block hover:text-green-400">
            Usuários
          </a>

          <a href="/admin/push" className="block hover:text-green-400">
            Notificações Push
          </a>

        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}