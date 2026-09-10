'use client';

// Caminho: C:\valente_conecta\app\saude\fila\[unidadeId]\page.tsx
//
// Acompanhamento da senha do paciente (bilhete digital, ver proposta
// "Modo Valente Facil", item 5). Sem "tempo estimado" -- so' mostra
// quantas pessoas estao na frente, que e' o dado real que temos.

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, MapPinCheck, BellRing } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';
import { verificarInscricaoPush, ativarPush, pushSuportadoNoNavegador } from '@/lib/push/pushCliente';

export default function AcompanharFilaSaudePage() {
  const { unidadeId } = useParams<{ unidadeId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const senhaId = searchParams?.get('senha');
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarConviteAviso, setMostrarConviteAviso] = useState(false);
  const [ativandoAviso, setAtivandoAviso] = useState(false);

  useEffect(() => {
    if (!pushSuportadoNoNavegador()) return;
    verificarInscricaoPush().then((jaAtivo) => setMostrarConviteAviso(!jaAtivo));
  }, []);

  const ativarAviso = async () => {
    const usuario = getCurrentUser();
    if (!usuario) return;
    setAtivandoAviso(true);
    try {
      const ok = await ativarPush(usuario.id);
      if (ok) { toast.success('Pronto! A gente te avisa.'); setMostrarConviteAviso(false); }
      else toast.error('Seu navegador bloqueou o aviso. Você ainda pode acompanhar aqui na tela.');
    } finally {
      setAtivandoAviso(false);
    }
  };

  const carregar = useCallback(async () => {
    if (!senhaId) return;
    const resp = await fetch(`/api/saude-fila/${unidadeId}/minha-posicao?senhaId=${senhaId}`);
    const d = await resp.json();
    if (d.success) {
      setDados(d.data);
      if (d.data.avisoReordenacao) {
        toast('Sua posição mudou porque chegou um atendimento prioritário.', { icon: '⚠️', duration: 6000 });
      }
    }
    setCarregando(false);
  }, [unidadeId, senhaId]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, [carregar]);

  const fazerCheckin = async () => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId }),
    });
    const d = await resp.json();
    if (d.success) { toast.success('Chegada confirmada!'); carregar(); } else { toast.error(d.error); }
  };

  if (!senhaId) return <p className="text-center py-20 text-gray-400">Senha não informada.</p>;
  if (carregando || !dados) return <p className="text-center py-20 text-gray-400">Carregando sua senha...</p>;

  const { senha, pessoasNaFrente } = dados;
  const statusLabel: Record<string, string> = {
    aguardando: 'Aguardando — pode ficar de olho daqui de casa',
    presente: 'Você chegou! Aguarde ser chamado',
    em_atendimento: 'É a sua vez!',
    concluido: 'Atendimento concluído',
    cancelado: 'Senha cancelada',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">
      <p className="text-gray-400 text-sm uppercase tracking-wide">Sua senha</p>
      <h1 className="text-6xl font-black mt-1">{String(senha.numero).padStart(3, '0')}</h1>

      {senha.status === 'em_atendimento' ? (
        <div className="mt-6 bg-emerald-500 text-white rounded-2xl px-6 py-4 flex items-center gap-3">
          <CheckCircle2 size={26} />
          <p className="font-bold">{statusLabel[senha.status]}</p>
        </div>
      ) : senha.status === 'concluido' ? (
        <p className="mt-6 text-gray-400">{statusLabel[senha.status]}</p>
      ) : (
        <>
          <p className="mt-4 text-gray-300">{pessoasNaFrente} pessoa{pessoasNaFrente !== 1 ? 's' : ''} na sua frente</p>
          {senha.motivo_prioridade && (
            <span className="mt-2 text-sm bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Prioridade: {senha.motivo_prioridade}</span>
          )}
          <p className="mt-6 text-sm text-gray-500 text-center max-w-xs">{statusLabel[senha.status]}</p>

          {mostrarConviteAviso && senha.status !== 'concluido' && (
            <div className="mt-6 w-full max-w-xs bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-center">
              <p className="text-sm text-amber-200 mb-3">Quer que a gente avise no celular quando chegar sua vez? Assim você não precisa ficar olhando a tela.</p>
              <button
                onClick={ativarAviso}
                disabled={ativandoAviso}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
              >
                <BellRing size={18} /> {ativandoAviso ? 'Ativando...' : 'Sim, me avise'}
              </button>
            </div>
          )}

          {senha.status === 'aguardando' && (
            <button onClick={fazerCheckin} className="mt-8 flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl">
              <MapPinCheck size={18} /> Cheguei na unidade
            </button>
          )}
        </>
      )}

      <button onClick={() => router.push('/saude/fila')} className="mt-10 text-sm text-gray-500 underline">Ver outras unidades</button>
    </div>
  );
}
