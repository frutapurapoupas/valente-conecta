"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Totais = {
  empresas: number;
  ofertas: number;
  classificados: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totais, setTotais] = useState<Totais>({
    empresas: 0,
    ofertas: 0,
    classificados: 0,
  });

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      await carregarTotais();
      setLoading(false);
    }

    init();
  }, [router]);

  async function carregarTotais() {
    const [empresasRes, ofertasRes, classificadosRes] = await Promise.all([
      supabase.from("empresas").select("*", { count: "exact", head: true }),
      supabase.from("ofertas").select("*", { count: "exact", head: true }),
      supabase.from("classificados").select("*", { count: "exact", head: true }),
    ]);

    setTotais({
      empresas: empresasRes.count ?? 0,
      ofertas: ofertasRes.count ?? 0,
      classificados: classificadosRes.count ?? 0,
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Carregando painel...</p>
      </main>
    );
  }

  const cards = [
    {
      titulo: "Empresas",
      descricao: "Cadastro e gestão de parceiros.",
      detalhes: "Área para cadastrar, editar e organizar empresas parceiras.",
      href: "/admin/empresas",
      total: totais.empresas,
    },
    {
      titulo: "Ofertas",
      descricao: "Promoções e destaques do comércio.",
      detalhes: "Gestão de promoções com integração ao banco Supabase.",
      href: "/admin/ofertas",
      total: totais.ofertas,
    },
    {
      titulo: "Classificados",
      descricao: "Anúncios, vendas, aluguel e achados.",
      detalhes: "Controle administrativo dos anúncios publicados no app.",
      href: "/admin/classificados",
      total: totais.classificados,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Painel Administrativo
              </p>
              <h1 className="text-3xl md:text-5xl font-bold mt-3">
                Administração de Dashboards
              </h1>
              <p className="text-slate-300 mt-4 max-w-2xl">
                Controle inicial do Valente Conecta. Aqui você gerencia empresas,
                ofertas e classificados antes da publicação.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/login"
                className="rounded-xl border border-slate-600 px-4 py-3 text-sm hover:bg-slate-800 transition"
              >
                Trocar login
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold hover:bg-emerald-600 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-8">
          {cards.map((item) => (
            <div
              key={item.titulo}
              className="rounded-[24px] bg-white border border-slate-200 p-6 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Módulo
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">
                {item.titulo}
              </h2>
              <p className="text-slate-600 mt-2">{item.descricao}</p>

              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total cadastrado</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {item.total}
                </p>
              </div>

              <p className="text-slate-600 mt-4 text-sm leading-6">
                {item.detalhes}
              </p>

              <Link
                href={item.href}
                className="inline-block mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                Abrir módulo
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}