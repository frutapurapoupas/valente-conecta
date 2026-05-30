// app/recarga/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, QrCode, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecargaPage() {
  const router = useRouter();
  const { user } = useApp();
  const [valor, setValor] = useState<number>(10);
  const [valorPersonalizado, setValorPersonalizado] = useState('');
  const [copied, setCopied] = useState(false);

  const valoresSugeridos = [10, 20, 50, 100];

  const handleRecarga = async () => {
    const valorRecarga = valorPersonalizado ? parseFloat(valorPersonalizado) : valor;
    
    if (isNaN(valorRecarga) || valorRecarga <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    // Gerar QR Code PIX
    const chavePix = 'df79fd53-2ce0-4013-b906-44f8076e28a1';
    const nome = 'VALENTE CONECTA';
    const cidade = 'VALENTE';
    const valorStr = valorRecarga.toFixed(2);
    
    // Gerar payload PIX
    const payload = `00020101021126330014BR.GOV.BCB.PIX0111${chavePix}5204000053039865404${valorStr}5802BR5913${nome}6007${cidade}62070503***6304`;
    
    // Abrir aplicativo de pagamento
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`, '_blank');
    
    toast.success('QR Code gerado! Após o pagamento, o saldo será creditado automaticamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">💰 Adicionar Saldo</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4">
          <p className="text-yellow-400 text-sm text-center">
            💡 O valor carregado pode ser usado para desbloquear contatos, serviços e muito mais!
          </p>
        </div>

        {/* Valores sugeridos */}
        <div className="grid grid-cols-4 gap-3">
          {valoresSugeridos.map((v) => (
            <button
              key={v}
              onClick={() => {
                setValor(v);
                setValorPersonalizado('');
              }}
              className={`py-3 rounded-xl font-bold transition-all ${
                valor === v && !valorPersonalizado
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              R$ {v}
            </button>
          ))}
        </div>

        {/* Valor personalizado */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <label className="text-gray-400 text-sm mb-2 block">Valor personalizado (R$)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={valorPersonalizado}
            onChange={(e) => {
              setValorPersonalizado(e.target.value);
              setValor(0);
            }}
            placeholder="Digite o valor desejado"
            className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
          />
        </div>

        {/* Chave PIX */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Chave PIX (copie e cole no seu app bancário)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value="df79fd53-2ce0-4013-b906-44f8076e28a1"
              readOnly
              className="flex-1 px-3 py-2 bg-gray-700 rounded-xl text-white text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText('df79fd53-2ce0-4013-b906-44f8076e28a1');
                setCopied(true);
                toast.success('Chave PIX copiada!');
                setTimeout(() => setCopied(false), 3000);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleRecarga}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg"
        >
          Gerar QR Code PIX
        </button>

        <p className="text-gray-500 text-xs text-center">
          ⚡ O saldo será creditado automaticamente após a confirmação do pagamento
        </p>
      </main>
    </div>
  );
}