'use client';

// Caminho: C:\valente_conecta\app\pdv\identificar-cliente\page.tsx
//
// Lado do lojista do Cartao Valente: escaneia o QR que o cliente mostra em
// /cartao-virtual (mesmo formato MC-{id}|{cidade} ja lido em /carteira) e
// mostra foto + nome + whatsapp + fiado que ESSE lojista tem com esse
// cliente (nunca de outra loja -- ver app/api/pdv/identificar-cliente).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, User, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';
import { BarcodeScanner } from '@/components/pdv/BarcodeScanner';

interface Resultado {
  usuario: { id: string; nome: string; whatsapp: string; foto_url: string | null };
  fiado: { clienteId: string; limiteCredito: number; saldoDevedor: number } | null;
}

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function IdentificarClientePage() {
  const router = useRouter();
  const [escaneando, setEscaneando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const lerCodigo = async (codigo: string) => {
    setEscaneando(false);
    const usuario = getCurrentUser();
    if (!usuario) return;
    setCarregando(true);
    setResultado(null);
    try {
      const resp = await fetch(`/api/pdv/identificar-cliente?codigo=${encodeURIComponent(codigo)}&donoId=${usuario.id}`);
      const dados = await resp.json();
      if (!dados.success) {
        toast.error(dados.error || 'Não foi possível identificar');
        return;
      }
      setResultado(dados);
    } catch {
      toast.error('Erro ao consultar o cliente');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2" aria-label="Voltar">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Identificar cliente</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {!resultado && (
          <div className="bg-white rounded-2xl border p-6 text-center mt-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine size={28} />
            </div>
            <p className="text-gray-600 text-sm mb-4">Escaneie o Cartão Valente que o cliente mostra na tela dele.</p>
            <button
              onClick={() => setEscaneando(true)}
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {carregando ? 'Consultando...' : 'Escanear cartão'}
            </button>
          </div>
        )}

        {resultado && (
          <div className="bg-white rounded-2xl border p-6 mt-4 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
              {resultado.usuario.foto_url ? (
                <img src={resultado.usuario.foto_url} alt={resultado.usuario.nome} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-300" />
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{resultado.usuario.nome}</h2>
            <a
              href={`https://wa.me/55${resultado.usuario.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-600 font-medium mt-1"
            >
              <MessageCircle size={14} /> {resultado.usuario.whatsapp}
            </a>

            <div className="w-full mt-5 pt-5 border-t">
              {resultado.fiado ? (
                <>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Fiado nesta loja</p>
                  <p className="text-2xl font-black text-gray-900">
                    {formatarMoeda(resultado.fiado.saldoDevedor)}
                    <span className="text-sm font-normal text-gray-400"> de {formatarMoeda(resultado.fiado.limiteCredito)}</span>
                  </p>
                </>
              ) : (
                <div className="flex items-start gap-2 text-left text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  Esse cliente ainda não tem fiado cadastrado nesta loja.
                </div>
              )}
            </div>

            <button
              onClick={() => setResultado(null)}
              className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold"
            >
              Escanear outro cliente
            </button>
          </div>
        )}
      </main>

      {escaneando && (
        <BarcodeScanner
          titulo="Escanear Cartão Valente"
          onDetected={(codigo) => lerCodigo(codigo)}
          onClose={() => setEscaneando(false)}
        />
      )}
    </div>
  );
}
