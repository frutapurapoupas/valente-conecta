"use client";

// Caminho: C:\valente_conecta\components\catalogo\MidiaUploader.tsx
//
// Upload de imagem reutilizavel por todos os modulos do catalogo. Aplica o
// funil obrigatorio de compressao client-side antes de habilitar o envio
// (ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 3.1 e
// utils/comprimirImagem.ts) — nunca deixa subir o arquivo bruto.

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { comprimirImagem } from "@/utils/comprimirImagem";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface MidiaUploaderProps {
  midia: MidiaItem[];
  onChange: (midia: MidiaItem[]) => void;
  maximo?: number;
  uploadUrl?: string; // endpoint que recebe FormData e devolve { url, thumb_url }
}

export function MidiaUploader({ midia, onChange, maximo = 6, uploadUrl = "/api/upload/catalogo" }: MidiaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSelecao = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files || []);
    if (!arquivos.length) return;
    if (midia.length + arquivos.length > maximo) {
      setErro(`Máximo de ${maximo} imagens.`);
      return;
    }

    setErro("");
    setProcessando(true);
    try {
      const novasMidias: MidiaItem[] = [];
      for (const arquivo of arquivos) {
        // Funil obrigatorio: nada e enviado sem passar pela compressao.
        const comprimida = await comprimirImagem(arquivo);

        const formData = new FormData();
        formData.append("arquivo", comprimida.arquivoPrincipal);
        formData.append("thumb", comprimida.arquivoThumb);

        const resposta = await fetch(uploadUrl, { method: "POST", body: formData });
        const resultado = await resposta.json();
        if (!resultado.success) throw new Error(resultado.error || "Falha no upload");

        novasMidias.push({
          tipo: "imagem",
          url: resultado.url,
          thumb_url: resultado.thumb_url,
          ordem: midia.length + novasMidias.length,
        });
      }
      onChange([...midia, ...novasMidias]);
    } catch (err: any) {
      setErro(err?.message || "Não foi possível processar a imagem.");
    } finally {
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remover = (index: number) => {
    onChange(midia.filter((_, i) => i !== index).map((m, i) => ({ ...m, ordem: i })));
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {midia.map((item, index) => (
          <div key={item.url + index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
            <img src={item.thumb_url || item.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remover(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                Capa
              </span>
            )}
          </div>
        ))}
        {midia.length < maximo && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={processando}
            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex items-center justify-center flex-col gap-1 disabled:opacity-60"
          >
            {processando ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
            <span className="text-xs text-gray-500">{processando ? "Comprimindo..." : "Adicionar"}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleSelecao} className="hidden" />
      {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}
      <p className="text-xs text-gray-400 mt-2">
        As imagens são comprimidas automaticamente antes do envio (economiza dados e espaço).
      </p>
    </div>
  );
}
