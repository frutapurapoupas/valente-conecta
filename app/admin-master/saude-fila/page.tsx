'use client';

// Caminho: C:\valente_conecta\app\admin-master\saude-fila\page.tsx
//
// Cadastro de unidade de saude pelo admin master (ver proposta "Modo
// Valente Facil", item 5). O diretor informado precisa ja' ter conta no
// app (ver app/api/admin-master/unidades-saude/route.ts).

import { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, Users, Tv } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

interface Servico { nome: string; tipo: 'consulta' | 'exame'; preco: string }

export default function AdminSaudeFilaPage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'hospital' | 'clinica' | 'laboratorio'>('clinica');
  const [regime, setRegime] = useState<'sus' | 'particular' | 'hibrido'>('sus');
  const [endereco, setEndereco] = useState('');
  const [diretorWhatsapp, setDiretorWhatsapp] = useState('');
  const [servicos, setServicos] = useState<Servico[]>([{ nome: '', tipo: 'consulta', preco: '' }]);
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    fetch('/api/admin-master/unidades-saude').then((r) => r.json()).then((d) => { if (d.success) setUnidades(d.data); setCarregando(false); });
  };
  useEffect(carregar, []);

  const salvar = async () => {
    const admin = getCurrentUser();
    if (!admin) return;
    if (!nome.trim() || !diretorWhatsapp.trim()) { toast.error('Nome e WhatsApp do diretor são obrigatórios.'); return; }
    setEnviando(true);
    try {
      const resp = await fetch('/api/admin-master/unidades-saude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, tipo, regime, endereco, diretorWhatsapp, criadoPor: admin.id,
          servicos: servicos.filter((s) => s.nome.trim()).map((s) => ({ ...s, preco: Number(s.preco) || 0 })),
        }),
      });
      const d = await resp.json();
      if (!d.success) { toast.error(d.error); return; }
      toast.success(`Unidade cadastrada! Diretor: ${d.diretorNome}`);
      setNome(''); setEndereco(''); setDiretorWhatsapp(''); setServicos([{ nome: '', tipo: 'consulta', preco: '' }]);
      carregar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Fila Virtual de Saúde</h1>
      <p className="text-gray-500 mb-6">Cadastre a unidade e o diretor responsável — ele passa a poder convidar o resto da equipe.</p>

      <div className="bg-white border rounded-2xl p-6 mb-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nome da unidade</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Hospital Municipal de Valente" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="hospital">Hospital</option>
              <option value="clinica">Clínica</option>
              <option value="laboratorio">Laboratório</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Regime</label>
            <select value={regime} onChange={(e) => setRegime(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="sus">SUS</option>
              <option value="particular">Particular</option>
              <option value="hibrido">Híbrida</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Endereço</label>
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Rua, número, bairro" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp do diretor (precisa já ter conta no app)</label>
          <input value={diretorWhatsapp} onChange={(e) => setDiretorWhatsapp(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(75) 99999-0000" />
        </div>

        {regime !== 'sus' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Tabela de preços</label>
            <div className="space-y-2">
              {servicos.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.nome} onChange={(e) => setServicos((prev) => prev.map((p, j) => j === i ? { ...p, nome: e.target.value } : p))} placeholder="Serviço" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                  <select value={s.tipo} onChange={(e) => setServicos((prev) => prev.map((p, j) => j === i ? { ...p, tipo: e.target.value as any } : p))} className="border rounded-lg px-2 py-2 text-sm">
                    <option value="consulta">Consulta</option>
                    <option value="exame">Exame</option>
                  </select>
                  <input value={s.preco} onChange={(e) => setServicos((prev) => prev.map((p, j) => j === i ? { ...p, preco: e.target.value } : p))} placeholder="R$" type="number" className="w-24 border rounded-lg px-3 py-2 text-sm" />
                  <button onClick={() => setServicos((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <button onClick={() => setServicos((prev) => [...prev, { nome: '', tipo: 'consulta', preco: '' }])} className="text-sm text-blue-600 font-medium flex items-center gap-1"><Plus size={14} />Adicionar serviço</button>
            </div>
          </div>
        )}

        <button onClick={salvar} disabled={enviando} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {enviando ? 'Salvando...' : 'Cadastrar unidade'}
        </button>
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Unidades cadastradas</h2>
      {carregando ? <p className="text-gray-400 text-sm">Carregando...</p> : unidades.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma unidade cadastrada ainda.</p>
      ) : (
        <div className="space-y-2">
          {unidades.map((u) => (
            <div key={u.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{u.nome}</p>
                <p className="text-sm text-gray-500">{u.tipo} · {u.regime} · {u.unidade_saude_equipe?.length || 0} na equipe</p>
              </div>
              <div className="flex gap-3">
                <a href={`/saude/fila/${u.id}/atendente`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 font-medium"><Users size={14} />Atendente <ExternalLink size={12} /></a>
                <a href={`/saude/fila/${u.id}/painel-tv`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-purple-600 font-medium"><Tv size={14} />TV <ExternalLink size={12} /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
