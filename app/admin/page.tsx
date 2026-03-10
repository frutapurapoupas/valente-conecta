"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [pendentes, setPendentes] = useState({
    empresas: 0,
    ofertas: 0,
    classificados: 0,
    publicacoes: 0
  });

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function carregarPendentes() {

    const { count: empresas } = await supabase
      .from("empresas")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente");

    const { count: ofertas } = await supabase
      .from("ofertas")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente");

    const { count: classificados } = await supabase
      .from("classificado")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente");

    const { count: publicacoes } = await supabase
      .from("publicacoes_app")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente");

    setPendentes({
      empresas: empresas || 0,
      ofertas: ofertas || 0,
      classificados: classificados || 0,
      publicacoes: publicacoes || 0
    });
  }

  function Card({ titulo, link, descricao, alerta }: any) {
    return (
      <Link href={link}>
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg cursor-pointer relative">

          {alerta > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {alerta}
            </div>
          )}

          <h2 className="font-semibold text-lg">{titulo}</h2>
          <p className="text-sm text-slate-500">{descricao}</p>

        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Painel Administrativo
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <Card
            titulo="Empresas"
            link="/admin/empresas"
            descricao="Gerenciar empresas cadastradas"
            alerta={pendentes.empresas}
          />

          <Card
            titulo="Ofertas"
            link="/admin/ofertas"
            descricao="Aprovar e editar ofertas"
            alerta={pendentes.ofertas}
          />

          <Card
            titulo="Classificados"
            link="/admin/classificados"
            descricao="Revisar classificados enviados"
            alerta={pendentes.classificados}
          />

          <Card
            titulo="Publicações"
            link="/admin/publicacoes"
            descricao="Aprovar anúncios do app"
            alerta={pendentes.publicacoes}
          />

          <Card
            titulo="Usuários"
            link="/admin/usuarios"
            descricao="Lista de usuários cadastrados"
            alerta={0}
          />

          <Card
            titulo="Indicações"
            link="/admin/indicacoes"
            descricao="Controle de indicações"
            alerta={0}
          />

        </div>
      </div>
    </div>
  );
}