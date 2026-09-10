'use client';

// Caminho: C:\valente_conecta\app\saude\fila\[unidadeId]\atendente\page.tsx
//
// Painel do atendente/medico (nivel 'administrar' ou 'atender', ver
// lib/saude/nivelAcesso.ts). Fila ja vem ordenada por prioridade legal do
// servidor -- so' renderiza na ordem que chega.

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Phone, UserPlus, CheckCircle2, PhoneCall, X, FileText, CalendarPlus, DollarSign, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

const TIER_LABEL: Record<number, { texto: string; cor: string }> = {
  1: { texto: 'Superprioridade 80+', cor: 'bg-red-100 text-red-700' },
  2: { texto: 'Prioridade legal', cor: 'bg-amber-100 text-amber-700' },
  3: { texto: 'Ampla concorrência', cor: 'bg-gray-100 text-gray-600' },
};

export default function AtendentePanelPage() {
  const { unidadeId } = useParams<{ unidadeId: string }>();
  const [usuario, setUsuario] = useState<any>(null);
  const [fila, setFila] = useState<any[]>([]);
  const [semPermissao, setSemPermissao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [modalWalkin, setModalWalkin] = useState(false);
  const [modalAgendar, setModalAgendar] = useState(false);

  const carregar = useCallback(async (usuarioId: string) => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}?usuarioId=${usuarioId}`);
    const d = await resp.json();
    if (!d.success) { setSemPermissao(true); setCarregando(false); return; }
    setFila(d.data);
    setCarregando(false);
  }, [unidadeId]);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUsuario(u);
    carregar(u.id);
    const t = setInterval(() => carregar(u.id), 10000);
    return () => clearInterval(t);
  }, [carregar]);

  const chamar = async (senhaId: string) => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/chamar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId, usuarioId: usuario.id }),
    });
    const d = await resp.json();
    if (d.success) { toast.success('Chamado!'); carregar(usuario.id); } else toast.error(d.error);
  };

  const concluir = async (senhaId: string) => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/concluir`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId, usuarioId: usuario.id }),
    });
    const d = await resp.json();
    if (d.success) { toast.success('Atendimento concluído.'); carregar(usuario.id); } else toast.error(d.error);
  };

  const confirmarPagamento = async (senhaId: string) => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/confirmar-pagamento`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId, usuarioId: usuario.id }),
    });
    const d = await resp.json();
    if (d.success) { toast.success('Pagamento confirmado.'); carregar(usuario.id); } else toast.error(d.error);
  };

  if (carregando) return <p className="text-center py-20 text-gray-400">Carregando...</p>;
  if (semPermissao) return <p className="text-center py-20 text-gray-500">Você não tem acesso à fila dessa unidade.</p>;

  const aguardando = fila.filter((f) => f.status === 'aguardando');
  const presentes = fila.filter((f) => f.status === 'presente' || f.status === 'em_atendimento');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Fila de hoje</h1>
        <div className="flex gap-2">
          <a href={`/saude/fila/${unidadeId}/config`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold" title="Configurações (diretor)">
            <Settings size={16} />
          </a>
          <button onClick={() => setModalAgendar(true)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <CalendarPlus size={16} /> Agendar eletivo
          </button>
          <button onClick={() => setModalWalkin(true)} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <UserPlus size={16} /> Chegou sem app
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Phone size={14} />A caminho ({aguardando.length})</h2>
          <div className="space-y-2">
            {aguardando.length === 0 && <p className="text-sm text-gray-400">Ninguém a caminho agora.</p>}
            {aguardando.map((s) => <CardSenha key={s.id} s={s} unidadeId={String(unidadeId)} />)}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} />Presentes ({presentes.length})</h2>
          <div className="space-y-2">
            {presentes.length === 0 && <p className="text-sm text-gray-400">Ninguém presente agora.</p>}
            {presentes.map((s) => (
              <CardSenha key={s.id} s={s} unidadeId={String(unidadeId)}>
                {s.status_pagamento === 'aguardando' && (
                  <button onClick={() => confirmarPagamento(s.id)} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg" title="Confirmar recebimento em dinheiro">
                    <DollarSign size={14} /> Confirmar pgto
                  </button>
                )}
                {s.status === 'presente' && (
                  <button onClick={() => chamar(s.id)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                    <PhoneCall size={14} /> Chamar
                  </button>
                )}
                {s.status === 'em_atendimento' && (
                  <button onClick={() => concluir(s.id)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={14} /> Concluir
                  </button>
                )}
              </CardSenha>
            ))}
          </div>
        </div>
      </main>

      {modalWalkin && (
        <ModalWalkin
          unidadeId={String(unidadeId)}
          usuarioId={usuario.id}
          onFechar={() => setModalWalkin(false)}
          onRegistrado={() => { setModalWalkin(false); carregar(usuario.id); }}
        />
      )}
      {modalAgendar && (
        <ModalAgendar
          unidadeId={String(unidadeId)}
          usuarioAtendenteId={usuario.id}
          onFechar={() => setModalAgendar(false)}
        />
      )}
    </div>
  );
}

function ModalAgendar({ unidadeId, usuarioAtendenteId, onFechar }: { unidadeId: string; usuarioAtendenteId: string; onFechar: () => void }) {
  const [whatsapp, setWhatsapp] = useState('');
  const [data, setData] = useState('');
  const [enviando, setEnviando] = useState(false);

  const agendar = async () => {
    if (!whatsapp.trim() || !data) { toast.error('Informe o WhatsApp e a data.'); return; }
    setEnviando(true);
    try {
      const resp = await fetch(`/api/saude-fila/${unidadeId}/agendar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioAtendenteId, pacienteWhatsapp: whatsapp, dataAgendada: data }),
      });
      const d = await resp.json();
      if (!d.success) { toast.error(d.error); return; }
      toast.success(`Agendado pra ${data.split('-').reverse().join('/')}: ${d.pacienteNome}`);
      onFechar();
    } finally {
      setEnviando(false);
    }
  };

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">Agendar consulta eletiva</h2>
          <button onClick={onFechar}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">O paciente precisa já ter conta no Valente Conecta. No dia marcado, ele entra sozinho na fila do dia.</p>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp do paciente" className="w-full border rounded-xl px-4 py-3 text-sm mb-3" />
        <input type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm mb-5" />
        <button onClick={agendar} disabled={enviando} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {enviando ? 'Agendando...' : 'Agendar'}
        </button>
      </div>
    </div>
  );
}

function CardSenha({ s, unidadeId, children }: { s: any; unidadeId: string; children?: React.ReactNode }) {
  const tier = TIER_LABEL[s.prioridade_tier] || TIER_LABEL[3];
  const nome = s.usuarios?.nome || s.nome_avulso || 'Sem nome';
  return (
    <div className="bg-white rounded-xl border p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0 text-sm">{String(s.numero).padStart(3, '0')}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{nome}</p>
        <span className={`inline-block text-sm px-2 py-0.5 rounded-full mt-0.5 ${tier.cor}`}>{tier.texto}</span>
        {s.status_pagamento === 'aguardando' && (
          <span className="block text-sm text-amber-600 font-medium mt-0.5">
            Aguardando {s.valor_pagamento ? `R$ ${Number(s.valor_pagamento).toFixed(2)}` : 'pagamento'} em dinheiro
          </span>
        )}
      </div>
      {s.usuario_id && (
        <a href={`/saude/fila/${unidadeId}/prontuario/${s.usuario_id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 shrink-0" title="Prontuário">
          <FileText size={17} />
        </a>
      )}
      {children}
    </div>
  );
}

function ModalWalkin({ unidadeId, usuarioId, onFechar, onRegistrado }: { unidadeId: string; usuarioId: string; onFechar: () => void; onRegistrado: () => void }) {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);

  const registrar = async () => {
    if (!nome.trim()) { toast.error('Informe o nome.'); return; }
    setEnviando(true);
    try {
      const resp = await fetch(`/api/saude-fila/${unidadeId}/walkin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId, nome,
          autodeclaracao: {
            idade: Number(idade) || 0,
            gestante: flags.gestante, lactante: flags.lactante, comCriancaDeColo: flags.criancaColo,
            pcd: flags.pcd, autista: flags.autista, obesidade: flags.obesidade,
          },
        }),
      });
      const d = await resp.json();
      if (!d.success) { toast.error(d.error); return; }
      toast.success('Registrado na fila.');
      onRegistrado();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">Chegou sem passar pelo app</h2>
          <button onClick={onFechar}><X size={18} className="text-gray-400" /></button>
        </div>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da pessoa" className="w-full border rounded-xl px-4 py-3 text-sm mb-3" />
        <input type="number" value={idade} onChange={(e) => setIdade(e.target.value)} placeholder="Idade" className="w-full border rounded-xl px-4 py-3 text-sm mb-3" />
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { k: 'gestante', l: 'Gestante' }, { k: 'lactante', l: 'Lactante' },
            { k: 'criancaColo', l: 'Criança de colo' }, { k: 'pcd', l: 'PCD' },
            { k: 'autista', l: 'Autista' }, { k: 'obesidade', l: 'Obesidade' },
          ].map((op) => (
            <button key={op.k} onClick={() => setFlags((f) => ({ ...f, [op.k]: !f[op.k] }))} className={`p-2.5 rounded-lg border text-sm ${flags[op.k] ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
              {op.l}
            </button>
          ))}
        </div>
        <button onClick={registrar} disabled={enviando} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {enviando ? 'Registrando...' : 'Registrar na fila'}
        </button>
      </div>
    </div>
  );
}
