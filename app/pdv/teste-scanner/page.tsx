'use client'
import React from 'react';
import CameraScanner from '@/components/pdv/CameraScanner';
import ModalVinculoManual from '@/components/pdv/ModalVinculoManual';
import { useTesteScannerPage } from '@/hooks/useTesteScannerPage';

export default function PaginaTesteReal() {
  const { carrinho, ultimoBip, setUltimoBip, handleScan, modalAberto, setModalAberto, codigoDesconhecido } = useTesteScannerPage()

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <header className="mb-8">
        <h1 className="text-4xl font-black italic text-valente">VALENTE SCANNER v1.0</h1>
        <p className="text-zinc-500 uppercase font-bold">Modo: Unificação de Catálogo</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LADO ESQUERDO: CÂMERA */}
        <section>
          <CameraScanner onScanSuccess={handleScan} />
          <div className="mt-4 p-4 bg-zinc-900 rounded-20 border-2 border-zinc-800">
            <p className="text-zinc-500 text-sm uppercase">Último Código Lido:</p>
            <p className="text-2xl font-black text-emerald-500">{ultimoBip || "AGUARDANDO..."}</p>
          </div>
        </section>

        {/* LADO DIREITO: CARRINHO EM TEMPO REAL */}
        <section className="bg-zinc-900 p-6 rounded-60 border-4 border-zinc-800">
          <h2 className="text-2xl font-black uppercase italic mb-4">Itens Identificados</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {carrinho.length === 0 && (
              <p className="text-zinc-600 italic">Nenhum item bipado ainda...</p>
            )}
            {carrinho.map((item, idx) => (
              <div key={idx} className="bg-black p-4 border-l-8 border-valente flex justify-between items-center">
                <div>
                  <p className="font-black text-xl uppercase">{item.nome_final}</p>
                  <p className="text-zinc-500 text-sm">{item.ean_final}</p>
                </div>
                <span className="text-valente font-black">UN</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL DE INTELIGÊNCIA COMERCIAL (SÓ ABRE SE NÃO TIVER EAN) */}
      {modalAberto && (
        <ModalVinculoManual 
          codigoDesconhecido={codigoDesconhecido} 
          onVinculoConcluido={() => {
            setModalAberto(false);
            setUltimoBip(''); // Limpa para permitir bipar novamente
          }} 
        />
      )}
    </div>
  );
}