"use client";

// Caminho: C:\valente_conecta\components\pdv\CapturaCodigoBarras.tsx
//
// Captura a FOTO do codigo de barras (nao so' o valor decodificado) —
// pedido explicito do dono do produto: a foto fica registrada em
// pdv_produtos_catalogo.foto_codigo_barras_url pra auditoria/consulta,
// alem do EAN em si. `capture="environment"` abre a camera traseira direto
// no celular, sem passar por galeria.
//
// Tenta decodificar o EAN da propria foto com @zxing/browser (mesma lib do
// BarcodeScanner.tsx, mas em modo imagem estatica em vez de video ao vivo).
// Se nao conseguir decodificar (foto tremida, angulo ruim), a foto ainda e'
// enviada — o fornecedor pode digitar o EAN manualmente, ou deixar em
// branco (produto sem codigo de barras e' um caminho normal no PDV, ver
// 038_pdv_catalogo_colaborativo.sql).

import { useRef, useState } from "react";
import { Barcode, Camera, Loader2, RotateCcw } from "lucide-react";
import { comprimirImagem } from "@/utils/comprimirImagem";

interface Props {
  fotoUrl: string | null;
  ean: string;
  onEanChange: (ean: string) => void;
  onFotoChange: (url: string | null) => void;
}

export function CapturaCodigoBarras({ fotoUrl, ean, onEanChange, onFotoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [decodificado, setDecodificado] = useState<boolean | null>(null);
  const [erro, setErro] = useState("");

  const handleSelecao = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro("");
    setProcessando(true);
    setDecodificado(null);
    const urlObjeto = URL.createObjectURL(arquivo);

    try {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const leitor = new BrowserMultiFormatReader();
        const resultado = await leitor.decodeFromImageUrl(urlObjeto);
        onEanChange(resultado.getText());
        setDecodificado(true);
      } catch {
        // Nao conseguiu ler o codigo da foto — segue so' com a foto, o
        // fornecedor confirma/digita o EAN manualmente se quiser.
        setDecodificado(false);
      }

      const comprimida = await comprimirImagem(arquivo);
      const formData = new FormData();
      formData.append("arquivo", comprimida.arquivoPrincipal);
      formData.append("thumb", comprimida.arquivoThumb);
      const resposta = await fetch("/api/upload/catalogo", { method: "POST", body: formData });
      const resultadoUpload = await resposta.json();
      if (!resultadoUpload.success) throw new Error(resultadoUpload.error || "Falha no upload");
      onFotoChange(resultadoUpload.url);
    } catch (err: any) {
      setErro(err?.message || "Não foi possível processar a foto.");
    } finally {
      URL.revokeObjectURL(urlObjeto);
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
        <Barcode className="w-4 h-4" /> Foto do código de barras
      </label>

      {fotoUrl ? (
        <div className="flex items-center gap-3">
          <img src={fotoUrl} alt="Código de barras" className="w-20 h-20 object-cover rounded-lg border" />
          <div className="flex-1">
            {decodificado === true && <p className="text-sm text-emerald-600 font-medium">Código lido: {ean}</p>}
            {decodificado === false && <p className="text-sm text-amber-600">Não deu pra ler o código sozinho — confira o campo abaixo.</p>}
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
          <span className="text-sm text-gray-600">{processando ? "Processando foto..." : "Tirar foto do código de barras"}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleSelecao} className="hidden" />
      {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}

      <div className="mt-2">
        <label className="text-xs text-gray-500">EAN (confira ou digite se a leitura falhou)</label>
        <input
          value={ean}
          onChange={(e) => onEanChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Opcional — deixe em branco se o produto não tem código de barras"
          inputMode="numeric"
          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
