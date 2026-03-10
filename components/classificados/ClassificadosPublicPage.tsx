"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Classificado = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: number | null;
  cidade: string | null;
  contato_nome: string | null;
  contato_whatsapp: string | null;
  created_at: string;
};

export default function ClassificadosPublicPage() {
  const [classificados, setClassificados] = useState<Classificado[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarClassificados() {
    const { data, error } = await supabase
      .from("classificados")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClassificados(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregarClassificados();

    const channel = supabase
      .channel("classificados-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classificados" },
        () => {
          carregarClassificados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-gray-500">
        Carregando classificados...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">

      <h1 className="text-2xl font-bold mb-6">
        Classificados
      </h1>

      {classificados.length === 0 && (
        <div className="text-gray-500">
          Nenhum classificado disponível.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

        {classificados.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 shadow-sm bg-white"
          >

            <h2 className="font-semibold text-lg">
              {item.titulo}
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              {item.descricao}
            </p>

            {item.preco && (
              <div className="mt-3 font-bold text-green-600">
                R$ {item.preco.toFixed(2)}
              </div>
            )}

            {item.cidade && (
              <div className="text-xs text-gray-500 mt-1">
                {item.cidade}
              </div>
            )}

            <div className="mt-4 flex gap-2">

              {item.contato_whatsapp && (
                <a
                  href={`https://wa.me/${item.contato_whatsapp}`}
                  target="_blank"
                  className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  WhatsApp
                </a>
              )}

              {item.contato_nome && (
                <span className="text-xs text-gray-600 flex items-center">
                  {item.contato_nome}
                </span>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}