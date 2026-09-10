'use client';

// Caminho: C:\valente_conecta\app\cartao-virtual\page.tsx
//
// Cartao Valente -- identificacao rapida pra transacao presencial (ver
// proposta "Modo Valente Facil"). Reaproveita o mesmo codigo de conta
// MC-{usuarioId}|{CIDADE} ja usado em /carteira (Receber) -- e' o mesmo QR,
// so' que numa tela pensada pra ser mostrada, nao pra ler saldo. O lojista
// escaneia em /pdv/identificar-cliente com o BarcodeScanner que ja existe.
//
// A foto e' nova (usuarios.foto_url, ver 104_cartao_valente_foto_usuario.sql)
// -- antes so' existia foto do cliente cadastrada pelo lojista, nunca a
// propria foto do usuario.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';
import { comprimirImagem } from '@/utils/comprimirImagem';

export default function CartaoVirtualPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push('/');
      return;
    }
    setUsuario(u);
    setFotoUrl(u.foto_url || null);
  }, [router]);

  if (!usuario) return null;

  const codigo = `MC-${usuario.id}|${(usuario.cidade_base || '').toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(codigo)}`;
  const whatsappFormatado = formatarWhatsapp(usuario.whatsapp);

  const trocarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoFoto(true);
    try {
      const { arquivoPrincipal, arquivoThumb } = await comprimirImagem(arquivo);
      const formData = new FormData();
      formData.append('arquivo', arquivoPrincipal);
      formData.append('thumb', arquivoThumb);
      const respUpload = await fetch('/api/upload/catalogo', { method: 'POST', body: formData });
      const dadosUpload = await respUpload.json();
      if (!dadosUpload.success) throw new Error(dadosUpload.error || 'Falha no upload');

      const respSalvar = await fetch('/api/usuarios/foto', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, fotoUrl: dadosUpload.url }),
      });
      const dadosSalvar = await respSalvar.json();
      if (!dadosSalvar.success) throw new Error(dadosSalvar.error || 'Falha ao salvar');

      setFotoUrl(dadosUpload.url);
      const usuarioAtualizado = { ...usuario, foto_url: dadosUpload.url };
      setUsuario(usuarioAtualizado);
      localStorage.setItem('user_data', JSON.stringify(usuarioAtualizado));
      toast.success('Foto atualizada!');
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível enviar a foto');
    } finally {
      setEnviandoFoto(false);
      if (inputFotoRef.current) inputFotoRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => router.back()} className="p-2 -ml-2" aria-label="Voltar">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Cartão Valente</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center">
          <button
            onClick={() => inputFotoRef.current?.click()}
            disabled={enviandoFoto}
            className="relative w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-md"
            aria-label="Trocar foto"
          >
            {fotoUrl ? (
              <img src={fotoUrl} alt={usuario.nome} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-slate-300" />
            )}
            <span className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-1.5 border-2 border-white">
              <Camera size={13} className="text-white" />
            </span>
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={trocarFoto} />
          {enviandoFoto && <p className="text-xs text-slate-400 mb-2">Enviando foto...</p>}

          <h2 className="text-xl font-black">{usuario.nome}</h2>
          <p className="text-sm text-slate-500 mb-5">{whatsappFormatado}</p>

          <div className="bg-slate-50 rounded-2xl p-4">
            <img src={qrUrl} alt="Código de identificação" className="w-48 h-48" />
          </div>
        </div>

        <p className="text-slate-400 text-sm mt-6 text-center max-w-xs">
          Mostre essa tela pro vendedor escanear na hora de comprar fiado ou receber Moeda Conecta.
        </p>
      </main>
    </div>
  );
}

function formatarWhatsapp(numero: string) {
  const digitos = (numero || '').replace(/\D/g, '');
  if (digitos.length < 10) return numero;
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  if (resto.length === 9) return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
  return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
}
