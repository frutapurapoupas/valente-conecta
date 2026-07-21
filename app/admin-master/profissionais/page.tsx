'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Edit3, Trash2, CheckCircle2, EyeOff, PlusCircle,
  HardHat, Hammer, Paintbrush2, Zap, Droplets, TreePine,
  Laptop, Scissors, Wrench, Star, Phone, MapPin, MessageCircle,
  Calendar, Clock, Filter, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORIAS = [
  { id: 'pedreiro',    label: 'Pedreiro',    icon: HardHat     },
  { id: 'carpinteiro', label: 'Carpinteiro', icon: Hammer      },
  { id: 'pintor',      label: 'Pintor',      icon: Paintbrush2 },
  { id: 'eletricista', label: 'Eletricista', icon: Zap         },
  { id: 'encanador',   label: 'Encanador',   icon: Droplets    },
  { id: 'marceneiro',  label: 'Marceneiro',  icon: Wrench      },
  { id: 'jardineiro',  label: 'Jardineiro',  icon: TreePine    },
  { id: 'informatica', label: 'Informatica', icon: Laptop      },
  { id: 'diarista',    label: 'Diarista',    icon: Scissors    },
  { id: 'outros',      label: 'Outros',      icon: Wrench      },
];

interface Profissional {
  id: string; nome: string; foto?: string; categoria: string;
  especialidades: string[]; descricao: string; experiencia: number;
  bairro: string; cidade: string; telefone: string; whatsapp: string;
  precoHora: number; plano: string; status: string; avaliacao: number;
  totalAvaliacoes: number; destaque: boolean; disponibilidade: string;
  createdAt: string;
}

interface Agendamento {
  id: string; profissionalId: string; profissionalNome: string;
  clienteNome: string; clienteTelefone: string; servico: string;
  data: string; horario: string; observacoes: string;
  valorEstimado: number; status: string; createdAt: string;
}

const empty = (): Partial<Profissional> => ({
  nome: '', categoria: 'pedreiro', especialidades: [], descricao: '', experiencia: 0,
  bairro: '', cidade: 'Valente', telefone: '', whatsapp: '', precoHora: 0,
  plano: 'basico', status: 'pendente', destaque: false, disponibilidade: '', foto: ''
});

export default function AdminProfissionaisPage() {
  const [aba, setAba] = useState<'profissionais' | 'agendamentos'>('profissionais');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [editando, setEditando] = useState<Partial<Profissional> | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregarProfissionais = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFiltro) params.set('categoria', catFiltro);
      if (statusFiltro) params.set('status', statusFiltro);
      if (busca.trim()) params.set('busca', busca.trim());
      const res = await fetch(`/api/profissionais?${params}`);
      const data = await res.json();
      setProfissionais(Array.isArray(data.data) ? data.data : []);
    } catch { toast.error('Erro ao carregar profissionais.'); }
    finally { setLoading(false); }
  }, [busca, catFiltro, statusFiltro]);

  const carregarAgendamentos = useCallback(async () => {
    try {
      const res = await fetch('/api/profissionais/agendamentos');
      const data = await res.json();
      setAgendamentos(Array.isArray(data.data) ? data.data : []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { const t = setTimeout(carregarProfissionais, 300); return () => clearTimeout(t); }, [carregarProfissionais]);
  useEffect(() => { if (aba === 'agendamentos') carregarAgendamentos(); }, [aba, carregarAgendamentos]);

  const handlePublicar = async (prof: Profissional) => {
    const novoStatus = prof.status === 'publicado' ? 'pendente' : 'publicado';
    const res = await fetch(`/api/profissionais?id=${prof.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    const data = await res.json();
    if (data.success) { toast.success(`Status alterado para ${novoStatus}.`); carregarProfissionais(); }
  };

  const handleDestaque = async (prof: Profissional) => {
    const res = await fetch(`/api/profissionais?id=${prof.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !prof.destaque })
    });
    const data = await res.json();
    if (data.success) { toast.success(prof.destaque ? 'Destaque removido.' : 'Profissional em destaque!'); carregarProfissionais(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este profissional?')) return;
    const res = await fetch(`/api/profissionais?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Profissional excluido.'); carregarProfissionais(); }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    try {
      const isNovo = !editando.id;
      const url = isNovo ? '/api/profissionais' : `/api/profissionais?id=${editando.id}`;
      const method = isNovo ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editando,
          especialidades: Array.isArray(editando.especialidades)
            ? editando.especialidades
            : String(editando.especialidades || '').split(',').map((s) => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(isNovo ? 'Profissional cadastrado!' : 'Dados atualizados!');
      setEditando(null);
      carregarProfissionais();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar.'); }
    finally { setSalvando(false); }
  };

  const handleAgendamentoStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/profissionais/agendamentos?id=${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) { toast.success(`Agendamento ${status}.`); carregarAgendamentos(); }
  };

  const resumo = {
    total: profissionais.length,
    publicados: profissionais.filter((p) => p.status === 'publicado').length,
    pendentes: profissionais.filter((p) => p.status === 'pendente').length,
    premium: profissionais.filter((p) => p.plano === 'premium').length,
  };

  const getCatIcon = (id: string) => {
    const cat = CATEGORIAS.find((c) => c.id === id);
    if (!cat) return <Wrench className="w-4 h-4" />;
    const Icon = cat.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Profissionais</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie profissionais cadastrados e solicitacoes de servico.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={carregarProfissionais} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />Atualizar
          </button>
          <button onClick={() => setEditando(empty())} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <PlusCircle className="w-4 h-4" />Novo Profissional
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',      val: resumo.total,      cor: 'text-white'      },
          { label: 'Publicados', val: resumo.publicados, cor: 'text-green-400'  },
          { label: 'Pendentes',  val: resumo.pendentes,  cor: 'text-orange-400' },
          { label: 'Premium',    val: resumo.premium,    cor: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.cor}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {(['profissionais', 'agendamentos'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors capitalize ${aba === a ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {a === 'profissionais' ? `Profissionais (${resumo.total})` : `Solicitacoes (${agendamentos.length})`}
          </button>
        ))}
      </div>

      {/* ABA: Profissionais */}
      {aba === 'profissionais' && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 flex-1 min-w-48">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-500" />
            </div>
            <select value={catFiltro} onChange={(e) => setCatFiltro(e.target.value)} className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="">Todos os status</option>
              <option value="publicado">Publicado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          {/* Tabela */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Carregando...</div>
            ) : profissionais.length === 0 ? (
              <div className="p-12 text-center">
                <HardHat className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum profissional encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-xs uppercase tracking-widest text-gray-500">
                      <th className="px-5 py-4 text-left">Profissional</th>
                      <th className="px-5 py-4 text-left">Categoria</th>
                      <th className="px-5 py-4 text-left">Contato</th>
                      <th className="px-5 py-4 text-left">Plano</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-left">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profissionais.map((prof) => (
                      <tr key={prof.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{prof.nome}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {prof.bairro ? `${prof.bairro}, ` : ''}{prof.cidade || 'Valente'}
                          </div>
                          {prof.destaque && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded mt-1 inline-block">DESTAQUE</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-300">
                            {getCatIcon(prof.categoria)}
                            {CATEGORIAS.find((c) => c.id === prof.categoria)?.label || prof.categoria}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-300">{prof.telefone}</div>
                          {prof.precoHora > 0 && <div className="text-xs text-green-400">R$ {prof.precoHora.toFixed(2)}/h</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${prof.plano === 'premium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400'}`}>
                            {prof.plano}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${prof.status === 'publicado' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {prof.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => handlePublicar(prof)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${prof.status === 'publicado' ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}`}>
                              {prof.status === 'publicado' ? <><EyeOff className="w-3 h-3" />Ocultar</> : <><CheckCircle2 className="w-3 h-3" />Publicar</>}
                            </button>
                            <button onClick={() => handleDestaque(prof)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${prof.destaque ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                              <Star className="w-3 h-3" />{prof.destaque ? 'Remover' : 'Destacar'}
                            </button>
                            <button onClick={() => setEditando(prof)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold transition-colors">
                              <Edit3 className="w-3 h-3" />Editar
                            </button>
                            <button onClick={() => handleDelete(prof.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-colors">
                              <Trash2 className="w-3 h-3" />Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ABA: Agendamentos */}
      {aba === 'agendamentos' && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          {agendamentos.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhuma solicitacao recebida ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-xs uppercase tracking-widest text-gray-500">
                    <th className="px-5 py-4 text-left">Cliente</th>
                    <th className="px-5 py-4 text-left">Profissional</th>
                    <th className="px-5 py-4 text-left">Servico</th>
                    <th className="px-5 py-4 text-left">Data / Hora</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agendamentos.map((ag) => (
                    <tr key={ag.id} className="hover:bg-white/2">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm">{ag.clienteNome}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{ag.clienteTelefone}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-300">{ag.profissionalNome}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-white">{ag.servico}</div>
                        {ag.observacoes && <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{ag.observacoes}</div>}
                      </td>
                      <td className="px-5 py-4">
                        {ag.data && <div className="text-sm text-gray-300 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ag.data).toLocaleDateString('pt-BR')}</div>}
                        {ag.horario && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{ag.horario}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ag.status === 'confirmado' ? 'bg-green-500/20 text-green-400' : ag.status === 'cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {ag.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          {ag.status === 'pendente' && (
                            <button onClick={() => handleAgendamentoStatus(ag.id, 'confirmado')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 text-xs font-semibold transition-colors">
                              <CheckCircle2 className="w-3 h-3" />Confirmar
                            </button>
                          )}
                          {ag.status !== 'cancelado' && (
                            <button onClick={() => handleAgendamentoStatus(ag.id, 'cancelado')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-colors">
                              <Trash2 className="w-3 h-3" />Cancelar
                            </button>
                          )}
                          {ag.clienteTelefone && (
                            <a href={`https://wa.me/55${ag.clienteTelefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 text-xs font-semibold transition-colors">
                              <MessageCircle className="w-3 h-3" />WA
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de EdiÃ§Ã£o / CriaÃ§Ã£o */}
      {editando && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">{editando.id ? 'Editar profissional' : 'Novo profissional'}</h2>
              <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-white text-sm">Fechar</button>
            </div>
            <form onSubmit={handleSalvar} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nome *', key: 'nome', type: 'text', placeholder: 'Nome completo', required: true },
                { label: 'Telefone *', key: 'telefone', type: 'text', placeholder: '(75) 99999-0000', required: true },
                { label: 'WhatsApp', key: 'whatsapp', type: 'text', placeholder: 'Igual ao telefone' },
                { label: 'Bairro', key: 'bairro', type: 'text', placeholder: 'Bairro ou referencia' },
                { label: 'Experiencia (anos)', key: 'experiencia', type: 'number', placeholder: '0' },
                { label: 'Preco/hora (R$)', key: 'precoHora', type: 'number', placeholder: '0,00' },
                { label: 'Disponibilidade', key: 'disponibilidade', type: 'text', placeholder: 'Seg a Sex, manha...' },
                { label: 'Foto (URL)', key: 'foto', type: 'text', placeholder: 'https://...' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-gray-400">{f.label}</label>
                  <input
                    type={f.type} required={f.required}
                    value={(editando as any)[f.key] ?? ''}
                    onChange={(e) => setEditando({ ...editando, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-400">Especialidades (separadas por virgula)</label>
                <input
                  value={Array.isArray(editando.especialidades) ? editando.especialidades.join(', ') : (editando.especialidades as any) || ''}
                  onChange={(e) => setEditando({ ...editando, especialidades: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                  placeholder="Reboco, alvenaria, fundacao..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-400">Descricao</label>
                <textarea
                  value={editando.descricao || ''}
                  onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                  rows={3}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
                  placeholder="Descricao dos servicos e experiencia..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Categoria</label>
                <select value={editando.categoria || 'outros'} onChange={(e) => setEditando({ ...editando, categoria: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                  {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400">Plano</label>
                  <select value={editando.plano || 'basico'} onChange={(e) => setEditando({ ...editando, plano: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                    <option value="basico">Basico</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <select value={editando.status || 'pendente'} onChange={(e) => setEditando({ ...editando, status: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                    <option value="pendente">Pendente</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="destaque" checked={!!editando.destaque} onChange={(e) => setEditando({ ...editando, destaque: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                <label htmlFor="destaque" className="text-sm text-gray-300">Marcar como destaque (aparecer no topo)</label>
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setEditando(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-3 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                  {salvando ? 'Salvando...' : editando.id ? 'Salvar alteracoes' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


