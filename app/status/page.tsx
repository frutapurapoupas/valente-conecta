"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function StatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nome = useMemo(() => searchParams.get("nome") || "", [searchParams]);
  const telefone = useMemo(
    () => searchParams.get("telefone") || "",
    [searchParams]
  );
  const ref = useMemo(() => searchParams.get("ref") || "", [searchParams]);

  return (
    <AppShell
      title="Cadastro concluído"
      subtitle="Seus dados foram recebidos com sucesso."
    >
      <div className="grid-cards">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Resumo</h2>
            <span className="badge">Sucesso</span>
          </div>

          <div className="grid gap-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Nome:</span> {nome || "-"}
            </div>
            <div>
              <span className="font-semibold">Telefone:</span>{" "}
              {telefone || "-"}
            </div>
            <div>
              <span className="font-semibold">Código de indicação:</span>{" "}
              {ref || "Não informado"}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-2">Próximos passos</h2>
          <p className="text-sm text-slate-600">
            Seu cadastro foi registrado. Se você entrou por um link de indicação,
            ele ficará visível na conta do indicador como pendente até a
            ativação.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push("/")}
            >
              Ir para início
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/conta")}
            >
              Abrir minha conta
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}