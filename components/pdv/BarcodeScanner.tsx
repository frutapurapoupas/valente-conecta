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
import { Camera, Keyboard, X, Aperture } from "lucide-react";
import toast from "react-hot-toast";

interface BarcodeScannerProps {
  onDetected: (codigo: string, fotoBlob?: Blob) => void;
  onClose: () => void;
  titulo?: string;
  instrucaoCamera?: string;
  instrucaoLeitor?: string;
  // QR code (nota fiscal/cupom) e' formato diferente dos codigos de produto
  // -- so' entra na lista de formatos aceitos quando pedido explicitamente,
  // pra nao deixar a leitura de codigo de produto mais lenta/imprecisa
  // tentando reconhecer um formato que nunca vai aparecer ali.
  incluirQrCode?: boolean;
  // Quando true, ao detectar o codigo com sucesso, tambem gera uma foto
  // (o proprio recorte usado pra decodificar) e manda no 2o parametro do
  // onDetected -- usado quando o chamador precisa ARQUIVAR a foto como
  // comprovante (ex: QR code da nota), nao so' o valor decodificado.
  capturarFoto?: boolean;
}

export function BarcodeScanner({
  onDetected,
  onClose,
  titulo = "Escanear código de barras",
  instrucaoCamera = "Centralize o código de barras no quadro. A leitura tenta sozinha, mas você pode tocar em \"Tirar foto agora\" pra forçar.",
  instrucaoLeitor = "Funciona com qualquer leitor USB ou Bluetooth configurado como teclado.",
  incluirQrCode = false,
  capturarFoto = false,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [modo, setModo] = useState<"camera" | "leitor">("camera");
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [leitorBuffer, setLeitorBuffer] = useState("");
  const [capturando, setCapturando] = useState(false);
  // A leitura automatica roda sozinha, mas pode nao pegar (foco, reflexo,
  // angulo) mesmo com o codigo bem visivel -- esse botao deixa o usuario
  // FORCAR uma captura na hora que achar que esta' bom, em vez de ficar
  // dependente so' do loop automatico tentar de novo sozinho.
  const capturarManualRef = useRef<(() => void | Promise<void>) | null>(null);

  // INSET_PX precisa bater com o "inset-8" (2rem = 32px) do quadro-guia
  // desenhado por cima do video mais abaixo -- e' usado aqui pra recortar
  // exatamente essa mesma area antes de tentar ler o codigo.
  const INSET_PX = 32;

  useEffect(() => {
    if (modo !== "camera") return;
    let cancelado = false;
    let loopTimeoutId: ReturnType<typeof setTimeout> | undefined;

    async function iniciar() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const { NotFoundException, DecodeHintType, BarcodeFormat } = await import("@zxing/library");

        // Restringe aos formatos de codigo de barras de PRODUTO (o que
        // aparece em nota fiscal/embalagem) em vez de tentar todos os
        // formatos que o zxing sabe ler (inclusive 2D tipo QR/DataMatrix,
        // que nunca vao aparecer aqui). TRY_HARDER liga uma varredura mais
        // caprichada (mais lenta, mas le' codigo borrado/torto melhor --
        // faz sentido aqui porque decodificamos so' um recorte por vez,
        // nao o video inteiro a toda hora).
        const formatos = [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.ITF,
        ];
        if (incluirQrCode) formatos.push(BarcodeFormat.QR_CODE);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formatos);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const codeReader = new BrowserMultiFormatReader(hints);

        if (!videoRef.current) return;

        // facingMode 'environment' pede a camera traseira direto via
        // getUserMedia, sem depender de listVideoInputDevices()/
        // enumerateDevices() (que no celular devolve lista vazia ate' a
        // permissao ja' ter sido concedida antes -- causava "nenhuma camera
        // encontrada" no primeiro uso mesmo com camera disponivel).
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: "continuous" } as any],
          },
        });
        if (cancelado) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Em vez de deixar o zxing decodificar o VIDEO INTEIRO a cada
        // quadro (o que ele faz sozinho com decodeFromConstraints/
        // decodeFromVideoDevice), o loop abaixo recorta so' a area do
        // quadro-guia azul antes de cada tentativa. Isso ajuda de duas
        // formas: 1) tira do meio do caminho a mesa, a embalagem ao redor
        // etc., que so' atrapalham o decodificador; 2) ao ampliar esse
        // recorte antes de ler, o codigo de barras fica com mais pixels de
        // largura (mais facil de distinguir as listras), em vez de ser so'
        // uma fatia pequena dentro do quadro inteiro em alta resolucao.
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Recorta o video no canvas seguindo a area do quadro-guia (mesma
        // logica pro loop automatico e pra captura manual) -- devolve false
        // se o video ainda nao tem dimensao real (comeco do stream).
        const recortarQuadro = () => {
          if (!videoRef.current || !previewBoxRef.current || !ctx) return false;
          const video = videoRef.current;
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          if (vw <= 0 || vh <= 0) return false;

          const caixa = previewBoxRef.current.getBoundingClientRect();
          const fracX = Math.min(0.4, INSET_PX / caixa.width);
          const fracY = Math.min(0.4, INSET_PX / caixa.height);

          // object-cover: o video preenche o quadrado cortando o excesso no
          // eixo mais largo, centralizado -- reproduz esse mesmo corte pra
          // achar, dentro do frame NATIVO da camera, a mesma area que o
          // usuario ve dentro do quadro-guia na tela.
          const lado = Math.min(vw, vh);
          const offX = (vw - lado) / 2;
          const offY = (vh - lado) / 2;
          const gx = offX + lado * fracX;
          const gy = offY + lado * fracY;
          const gw = lado * (1 - 2 * fracX);
          const gh = lado * (1 - 2 * fracY);

          const ESCALA = 2;
          canvas.width = Math.round(gw * ESCALA);
          canvas.height = Math.round(gh * ESCALA);
          ctx.drawImage(video, gx, gy, gw, gh, 0, 0, canvas.width, canvas.height);
          return true;
        };

        const confirmarDetectado = (texto: string) => {
          if (capturarFoto) {
            // O proprio recorte que decodificou com sucesso vira a foto —
            // nao precisa de uma segunda captura separada.
            canvas.toBlob((blob) => onDetected(texto, blob || undefined), "image/jpeg", 0.85);
          } else {
            onDetected(texto);
          }
        };

        const tentarLer = () => {
          if (cancelado) return;
          if (recortarQuadro()) {
            try {
              confirmarDetectado(codeReader.decodeFromCanvas(canvas).getText());
              return;
            } catch (erro: any) {
              const isNotFound = erro instanceof NotFoundException || erro?.name === "NotFoundException";
              if (!isNotFound) console.error("Erro ao decodificar código de barras:", erro);
            }
          }
          loopTimeoutId = setTimeout(tentarLer, 300);
        };

        // Captura forcada pelo usuario (botao "Tirar foto") -- tenta
        // decodificar o quadro atual e, se conseguir, segue como se o loop
        // automatico tivesse achado. Se o zxing (leitura por padrao de
        // barras) nao conseguir, tenta uma SEGUNDA vez com IA de visao
        // (Gemini, gratuito e sem limite) antes de desistir -- ela le os
        // numeros impressos embaixo das barras, o que costuma funcionar
        // mesmo com reflexo/angulo que atrapalha a leitura tradicional. Se
        // nem assim conseguir mas a etapa EXIGE foto (capturarFoto), sobe a
        // foto mesmo com codigo vazio, pra nao deixar o usuario travado.
        capturarManualRef.current = async () => {
          if (!recortarQuadro()) {
            toast.error("Câmera ainda não está pronta, tenta de novo em 1 segundo.");
            return;
          }
          try {
            confirmarDetectado(codeReader.decodeFromCanvas(canvas).getText());
            return;
          } catch {
            // Nao leu sozinho -- tenta com IA antes de desistir.
          }

          const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
          if (!blob) {
            toast.error("Não deu pra capturar a foto. Tente de novo.");
            return;
          }

          try {
            const formData = new FormData();
            formData.append("arquivo", blob, "codigo.jpg");
            const respIA = await fetch("/api/codigo-barras/ler-com-ia", { method: "POST", body: formData }).then((r) => r.json());
            if (respIA?.success && respIA.codigo) {
              onDetected(respIA.codigo, capturarFoto ? blob : undefined);
              return;
            }
          } catch {
            // IA indisponivel/erro de rede -- segue pro fallback abaixo.
          }

          if (capturarFoto) {
            toast("Foto salva, mas não deu pra ler o número (nem com IA).", { icon: "📷" });
            onDetected("", blob);
          } else {
            toast.error("Não deu pra ler o código, nem com IA. Ajuste o foco/ângulo e tente de novo.");
          }
        };

        tentarLer();
      } catch (error: any) {
        setErroCamera(error?.message || "Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      clearTimeout(loopTimeoutId);
      capturarManualRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [modo, onDetected, incluirQrCode, capturarFoto]);

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
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <div ref={previewBoxRef} className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/30">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-8 border-2 border-blue-400 rounded-xl pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={async () => {
                  setCapturando(true);
                  try {
                    await capturarManualRef.current?.();
                  } finally {
                    setCapturando(false);
                  }
                }}
                disabled={capturando}
                className="flex items-center gap-2 bg-white text-gray-800 font-semibold px-5 py-3 rounded-full shadow-lg disabled:opacity-60"
              >
                <Aperture className="w-5 h-5" /> {capturando ? "Lendo o código..." : "Tirar foto agora"}
              </button>
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
