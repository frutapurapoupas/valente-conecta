"use client";

// Caminho: C:\valente_conecta\components\pdv\CapturaFotoComprovante.tsx
//
// Captura foto de um DOCUMENTO inteiro (nota fiscal/cupom fiscal) pra
// comprovar o cadastro colaborativo de produto feito por consumidor (ver
// 093_cadastro_consumidor_produto.sql). E' a mesma logica de upload de
// CapturaCodigoBarras.tsx (camera traseira, comprime, sobe pro bucket
// PRIVADO catalogo-comprovantes via /api/upload/comprovante-catalogo), so'
// SEM a etapa de decodificacao zxing (nao faz sentido tentar ler um
// documento inteiro como codigo de barras/QR).

import { useEffect, useRef, useState } from "react";
import { FileText, Camera, Loader2, RotateCcw } from "lucide-react";
import { comprimirImagem } from "@/utils/comprimirImagem";

interface Props {
  fotoPath: string | null;
  donoId: string;
  titulo: string;
  obrigatoria?: boolean;
  onFotoPathChange: (path: string | null) => void;
}

export function CapturaFotoComprovante({ fotoPath, donoId, titulo, obrigatoria, onFotoPathChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelecao = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro("");
    setProcessando(true);
    const urlObjeto = URL.createObjectURL(arquivo);

    try {
      const comprimida = await comprimirImagem(arquivo);
      const formData = new FormData();
      formData.append("arquivo", comprimida.arquivoPrincipal);
      formData.append("donoId", donoId);
      const resposta = await fetch("/api/upload/comprovante-catalogo", { method: "POST", body: formData });
      const resultadoUpload = await resposta.json();
      if (!resultadoUpload.success) {
        // DIAGNOSTICO TEMPORARIO: mostra o "detalhe" (erro real do servidor)
        // junto da mensagem generica, pra achar a causa de um erro que so'
        // acontece em producao. Reverter quando identificarmos a causa.
        const msg = resultadoUpload.detalhe
          ? `${resultadoUpload.error || "Falha no upload"} — ${resultadoUpload.detalhe}`
          : resultadoUpload.error || "Falha no upload";
        throw new Error(msg);
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(urlObjeto);
      onFotoPathChange(resultadoUpload.path);
    } catch (err: any) {
      URL.revokeObjectURL(urlObjeto);
      setErro(err?.message || "Não foi possível processar a foto.");
    } finally {
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
        <FileText className="w-4 h-4" /> {titulo}{obrigatoria && <span className="text-red-500">*</span>}
      </label>

      {fotoPath ? (
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <img src={previewUrl} alt={titulo} className="w-20 h-20 object-cover rounded-lg border" />
          ) : (
            <div className="w-20 h-20 rounded-lg border bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-medium text-center px-1">
              Foto enviada ✓
            </div>
          )}
          <div className="flex-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tirar outra foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processando}
          className="w-full py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {processando ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Camera className="w-5 h-5 text-gray-400" />}
          <span className="text-sm text-gray-600">{processando ? "Processando foto..." : `Tirar ${titulo.toLowerCase()}`}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleSelecao} className="hidden" />
      {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}
    </div>
  );
}
