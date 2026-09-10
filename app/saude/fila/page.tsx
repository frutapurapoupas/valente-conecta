'use client';

// Caminho: C:\valente_conecta\app\saude\fila\page.tsx
//
// Fila Virtual de Saude -- lado do paciente (ver proposta "Modo Valente
// Facil", item 5). Lista as unidades participantes e deixa entrar na
// fila do dia, com autodeclaracao de prioridade legal.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, MapPin, ChevronRight, FlaskConical, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';
import type { AutodeclaracaoPrioridade } from '@/lib/saude/prioridadeLegal';

interface Unidade {
  id: string;
  nome: string;
  tipo: 'hospital' | 'clinica' | 'laboratorio';
  regime: 'sus' | 'particular' | 'hibrido';
  endereco: string | null;
  unidade_saude_servicos: { id: string; nome: string; tipo: string; preco: number }[];
}

const ICONE_TIPO: Record<string, any> = { hospital: HeartPulse, clinica: Building2, laboratorio: FlaskConical };

export default function FilaSaudePage() {
  const router = useRouter();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [unidadeAberta, setUnidadeAberta] = useState<Unidade | null>(null);
  const [servicoId, setServicoId] = useState('');
  const [idade, setIdade] = useState('');
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'online'>('dinheiro');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/saude-fila/unidades').then((r) => r.json()).then((d) => { if (d.success) setUnidades(d.data); setCarregando(false); });
  }, []);

  const entrarNaFila = async () => {
    const usuario = getCurrentUser();
    if (!usuario) { toast.error('Entre na sua conta primeiro.'); router.push('/'); return; }
    if (!unidadeAberta) return;

    setEnviando(true);
    try {
      const autodeclaracao: AutodeclaracaoPrioridade = {
        idade: Number(idade) || 0,
        gestante: flags.gestante,
        lactante: flags.lactante,
        comCriancaDeColo: flags.criancaColo,
        pcd: flags.pcd,
        autista: flags.autista,
        obesidade: flags.obesidade,
      };
      const resp = await fetch('/api/saude-fila/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidadeId: unidadeAberta.id, usuarioId: usuario.id, servicoId: servicoId || null, autodeclaracao, formaPagamento }),
      });
      const dados = await resp.json();
      if (!dados.success) { toast.error(dados.error); return; }
      if (dados.avisoPagamento) toast.error(dados.avisoPagamento);
      if (dados.checkoutUrl) {
        window.location.href = dados.checkoutUrl;
        return;
      }
      router.push(`/saude/fila/${unidadeAberta.id}?senha=${dados.data.id}`);
    } catch {
      toast.error('Não foi possível entrar na fila.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><HeartPulse className="text-red-500" size={22} />Fila Virtual de Saúde</h1>
        <p className="text-sm text-gray-500 mt-1">Entre na fila de casa e acompanhe sua vez pelo celular.</p>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        {carregando && <p className="text-center text-gray-400 py-10">Carregando unidades...</p>}
        {!carregando && unidades.length === 0 && (
          <p className="text-center text-gray-400 py-10">Nenhuma unidade participando da fila virtual ainda.</p>
        )}
        {unidades.map((u) => {
          const Icone = ICONE_TIPO[u.tipo] || HeartPulse;
          return (
            <button
              key={u.id}
              onClick={() => setUnidadeAberta(u)}
              className="w-full bg-white rounded-2xl border p-4 flex items-center gap-3 text-left hover:border-red-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"><Icone size={22} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{u.nome}</p>
                {u.endereco && <p className="text-sm text-gray-500 flex items-center gap-1 truncate"><MapPin size={12} />{u.endereco}</p>}
              </div>
              <ChevronRight className="text-gray-300 shrink-0" size={20} />
            </button>
          );
        })}
      </main>

      {unidadeAberta && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900">{unidadeAberta.nome}</h2>
            <p className="text-sm text-gray-500 mb-5">Antes de entrar na fila, conta pra gente:</p>

            {unidadeAberta.unidade_saude_servicos?.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">O que você precisa</label>
                <div className="space-y-2">
                  {unidadeAberta.unidade_saude_servicos.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServicoId(s.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm ${servicoId === s.id ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    >
                      <span>{s.nome}</span>
                      {unidadeAberta.regime !== 'sus' && s.preco > 0 && <span className="font-semibold">{s.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {unidadeAberta.regime !== 'sus' && servicoId && (
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Como vai pagar</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFormaPagamento('online')} className={`p-3 rounded-xl border text-sm font-medium ${formaPagamento === 'online' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>Cartão / Pix agora</button>
                  <button onClick={() => setFormaPagamento('dinheiro')} className={`p-3 rounded-xl border text-sm font-medium ${formaPagamento === 'dinheiro' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>Dinheiro na unidade</button>
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sua idade</label>
              <input type="number" min="0" max="120" value={idade} onChange={(e) => setIdade(e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm" placeholder="Ex: 65" />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Isso se aplica a você? (atendimento prioritário por lei)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: 'gestante', l: 'Gestante' },
                  { k: 'lactante', l: 'Lactante' },
                  { k: 'criancaColo', l: 'Criança de colo' },
                  { k: 'pcd', l: 'Pessoa com deficiência' },
                  { k: 'autista', l: 'Autista' },
                  { k: 'obesidade', l: 'Obesidade' },
                ].map((op) => (
                  <button
                    key={op.k}
                    onClick={() => setFlags((f) => ({ ...f, [op.k]: !f[op.k] }))}
                    className={`p-3 rounded-xl border text-sm font-medium ${flags[op.k] ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}
                  >
                    {op.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setUnidadeAberta(null)} className="flex-1 py-3 rounded-xl border font-semibold text-gray-600">Cancelar</button>
              <button onClick={entrarNaFila} disabled={enviando} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50">
                {enviando ? 'Entrando...' : 'Entrar na fila'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
