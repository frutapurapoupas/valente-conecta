"use client";

// Caminho: C:\valente_conecta\components\pdv\BarcodeScanner.tsx
//
// Leitor de codigo de barras com duas entradas, pra atender tanto o
// pequeno comerciante que so' tem o celular quanto quem ja' tem um leitor
// optico USB/Bluetooth:
//
//   1) Camera do celular — decodifica em tempo real via @zxing/browser
//      (biblioteca gratuita, roda no navegador, sem servico pago nenhum).
//   2) Leitor optico fisico — esses leitores funcionam emulando teclado
//      (digitam o codigo rapidinho e mandam Enter), entao um campo de
//      texto com foco automatico ja' resolve sem nenhuma integracao
//      especial: e' so' nao deixar o usuario digitar manualmente rapido
//      igual um leitor faria por engano.
//
// onDetected(codigo) e' chamado nos dois casos, com o mesmo formato de
// callback — quem usa o componente nao precisa saber qual entrada captou.

import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, X } from "lucide-react";
import toast from "react-hot-toast";

interface BarcodeScannerProps {
  onDetected: (codigo: string) => void;
  onClose: () => void;
  titulo?: string;
  instrucaoCamera?: string;
  instrucaoLeitor?: string;
}

export function BarcodeScanner({
  onDetected,
  onClose,
  titulo = "Escanear código de barras",
  instrucaoCamera = "Centralize o código de barras no quadro.",
  instrucaoLeitor = "Funciona com qualquer leitor USB ou Bluetooth configurado como teclado.",
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [modo, setModo] = useState<"camera" | "leitor">("camera");
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [leitorBuffer, setLeitorBuffer] = useState("");

  useEffect(() => {
    if (modo !== "camera") return;
    let cancelado = false;
    let tentativas = 0;
    const MAX_TENTATIVAS = 5;

    async function iniciar() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const { NotFoundException, DecodeHintType, BarcodeFormat } = await import("@zxing/library");

        // Restringe aos formatos de codigo de barras de PRODUTO (o que
        // aparece em nota fiscal/embalagem) em vez de tentar todos os
        // formatos que o zxing sabe ler (inclusive 2D tipo QR/DataMatrix,
        // que nunca vao aparecer aqui) -- isso deixa cada tentativa de
        // decodificacao mais rapida e mais precisa. TRY_HARDER liga uma
        // varredura mais caprichada (mais lenta por frame, mas le' codigo
        // borrado/torto melhor -- combinacao clara pra codigo de barras 1D
        // parado na frente da camera, ao contrario de video em movimento).
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.ITF,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const codeReader = new BrowserMultiFormatReader(hints);

        if (!videoRef.current) return;

        // decodeFromConstraints (em vez de decodeFromVideoDevice) pra poder
        // pedir resolucao maior e autofoco continuo -- resolucao baixa e
        // foco fixo/lento sao a causa mais comum de "camera abre mas nunca
        // le" com codigo de barras 1D fino, mesmo bem enquadrado. facingMode
        // 'environment' (nao listVideoInputDevices(), ver correcao anterior)
        // continua pedindo a camera traseira sem depender de enumerar
        // dispositivos antes de ter permissao.
        const controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              advanced: [{ focusMode: "continuous" } as any],
            },
          },
          videoRef.current,
          (resultado, erro) => {
            if (cancelado) return;
            if (resultado) {
              const texto = resultado.getText();
              onDetected(texto);
              return;
            }
            // NotFoundException e' esperado a cada frame sem codigo visivel --
            // o proprio zxing tenta de novo sozinho nesse caso. Qualquer OUTRO
            // erro (ex: canvas com dimensao 0 no primeiro frame, antes do video
            // reportar largura/altura reais -- comum logo apos abrir a camera
            // no celular) faz o loop de decodificacao do zxing MORRER de vez
            // (sem chamar de novo), deixando o video parado na tela sem nunca
            // mais tentar ler nada. Reinicia o scanner do zero nesse caso.
            const isNotFound = erro instanceof NotFoundException || erro?.name === "NotFoundException";
            if (erro && !isNotFound && tentativas < MAX_TENTATIVAS) {
              tentativas += 1;
              controlsRef.current?.stop();
              controlsRef.current = null;
              setTimeout(() => { if (!cancelado) iniciar(); }, 300);
            }
          }
        );
        controlsRef.current = controls;
      } catch (error: any) {
        setErroCamera(error?.message || "Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [modo, onDetected]);

  useEffect(() => {
    if (modo === "leitor") inputRef.current?.focus();
  }, [modo]);

  const handleLeitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codigo = leitorBuffer.trim();
    if (!codigo) return;
    onDetected(codigo);
    setLeitorBuffer("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <p className="font-bold">{titulo}</p>
        <button onClick={onClose} className="p-1">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2 px-4">
        <button
          onClick={() => setModo("camera")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${modo === "camera" ? "bg-blue-600 text-white" : "bg-white/10 text-gray-300"}`}
        >
          <Camera className="w-4 h-4" /> Câmera
        </button>
        <button
          onClick={() => setModo("leitor")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${modo === "leitor" ? "bg-blue-600 text-white" : "bg-white/10 text-gray-300"}`}
        >
          <Keyboard className="w-4 h-4" /> Leitor óptico
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {modo === "camera" ? (
          erroCamera ? (
            <p className="text-red-400 text-center text-sm max-w-xs">{erroCamera}</p>
          ) : (
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-white/30">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-8 border-2 border-blue-400 rounded-xl pointer-events-none" />
            </div>
          )
        ) : (
          <form onSubmit={handleLeitorSubmit} className="w-full max-w-sm text-center">
            <Keyboard className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-white text-sm mb-3">Aponte o leitor óptico e dispare — o código cai aqui sozinho.</p>
            <input
              ref={inputRef}
              value={leitorBuffer}
              onChange={(e) => setLeitorBuffer(e.target.value)}
              placeholder="Aguardando leitura..."
              autoFocus
              className="w-full bg-white/10 text-white text-center text-lg rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-blue-400"
            />
          </form>
        )}
      </div>

      <p className="text-gray-400 text-xs text-center pb-6 px-6">
        {modo === "camera" ? instrucaoCamera : instrucaoLeitor}
      </p>
    </div>
  );
}
