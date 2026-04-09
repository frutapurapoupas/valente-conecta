'use client'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useEffect } from 'react';

export default function CameraScanner({ onScanSuccess }: { onScanSuccess: (code: string) => void }) {
  useEffect(() => {
    // Configurações específicas para evitar abrir a galeria
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 20, // Aumentamos os quadros para ser mais rápido
        qrbox: { width: 300, height: 200 },
        rememberLastUsedCamera: true,
        // FORÇA O USO DA CÂMERA E DESABILITA O UPLOAD DE ARQUIVO
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
      }, 
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (error) => {
        // Silencioso para não travar a experiência
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Erro ao limpar scanner", error));
    };
  }, [onScanSuccess]);

  return (
    <div className="border-8 border-valente rounded-60 overflow-hidden bg-black shadow-2xl">
      <div id="reader" className="w-full"></div>
      <div className="bg-valente p-4 text-center">
        <p className="text-black font-black uppercase italic text-2xl">
          Scanner Ativo: Aponte o Código
        </p>
      </div>
    </div>
  );
}