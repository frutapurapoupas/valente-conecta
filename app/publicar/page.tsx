"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PublicarPage() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [categoria, setCategoria] = useState("servicos");

  async function publicar() {
    const { error } = await supabase.from("publicacoes_app").insert([
      {
        titulo,
        descricao,
        preco: Number(preco),
        whatsapp,
        categoria,
        tipo: "anuncio",
      },
    ]);

    if (error) {
      alert("Erro ao publicar");
      return;
    }

    alert("Anúncio enviado para aprovação!");
    setTitulo("");
    setDescricao("");
    setPreco("");
    setWhatsapp("");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Publicar anúncio
      </h1>

      <input
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <input
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <input
        placeholder="WhatsApp"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      >
        <option value="servicos">Serviços</option>
        <option value="produtos">Produtos</option>
        <option value="classificados">Classificados</option>
      </select>

      <button
        onClick={publicar}
        className="bg-emerald-600 text-white px-6 py-3 rounded-lg"
      >
        Publicar
      </button>
    </div>
  );
}