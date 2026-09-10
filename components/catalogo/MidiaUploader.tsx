"use client";

// Caminho: C:\valente_conecta\components\catalogo\MidiaUploader.tsx
//
// Upload de imagem reutilizavel por todos os modulos do catalogo. Aplica o
// funil obrigatorio de compressao client-side antes de habilitar o envio
// (ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 3.1 e
// utils/comprimirImagem.ts) — nunca deixa subir o arquivo bruto.
//
// "Remover fundo" (Deep Infra, /api/upload/remover-fundo) e' opt-in via
// prop `permitirRemoverFundo` — e' uma chamada paga por imagem, entao so'
// aparece nos modulos que pedirem explicitamente, nao em todo lugar que usa
// esse componente.

import { useRef, useState } from "react";
import { Upload, X, Loader2, Wand2, PlayCircle } from "lucide-react";
import { comprimirImagem } from "@/utils/comprimirImagem";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

const LIMITE_VIDEO_MB = 20;

interface MidiaUploaderProps {
  midia: MidiaItem[];
  onChange: (midia: MidiaItem[]) => void;
  maximo?: number;
  uploadUrl?: string; // endpoint que recebe FormData e devolve { url, thumb_url }
  permitirRemoverFundo?: boolean;
  // Sem isso, o navegador abre a GALERIA por padrao (o componente e'
  // reusado tambem onde escolher uma foto ja existente faz sentido, ex:
  // fotos de marketplace). So' liga onde faz sentido abrir a camera direto
  // (ex: "foto do produto que voce acabou de comprar", no quiz do
  // consumidor) -- nao muda o comportamento de quem ja usa o componente.
  preferirCamera?: boolean;
  // Opt-in (ex: fórum de construção) -- alem de imagem, aceita video.
  // Sem compressao (nao existe pipeline de compressao de video no
  // client), so' um limite de tamanho. Continua abrindo o seletor nativo
  // do navegador, que no celular ja oferece "Câmera"/"Gravar vídeo" e
  // "Galeria" quando o accept inclui os dois tipos.
  aceitarVideo?: boolean;
}

export function MidiaUploader({ midia, onChange, maximo = 6, uploadUrl = "/api/upload/catalogo", permitirRemoverFundo = false, preferirCamera = false, aceitarVideo = false }: MidiaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [removendoFundoIndex, setRemovendoFundoIndex] = useState<number | null>(null);

  const removerFundo = async (index: number) => {
    setErro("");
    setRemovendoFundoIndex(index);
    try {
      const resp = await fetch("/api/upload/remover-fundo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: midia[index].url }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error || "Falha ao remover fundo");
      const novaMidia = [...midia];
      novaMidia[index] = { ...novaMidia[index], url: resp.url, thumb_url: resp.url };
      onChange(novaMidia);
    } catch (err: any) {
      setErro(err?.message || "Não foi possível remover o fundo.");
    } finally {
      setRemovendoFundoIndex(null);
    }
  };

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
        const ehVideo = arquivo.type.startsWith("video/");

        if (ehVideo) {
          if (arquivo.size > LIMITE_VIDEO_MB * 1024 * 1024) {
            throw new Error(`Vídeo muito grande — máximo de ${LIMITE_VIDEO_MB}MB.`);
          }
          const formData = new FormData();
          formData.append("arquivo", arquivo);
          const resposta = await fetch(uploadUrl, { method: "POST", body: formData });
          const resultado = await resposta.json();
          if (!resultado.success) throw new Error(resultado.error || "Falha no upload do vídeo");

          novasMidias.push({
            tipo: "video",
            url: resultado.url,
            thumb_url: resultado.thumb_url,
            ordem: midia.length + novasMidias.length,
          });
          continue;
        }

        // Funil obrigatorio pra imagem: nada e enviado sem passar pela compressao.
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
      setErro(err?.message || "Não foi possível processar o arquivo.");
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
            {item.tipo === "video" ? (
              <>
                <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PlayCircle className="w-8 h-8 text-white drop-shadow" />
                </div>
              </>
            ) : (
              <img src={item.thumb_url || item.url} alt="" className="w-full h-full object-cover" />
            )}
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
            {permitirRemoverFundo && item.tipo !== "video" && (
              <button
                type="button"
                onClick={() => removerFundo(index)}
                disabled={removendoFundoIndex === index}
                title="Remover fundo"
                className="absolute bottom-1 right-1 p-1 bg-white/90 text-gray-700 rounded-full hover:bg-white disabled:opacity-60"
              >
                {removendoFundoIndex === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              </button>
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
      <input
        ref={inputRef}
        type="file"
        accept={aceitarVideo ? "image/*,video/*" : "image/*"}
        multiple={maximo > 1}
        capture={preferirCamera ? "environment" : undefined}
        onChange={handleSelecao}
        className="hidden"
      />
      {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}
      <p className="text-xs text-gray-400 mt-2">
        {aceitarVideo
          ? `Fotos são comprimidas automaticamente. Vídeos são enviados como estão (máximo ${LIMITE_VIDEO_MB}MB).`
          : "As imagens são comprimidas automaticamente antes do envio (economiza dados e espaço)."}
      </p>
    </div>
  );
}
