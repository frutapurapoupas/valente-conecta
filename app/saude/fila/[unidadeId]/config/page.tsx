'use client';

// Caminho: C:\valente_conecta\app\saude\fila\[unidadeId]\config\page.tsx
//
// Configurações do diretor (ver proposta "Modo Valente Facil", item 5):
// comissão sobre pagamento em dinheiro, retenção do prontuário, e o
// resumo de repasse pendente pra plataforma.

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Settings, Banknote, FileClock, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

function formatarMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function ConfigUnidadeSaudePage() {
  const { unidadeId } = useParams<{ unidadeId: string }>();
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState<any>(null);
  const [semPermissao, setSemPermissao] = useState(false);
  const [comissaoPct, setComissaoPct] = useState('0');
  const [retencao, setRetencao] = useState<'permanente' | 'x_anos'>('permanente');
  const [anosRetencao, setAnosRetencao] = useState('');
  const [repasse, setRepasse] = useState<any>(null);
  const [mpConectado, setMpConectado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = async (usuarioId: string) => {
    const [respConfig, respRepasse] = await Promise.all([
      fetch(`/api/saude-fila/${unidadeId}/config`).then((r) => r.json()),
      fetch(`/api/saude-fila/${unidadeId}/repasse?usuarioId=${usuarioId}`).then((r) => r.json()),
    ]);
    if (respConfig.success) {
      setComissaoPct(String(respConfig.data.comissao_pagamento_dinheiro_pct ?? 0));
      setRetencao(respConfig.data.retencao_prontuario || 'permanente');
      setAnosRetencao(String(respConfig.data.anos_retencao || ''));
      setMpConectado(Boolean(respConfig.mpConectado));
    }
    if (respRepasse.success) setRepasse(respRepasse.data);
    else setSemPermissao(true);
  };

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUsuario(u);
    carregar(u.id);
    if (searchParams?.get('mpConectado')) toast.success('Mercado Pago conectado!');
    if (searchParams?.get('mpErro')) toast.error(searchParams.get('mpErro') as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch(`/api/saude-fila/${unidadeId}/config`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, comissaoPct, retencaoProntuario: retencao, anosRetencao: retencao === 'x_anos' ? anosRetencao : null }),
      });
      const d = await resp.json();
      if (!d.success) { toast.error(d.error); return; }
      toast.success('Configuração salva.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarRepasse = async () => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/repasse`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuario.id }),
    });
    const d = await resp.json();
    if (d.success) { toast.success(`Repasse de ${d.quantidade} atendimento(s) confirmado.`); carregar(usuario.id); } else toast.error(d.error);
  };

  if (semPermissao) return <p className="text-center py-20 text-gray-500">Só o diretor da unidade acessa essa tela.</p>;
  if (!repasse) return <p className="text-center py-20 text-gray-400">Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Settings size={20} />Configurações da unidade</h1>

      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><CreditCard size={16} />Pagamento online (cartão/Pix)</h2>
        <p className="text-sm text-gray-500 mb-3">Pra o paciente poder pagar direto pelo app, conecte a conta Mercado Pago da unidade — o dinheiro cai direto pra ela.</p>
        {mpConectado ? (
          <p className="flex items-center gap-2 text-emerald-600 font-medium text-sm bg-emerald-50 rounded-xl px-4 py-3"><CheckCircle2 size={16} />Conta Mercado Pago conectada</p>
        ) : (
          <a href={`/api/saude-fila/${unidadeId}/mercadopago/conectar?usuarioId=${usuario?.id}`} className="block w-full text-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl">
            Conectar Mercado Pago
          </a>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Banknote size={16} />Comissão da plataforma</h2>
        <p className="text-sm text-gray-500 mb-3">Essa porcentagem vale nos dois casos: descontada automaticamente quando o pagamento é online, e repassada manualmente quando é em dinheiro.</p>
        <div className="flex items-center gap-2 mb-4">
          <input type="number" min="0" max="100" step="0.5" value={comissaoPct} onChange={(e) => setComissaoPct(e.target.value)} className="w-24 border rounded-lg px-3 py-2 text-sm" />
          <span className="text-sm text-gray-500">%</span>
        </div>

        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2 mt-4"><FileClock size={16} />Retenção do prontuário</h2>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setRetencao('permanente')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${retencao === 'permanente' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>Para sempre</button>
          <button onClick={() => setRetencao('x_anos')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${retencao === 'x_anos' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>Por X anos</button>
        </div>
        {retencao === 'x_anos' && (
          <input type="number" min="1" value={anosRetencao} onChange={(e) => setAnosRetencao(e.target.value)} placeholder="Quantos anos" className="w-full border rounded-lg px-3 py-2 text-sm mb-2" />
        )}

        <button onClick={salvar} disabled={salvando} className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>

        <a
          href={`/api/saude-fila/${unidadeId}/prontuario/exportar?usuarioId=${usuario?.id}`}
          className="block w-full mt-2 text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl"
        >
          Baixar backup do prontuário (.json)
        </a>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Repasse pendente</h2>
        <p className="text-sm text-gray-500">Recebido em dinheiro (não repassado ainda)</p>
        <p className="text-2xl font-black text-gray-900">{formatarMoeda(repasse.totalRecebido)}</p>
        <p className="text-sm text-amber-600 font-medium mt-1">Comissão devida: {formatarMoeda(repasse.comissaoDevida)} ({repasse.pct}%)</p>
        {repasse.pendentes.length > 0 ? (
          <button onClick={confirmarRepasse} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl">
            Confirmar repasse de {repasse.pendentes.length} atendimento(s)
          </button>
        ) : (
          <p className="text-sm text-gray-400 mt-4">Nada pendente de repasse agora.</p>
        )}
      </div>
    </div>
  );
}
