"use client";

// Caminho: C:\valente_conecta\components\catalogo\ItemForm.tsx
//
// Formulario generico de criar/editar item do catalogo — reaproveitado
// pelo admin da loja de todos os modulos verticais.

import { useState } from "react";
import { MidiaUploader } from "./MidiaUploader";
import type { CatalogoItem, MidiaItem, NovoCatalogoItem } from "@/lib/catalogo/marketplaceTypes";

interface ItemFormProps {
  categorias: string[];
  itemInicial?: CatalogoItem;
  onSalvar: (dados: Omit<NovoCatalogoItem, "dono_id" | "modulo">) => Promise<unknown>;
  onCancelar: () => void;
}

export function ItemForm({ categorias, itemInicial, onSalvar, onCancelar }: ItemFormProps) {
  const [titulo, setTitulo] = useState(itemInicial?.titulo || "");
  const [categoria, setCategoria] = useState(itemInicial?.categoria || categorias[0] || "");
  const [descricao, setDescricao] = useState(itemInicial?.descricao_publica || "");
  const [preco, setPreco] = useState(itemInicial?.preco?.toString() || "");
  const [semPreco, setSemPreco] = useState(itemInicial ? itemInicial.preco === null : false);
  const [midia, setMidia] = useState<MidiaItem[]>(itemInicial?.midia || []);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !categoria) return;
    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        categoria,
        descricao_publica: descricao.trim() || null,
        preco: semPreco ? null : Number(preco) || 0,
        midia,
        latitude: itemInicial?.latitude ?? null,
        longitude: itemInicial?.longitude ?? null,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
        <MidiaUploader midia={midia} onChange={setMidia} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Botijão de gás 13kg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            step="0.01"
            min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            disabled={semPreco}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="0,00"
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" checked={semPreco} onChange={(e) => setSemPreco(e.target.checked)} />
            Sob consulta
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
        >
          {salvando ? "Salvando..." : itemInicial ? "Salvar alterações" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
