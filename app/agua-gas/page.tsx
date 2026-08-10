'use client';

import { useState, useEffect } from 'react';
import {
  Droplets, Flame, Phone, MapPin, Clock, Star, ShoppingCart, X,
  MessageCircle, ChevronRight, Truck, Package, CheckCircle, Store
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Produto {
  tipo: 'agua_mineral' | 'agua_garrafao' | 'gas_p13' | 'gas_p45' | 'gas_p20' | 'gas_granel' | 'outro';
  descricao: string;
  preco: number;
  unidade: string;
  disponivel: boolean;
}

interface Fornecedor {
  id: string;
  nome: string;
  responsavel: string;
  telefone: string;
  whatsapp: string;
  bairro: string;
  cidade: string;
  descricao: string;
  foto: string;
  horario: string;
  temEntrega: boolean;
  taxaEntrega: number;
  freteGratisAcima: number;
  produtos: Produto[];
  status: string;
  destaque: boolean;
}

// ─── Configuração de tipos ────────────────────────────────────────────────────
const TIPO_CONFIG: Record<string, { label: string; icon: typeof Droplets; cor: string; bg: string }> = {
  agua_mineral:  { label: 'Água Mineral',    icon: Droplets, cor: 'text-blue-400',   bg: 'bg-blue-500/20'   },
  agua_garrafao: { label: 'Garrafão 20L',    icon: Droplets, cor: 'text-cyan-400',   bg: 'bg-cyan-500/20'   },
  gas_p13:       { label: 'Gás P13',         icon: Flame,    cor: 'text-orange-400', bg: 'bg-orange-500/20' },
  gas_p20:       { label: 'Gás P20',         icon: Flame,    cor: 'text-amber-400',  bg: 'bg-amber-500/20'  },
  gas_p45:       { label: 'Gás P45',         icon: Flame,    cor: 'text-red-400',    bg: 'bg-red-500/20'    },
  gas_granel:    { label: 'Gás Granel',      icon: Flame,    cor: 'text-rose-400',   bg: 'bg-rose-500/20'   },
  outro:         { label: 'Outros',          icon: Package,  cor: 'text-gray-400',   bg: 'bg-gray-500/20'   },
};

const FILTROS = [
  { id: '',              label: 'Todos'       },
  { id: 'agua_garrafao', label: 'Garrafão 20L'},
  { id: 'agua_mineral',  label: 'Água Mineral'},
  { id: 'gas_p13',       label: 'Gás P13'     },
  { id: 'gas_p20',       label: 'Gás P20'     },
  { id: 'gas_p45',       label: 'Gás P45'     },
  { id: 'gas_granel',    label: 'Gás Granel'  },
];

// ─── Card de produto dentro do fornecedor ────────────────────────────────────
function BadgeProduto({ p }: { p: Produto }) {
  const cfg = TIPO_CONFIG[p.tipo] || TIPO_CONFIG.outro;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${cfg.bg} border border-white/5`}>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.cor}`}>
        <Icon className="w-4 h-4" />{p.descricao || cfg.label}
      </span>
      <span className="text-white font-bold text-sm">
        {p.preco > 0 ? `R$ ${p.preco.toFixed(2)}` : 'Consultar'}
        {p.unidade ? <span className="text-gray-400 font-normal text-xs ml-1">/{p.unidade}</span> : null}
      </span>
    </div>
  );
}

// ─── Card de fornecedor ───────────────────────────────────────────────────────
function CardFornecedor({ forn, onPedir }: { forn: Fornecedor; onPedir: (f: Fornecedor) => void }) {
  const produtosVisiveis = forn.produtos?.filter((p) => p.disponivel !== false).slice(0, 4) || [];

  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-900 overflow-hidden ${forn.destaque ? 'ring-2 ring-blue-400/40' : ''}`}>
      {forn.destaque && (
        <div className="bg-blue-600 text-white text-center text-[11px] font-bold py-1 tracking-wide">
          â­ DESTAQUE
        </div>
      )}

      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-start gap-4">
          {forn.foto ? (
            <img src={forn.foto} alt={forn.nome} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Store className="w-7 h-7 text-blue-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight">{forn.nome}</h3>
            {forn.responsavel && <p className="text-xs text-gray-400 mt-0.5">{forn.responsavel}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {forn.temEntrega && (
                <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                  <Truck className="w-3 h-3" />Entrega
                </span>
              )}
              {forn.taxaEntrega === 0 && forn.temEntrega && (
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Frete grátis
                </span>
              )}
              {forn.freteGratisAcima > 0 && (
                <span className="text-xs text-gray-400">
                  Frete grátis acima de R$ {forn.freteGratisAcima.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 text-sm text-gray-400">
          {(forn.bairro || forn.cidade) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              {[forn.bairro, forn.cidade].filter(Boolean).join(' – ')}
            </div>
          )}
          {forn.horario && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              {forn.horario}
            </div>
          )}
        </div>

        {/* Produtos */}
        {produtosVisiveis.length > 0 && (
          <div className="mt-4 space-y-2">
            {produtosVisiveis.map((p, i) => <BadgeProduto key={i} p={p} />)}
            {(forn.produtos?.filter((p) => p.disponivel !== false).length || 0) > 4 && (
              <p className="text-xs text-gray-500 text-center">
                +{(forn.produtos?.filter((p) => p.disponivel !== false).length || 0) - 4} produto(s) disponíveis
              </p>
            )}
          </div>
        )}

        {/* Ação */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
          <a
            href={`https://wa.me/55${forn.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl py-2 text-sm font-semibold"
          >
            <Phone className="w-4 h-4" />WhatsApp
          </a>
          <button
            onClick={() => onPedir(forn)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />Pedir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de pedido ──────────────────────────────────────────────────────────
function ModalPedido({ forn, onClose }: { forn: Fornecedor; onClose: () => void }) {
  const produtosDisponiveis = forn.produtos?.filter((p) => p.disponivel !== false) || [];
  const [form, setForm] = useState({ clienteNome: '', clienteTelefone: '', produto: '', quantidade: '1', endereco: '', observacoes: '' });
  const [enviando, setEnviando] = useState(false);
  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteNome.trim() || !form.clienteTelefone.trim() || !form.produto) {
      toast.error('Preencha nome, telefone e produto.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch('/api/agua-gas?recurso=pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedorId: forn.id, fornecedorNome: forn.nome, ...form, quantidade: Number(form.quantidade || 1) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success('Pedido enviado! O fornecedor entrará em contato.');

      // WhatsApp direto
      if (forn.whatsapp) {
        const msg = encodeURIComponent(
          `Olá ${forn.nome}! Quero fazer um pedido pelo Valente Conecta.\n` +
          `Produto: ${form.produto}\n` +
          `Quantidade: ${form.quantidade}\n` +
          (form.endereco ? `Endereço: ${form.endereco}\n` : '') +
          (form.observacoes ? `Obs: ${form.observacoes}` : '')
        );
        window.open(`https://wa.me/55${forn.whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Fazer pedido</h2>
            <p className="text-gray-400 text-sm">{forn.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Seu nome *</label>
            <input value={form.clienteNome} onChange={(e) => set('clienteNome', e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Nome completo" />
          </div>

          <div>
            <label className="text-sm text-gray-400">WhatsApp / Telefone *</label>
            <input value={form.clienteTelefone} onChange={(e) => set('clienteTelefone', e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              placeholder="(75) 99999-0000" />
          </div>

          <div>
            <label className="text-sm text-gray-400">Produto *</label>
            {produtosDisponiveis.length > 0 ? (
              <select value={form.produto} onChange={(e) => set('produto', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400">
                <option value="">Selecione o produto</option>
                {produtosDisponiveis.map((p, i) => (
                  <option key={i} value={p.descricao || TIPO_CONFIG[p.tipo]?.label || p.tipo}>
                    {p.descricao || TIPO_CONFIG[p.tipo]?.label || p.tipo}
                    {p.preco > 0 ? ` — R$ ${p.preco.toFixed(2)}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input value={form.produto} onChange={(e) => set('produto', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Ex: Garrafão 20L, Gás P13..." />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">Quantidade</label>
              <input type="number" min="1" value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Endereço de entrega</label>
              <input value={form.endereco} onChange={(e) => set('endereco', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                placeholder="Rua, número..." />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2}
              className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
              placeholder="Ponto de referência, horário preferido..." />
          </div>

          <button type="submit" disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {enviando ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Após confirmar, será aberto o WhatsApp do fornecedor com seu pedido.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Página pública ───────────────────────────────────────────────────────────
export default function AguaGasPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [primeiraVez, setPrimeiraVez] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [modalForn, setModalForn] = useState<Fornecedor | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      if (primeiraVez) setAtualizando(true);
      try {
        const params = new URLSearchParams({ status: 'publicado' });
        if (tipoFiltro) params.set('tipo', tipoFiltro);
        const res = await fetch(`/api/agua-gas?${params}`, { signal: controller.signal });
        const data = await res.json();
        setFornecedores(Array.isArray(data.data) ? data.data : []);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setFornecedores([]);
      } finally { setAtualizando(false); setPrimeiraVez(false); }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [tipoFiltro]); // eslint-disable-line

  const ordenados = [...fornecedores.filter((f) => f.destaque), ...fornecedores.filter((f) => !f.destaque)];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-500 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Droplets className="w-10 h-10 text-white" />
            <Flame className="w-10 h-10 text-orange-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Água e Gás em Valente</h1>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Garrafão, água mineral, gás P13, P20, P45 e granel. Compare fornecedores e peça pelo WhatsApp.
          </p>
          <a
            href="/agua-gas/fornecedor"
            className="inline-flex items-center gap-2 mt-6 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-50 text-sm"
          >
            <Store className="w-4 h-4" /> Cadastrar minha empresa
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTipoFiltro(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tipoFiltro === f.id ? 'bg-white text-slate-900' : 'bg-white/10 text-gray-300'}`}
            >
              {f.id.startsWith('gas') ? 'ðŸ”¥' : f.id ? 'ðŸ’§' : 'ðŸª'} {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 mb-4 flex items-center gap-2">
          <p className="text-gray-400 text-sm">
            {atualizando ? 'Buscando...' : `${ordenados.length} fornecedor${ordenados.length !== 1 ? 'es' : ''} encontrado${ordenados.length !== 1 ? 's' : ''}`}
          </p>
          {atualizando && <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse inline-block" />}
        </div>

        {/* Lista */}
        {primeiraVez && atualizando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-slate-800/60 h-56" />)}
          </div>
        ) : ordenados.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-white/10">
            <Droplets className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-500 mt-2">Seja o primeiro a cadastrar sua empresa!</p>
            <a href="/agua-gas/fornecedor" className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
              <Store className="w-4 h-4" /> Cadastrar empresa
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ordenados.map((f) => <CardFornecedor key={f.id} forn={f} onPedir={setModalForn} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 text-center">
          <Store className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Vende água ou gás em Valente?</h3>
          <p className="text-gray-400 mt-2">Cadastre sua empresa gratuitamente e receba pedidos pelo WhatsApp.</p>
          <a href="/agua-gas/fornecedor" className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">
            Cadastrar empresa <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {modalForn && <ModalPedido forn={modalForn} onClose={() => setModalForn(null)} />}
    </div>
  );
}


