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
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [modo, setModo] = useState<"camera" | "leitor">("camera");
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [leitorBuffer, setLeitorBuffer] = useState("");

  useEffect(() => {
    if (modo !== "camera") return;
    let cancelado = false;

    async function iniciar() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const codeReader = new BrowserMultiFormatReader();
        const dispositivos = await BrowserMultiFormatReader.listVideoInputDevices();
        // Prefere a camera traseira (facing environment) quando da' pra
        // identificar pelo label — celular costuma ter a de tras melhor
        // pra ler codigo de barras de perto.
        const traseira = dispositivos.find((d) => /back|tras|rear|environment/i.test(d.label));
        const deviceId = (traseira || dispositivos[0])?.deviceId;

        if (!deviceId || !videoRef.current) {
          setErroCamera("Nenhuma câmera encontrada neste dispositivo.");
          return;
        }

        const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (resultado, erro) => {
          if (cancelado) return;
          if (resultado) {
            const texto = resultado.getText();
            onDetected(texto);
          }
        });
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
        <p className="font-bold">Escanear código de barras</p>
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
        {modo === "camera" ? "Centralize o código de barras no quadro." : "Funciona com qualquer leitor USB ou Bluetooth configurado como teclado."}
      </p>
    </div>
  );
}
