"use client";

// Caminho: C:\valente_conecta\components\comercios\FotoFachadaUploader.tsx
//
// Upload de UMA foto (fachada do estabelecimento) — versao enxuta do
// MidiaUploader (components/catalogo/MidiaUploader.tsx), que trabalha com
// array de MidiaItem[]. Aqui o schema e' um campo texto unico (`foto`) em
// comercios_diretorio/saude_estabelecimentos, entao basta guardar a url.
// Reaproveita o mesmo funil de compressao obrigatorio.

import { useRef, useState } from "react";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { comprimirImagem } from "@/utils/comprimirImagem";

export function FotoFachadaUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSelecao = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErro("");
    setProcessando(true);
    try {
      const comprimida = await comprimirImagem(arquivo);
      const formData = new FormData();
      formData.append("arquivo", comprimida.arquivoPrincipal);
      formData.append("thumb", comprimida.arquivoThumb);
      const resposta = await fetch("/api/upload/catalogo", { method: "POST", body: formData });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error || "Falha no upload");
      onChange(resultado.url);
    } catch (err: any) {
      setErro(err?.message || "Não foi possível processar a imagem.");
    } finally {
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
          <img src={value} alt="Fachada" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processando}
          className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex flex-col items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {processando ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" /> : <Camera className="w-6 h-6 text-gray-400" />}
          <span className="text-xs text-gray-500">{processando ? "Comprimindo..." : "Adicionar foto da fachada"}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleSelecao} className="hidden" />
      {erro && <p className="text-xs text-red-600 mt-1.5">{erro}</p>}
    </div>
  );
}
