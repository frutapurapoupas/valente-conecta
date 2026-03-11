"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {

  const [empresas, setEmpresas] = useState(0);
  const [ofertas, setOfertas] = useState(0);
  const [classificados, setClassificados] = useState(0);

  useEffect(() => {

    async function load() {

      const { count: e } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true });

      const { count: o } = await supabase
        .from("ofertas")
        .select("*", { count: "exact", head: true });

      const { count: c } = await supabase
        .from("classificados")
        .select("*", { count: "exact", head: true });

      setEmpresas(e || 0);
      setOfertas(o || 0);
      setClassificados(c || 0);
    }

    load();

  }, []);

  return (

    <div>

      <h1 className="text-3xl font-bold mb-8">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-slate-800 p-6 rounded">
          <h2 className="text-xl mb-2">Empresas</h2>
          <p className="text-3xl font-bold">{empresas}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded">
          <h2 className="text-xl mb-2">Ofertas</h2>
          <p className="text-3xl font-bold">{ofertas}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded">
          <h2 className="text-xl mb-2">Classificados</h2>
          <p className="text-3xl font-bold">{classificados}</p>
        </div>

      </div>

    </div>

  );
}