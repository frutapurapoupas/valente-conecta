'use client';

// Caminho: C:\valente_conecta\app\saude\fila\[unidadeId]\prontuario\[usuarioId]\page.tsx
//
// Prontuario do paciente do lado da equipe (nivel 'administrar' ou
// 'atender' -- ver lib/saude/nivelAcesso.ts). Acessado a partir do
// painel do atendente, clicando numa senha.

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Paperclip, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

export default function ProntuarioStaffPage() {
  const { unidadeId, usuarioId } = useParams<{ unidadeId: string; usuarioId: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [itens, setItens] = useState<any[] | null>(null);
  const [semPermissao, setSemPermissao] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);

  const carregar = (solicitanteId: string) => {
    fetch(`/api/saude-fila/prontuario?usuarioId=${usuarioId}&unidadeId=${unidadeId}&solicitanteId=${solicitanteId}`)
      .then((r) => r.json())
      .then((d) => { if (!d.success) { setSemPermissao(true); return; } setItens(d.data); });
  };

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setStaff(u);
    carregar(u.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (semPermissao) return <p className="text-center py-20 text-gray-500">Você não tem acesso ao prontuário dessa unidade.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2" aria-label="Voltar"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold text-gray-900">Prontuário</h1>
        </div>
        <button onClick={() => setModalNovo(true)} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold">
          <Plus size={15} /> Novo registro
        </button>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        {itens === null && <p className="text-center text-gray-400 py-10">Carregando...</p>}
        {itens?.length === 0 && <p className="text-center text-gray-400 py-10">Nenhum registro ainda.</p>}
        {itens?.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-900">{item.titulo}</span>
            </div>
            <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('pt-BR')} · registrado por {item.usuarios?.nome || '—'}</p>
            {item.conteudo && <p className="text-sm text-gray-700 mt-2">{item.conteudo}</p>}
            {item.anexo_url && (
              <a href={item.anexo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium mt-2">
                <Paperclip size={13} /> Ver anexo
              </a>
            )}
          </div>
        ))}
      </main>

      {modalNovo && staff && (
        <ModalNovoRegistro
          unidadeId={String(unidadeId)}
          usuarioId={String(usuarioId)}
          criadoPor={staff.id}
          onFechar={() => setModalNovo(false)}
          onCriado={() => { setModalNovo(false); carregar(staff.id); }}
        />
      )}
    </div>
  );
}

function ModalNovoRegistro({ unidadeId, usuarioId, criadoPor, onFechar, onCriado }: any) {
  const [tipo, setTipo] = useState<'historico' | 'fixo' | 'exame'>('historico');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const salvar = async () => {
    if (!titulo.trim()) { toast.error('Dê um título ao registro.'); return; }
    setEnviando(true);
    try {
      const resp = await fetch('/api/saude-fila/prontuario', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, unidadeId, criadoPor, tipo, titulo, conteudo }),
      });
      const d = await resp.json();
      if (!d.success) { toast.error(d.error); return; }
      toast.success('Registrado.');
      onCriado();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">Novo registro</h2>
          <button onClick={onFechar}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ v: 'historico', l: 'Atendimento' }, { v: 'fixo', l: 'Fixo' }, { v: 'exame', l: 'Exame' }].map((op) => (
            <button key={op.v} onClick={() => setTipo(op.v as any)} className={`py-2 rounded-lg text-sm font-medium border ${tipo === op.v ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>{op.l}</button>
          ))}
        </div>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título (ex: Consulta de rotina)" className="w-full border rounded-xl px-4 py-3 text-sm mb-3" />
        <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={4} placeholder="Anotações" className="w-full border rounded-xl px-4 py-3 text-sm mb-5 resize-none" />
        <button onClick={salvar} disabled={enviando} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {enviando ? 'Salvando...' : 'Salvar registro'}
        </button>
      </div>
    </div>
  );
}
