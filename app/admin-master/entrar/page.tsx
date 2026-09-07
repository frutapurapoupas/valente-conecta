"use client";

// Caminho: C:\valente_conecta\app\admin-master\entrar\page.tsx
//
// Tela de entrada do link de acesso direto do Admin Master (ver
// app/api/admin-master/bootstrap/route.ts). Sem formulario -- só lê o
// token da URL, busca os dados da conta admin, grava no localStorage
// (mesmo formato usado por getCurrentUser()/isUserLoggedIn() no resto do
// app) e manda pro dashboard. Pensado pra ser o start_url do atalho/ícone
// instalado, assim ele sempre reautentica sozinho mesmo se o navegador
// limpar cookies/storage.

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EntrarAdminMasterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setErro("Link incompleto — falta o token de acesso.");
      return;
    }

    fetch(`/api/admin-master/bootstrap?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (!resp.success) {
          setErro(resp.error || "Acesso negado.");
          return;
        }
        localStorage.setItem("user_logged_in", "true");
        localStorage.setItem("user_data", JSON.stringify(resp.user));
        router.replace("/admin-master");
      })
      .catch(() => setErro("Erro de conexão. Tente de novo."));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 text-center">
      {erro ? (
        <div className="text-red-400 text-sm max-w-xs">
          <p className="font-semibold mb-1">Não foi possível entrar</p>
          <p>{erro}</p>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Entrando...</p>
      )}
    </div>
  );
}
