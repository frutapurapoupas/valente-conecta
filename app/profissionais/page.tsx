'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search, Phone, MapPin, Star, Clock, Wrench, Hammer, Paintbrush2,
  Zap, Droplets, TreePine, Laptop, Scissors, HardHat, ChevronRight,
  X, CheckCircle, MessageCircle, Filter, UserPlus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Profissional {
  id: string; nome: string; foto?: string; categoria: string;
  especialidades: string[]; descricao: string; experiencia: number;
  bairro: string; cidade: string; telefone: string; whatsapp: string;
  precoHora: number; precoServico: number; disponibilidade: string;
  plano: string; status: string; avaliacao: number; totalAvaliacoes: number;
  destaque: boolean;
}

const CATEGORIAS = [
  { id: 'pedreiro',    label: 'Pedreiro',    icon: HardHat,     cor: 'bg-orange-500' },
  { id: 'carpinteiro', label: 'Carpinteiro', icon: Hammer,      cor: 'bg-yellow-600' },
  { id: 'pintor',      label: 'Pintor',      icon: Paintbrush2, cor: 'bg-purple-500' },
  { id: 'eletricista', label: 'Eletricista', icon: Zap,         cor: 'bg-yellow-400' },
  { id: 'encanador',   label: 'Encanador',   icon: Droplets,    cor: 'bg-blue-500'   },
  { id: 'marceneiro',  label: 'Marceneiro',  icon: Wrench,      cor: 'bg-amber-700'  },
  { id: 'jardineiro',  label: 'Jardineiro',  icon: TreePine,    cor: 'bg-green-600'  },
  { id: 'informatica', label: 'Informatica', icon: Laptop,      cor: 'bg-cyan-500'   },
  { id: 'diarista',    label: 'Diarista',    icon: Scissors,    cor: 'bg-pink-500'   },
  { id: 'outros',      label: 'Outros',      icon: Wrench,      cor: 'bg-gray-500'   },
];

const getCat = (id: string) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];

function Estrelas({ valor, total }: { valor: number; total: number }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold text-white">{valor > 0 ? valor.toFixed(1) : 'Novo'}</span>
      {total > 0 && <span className="text-gray-400">({total})</span>}
    </span>
  );
}

function CardProfissional({ prof, onSolicitar }: { prof: Profissional; onSolicitar: (p: Profissional) => void }) {
  const cat = getCat(prof.categoria);
  const Icon = cat.icon;
  const iniciais = prof.nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-slate-900 overflow-hidden transition-colors ${prof.destaque ? 'ring-2 ring-yellow-400/50' : ''}`}>
      {prof.destaque && <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-black text-[13px] font-bold px-2 py-0.5 rounded-full">DESTAQUE</div>}
      <div className={`h-2 w-full ${cat.cor}`} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          {prof.foto ? (
            <img src={prof.foto} alt={prof.nome} className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-white/10" />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 ${cat.cor}`}>{iniciais}</div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{prof.nome}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full text-white ${cat.cor}`}><Icon className="w-3 h-3" />{cat.label}</span>
              {prof.plano === 'premium' && <span className="text-sm bg-indigo-600 text-white px-2 py-0.5 rounded-full">Premium</span>}
            </div>
            <Estrelas valor={prof.avaliacao} total={prof.totalAvaliacoes} />
          </div>
        </div>
        {prof.especialidades?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prof.especialidades.slice(0, 3).map((e, i) => <span key={i} className="text-sm bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded-full">{e}</span>)}
          </div>
        )}
        {prof.descricao && <p className="text-sm text-gray-400 mt-3 line-clamp-2">{prof.descricao}</p>}
        <div className="mt-4 space-y-1.5 text-sm text-gray-400">
          {(prof.bairro || prof.cidade) && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" /><span>{[prof.bairro, prof.cidade].filter(Boolean).join(' - ')}</span></div>}
          {prof.experiencia > 0 && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 shrink-0" /><span>{prof.experiencia} {prof.experiencia === 1 ? 'ano' : 'anos'} de experiencia</span></div>}
          {prof.disponibilidade && <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /><span className="text-green-400 truncate">{prof.disponibilidade}</span></div>}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            {prof.precoHora > 0 ? (
              <><p className="text-sm text-gray-500">A partir de</p><p className="text-lg font-bold text-green-400">R$ {prof.precoHora.toFixed(2)}</p></>
            ) : (
              <p className="text-sm text-gray-400 italic">Orcamento a combinar</p>
            )}
          </div>
          <button onClick={() => onSolicitar(prof)} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <MessageCircle className="w-4 h-4" />Solicitar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSolicitar({ prof, onClose }: { prof: Profissional; onClose: () => void }) {
  const cat = getCat(prof.categoria);
  const [form, setForm] = useState({ clienteNome: '', clienteTelefone: '', servico: '', data: '', horario: '', observacoes: '' });
  const [enviando, setEnviando] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteNome.trim() || !form.clienteTelefone.trim() || !form.servico.trim()) { toast.error('Preencha nome, telefone e servico.'); return; }
    setEnviando(true);
    try {
      const res = await fetch('/api/profissionais/agendamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profissionalId: prof.id, profissionalNome: prof.nome, ...form, valorEstimado: prof.precoHora }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Solicitacao enviada! O profissional entrara em contato.');
      if (prof.whatsapp) {
        const msg = encodeURIComponent(`Ola ${prof.nome}! Vi seu perfil no Valente Conecta.\nServico: ${form.servico}\n${form.data ? 'Data: ' + form.data : ''}\n${form.observacoes ? 'Obs: ' + form.observacoes : ''}`);
        window.open(`https://wa.me/55${prof.whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
      }
      onClose();
    } catch (err: any) { toast.error(err.message || 'Erro ao enviar.'); } finally { setEnviando(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div><h2 className="text-white font-bold text-lg">Solicitar servico</h2><p className="text-gray-400 text-sm">{prof.nome} · {cat.label}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-sm text-gray-400">Seu nome *</label><input value={form.clienteNome} onChange={(e) => setForm({ ...form, clienteNome: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" placeholder="Nome completo" /></div>
          <div><label className="text-sm text-gray-400">WhatsApp / Telefone *</label><input value={form.clienteTelefone} onChange={(e) => setForm({ ...form, clienteTelefone: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" placeholder="(75) 99999-0000" /></div>
          <div><label className="text-sm text-gray-400">Tipo de servico *</label><input value={form.servico} onChange={(e) => setForm({ ...form, servico: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" placeholder="Descreva o servico necessario" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm text-gray-400">Data desejada</label><input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" /></div>
            <div><label className="text-sm text-gray-400">Horario</label><input type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" /></div>
          </div>
          <div><label className="text-sm text-gray-400">Observacoes</label><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 resize-none" placeholder="Tamanho do servico, materiais, etc..." /></div>
          <button type="submit" disabled={enviando} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />{enviando ? 'Enviando...' : 'Confirmar Solicitacao'}
          </button>
          <p className="text-sm text-gray-500 text-center">Sera direcionado para o WhatsApp do profissional apos confirmar.</p>
        </form>
      </div>
    </div>
  );
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [primeiraVez, setPrimeiraVez] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState('');
  const [catFiltro, setCatFiltro] = useState('');
  const [modalProf, setModalProf] = useState<Profissional | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      if (primeiraVez) setAtualizando(true);
      try {
        const params = new URLSearchParams({ status: 'publicado' });
        if (catFiltro) params.set('categoria', catFiltro);
        if (busca.trim()) params.set('busca', busca.trim());
        const res = await fetch(`/api/profissionais?${params}`, { signal: controller.signal });
        const data = await res.json();
        setProfissionais(Array.isArray(data.data) ? data.data : []);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setProfissionais([]);
      } finally {
        setAtualizando(false);
        setPrimeiraVez(false);
      }
    }, 350);
    return () => { clearTimeout(t); controller.abort(); };
  }, [busca, catFiltro]); // eslint-disable-line react-hooks/exhaustive-deps

  const ordenados = [...profissionais.filter(p => p.destaque), ...profissionais.filter(p => !p.destaque)];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" />
      <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 px-4 py-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Profissionais em Valente</h1>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">Pedreiro, carpinteiro, pintor, eletricista e muito mais. Encontre o profissional certo para o seu servico.</p>
          <div className="flex gap-2 mt-6 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar profissional ou servico..." className="w-full bg-white text-gray-800 pl-10 pr-4 py-3 rounded-xl text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <a href="/profissionais/cadastro" className="flex items-center gap-2 bg-white text-orange-700 font-bold px-4 py-3 rounded-xl shadow-lg hover:bg-orange-50 text-sm whitespace-nowrap"><UserPlus className="w-4 h-4" />Anunciar</a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          <button onClick={() => setCatFiltro('')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${catFiltro === '' ? 'bg-white text-slate-900' : 'bg-white/10 text-gray-300'}`}><Filter className="w-3.5 h-3.5" />Todos</button>
          {CATEGORIAS.map((c) => { const Icon = c.icon; return (<button key={c.id} onClick={() => setCatFiltro(catFiltro === c.id ? '' : c.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${catFiltro === c.id ? 'bg-white text-slate-900' : 'bg-white/10 text-gray-300'}`}><Icon className="w-3.5 h-3.5" />{c.label}</button>); })}
        </div>

        <div className="mt-6 mb-4 flex items-center gap-2">
          <p className="text-gray-400 text-sm">{atualizando ? 'Buscando...' : `${ordenados.length} profissional${ordenados.length !== 1 ? 'is' : ''} encontrado${ordenados.length !== 1 ? 's' : ''}`}</p>
          {atualizando && <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse inline-block" />}
        </div>

        {primeiraVez && atualizando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 h-64" />)}</div>
        ) : ordenados.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-white/10">
            <HardHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Nenhum profissional encontrado</h3>
            <p className="text-gray-500 mt-2">Seja o primeiro a se cadastrar!</p>
            <a href="/profissionais/cadastro" className="inline-flex items-center gap-2 mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors"><UserPlus className="w-4 h-4" />Cadastrar como profissional</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{ordenados.map((prof) => <CardProfissional key={prof.id} prof={prof} onSolicitar={setModalProf} />)}</div>
        )}

        <div className="mt-12 bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-2xl p-8 text-center">
          <HardHat className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">E profissional em Valente?</h3>
          <p className="text-gray-400 mt-2">Divulgue seus servicos e receba solicitacoes direto no WhatsApp.</p>
          <a href="/profissionais/cadastro" className="inline-flex items-center gap-2 mt-5 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">Anunciar meus servicos <ChevronRight className="w-4 h-4" /></a>
        </div>
      </div>

      {modalProf && <ModalSolicitar prof={modalProf} onClose={() => setModalProf(null)} />}
    </div>
  );
}


