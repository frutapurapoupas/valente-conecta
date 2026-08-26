'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Droplets, Flame, Phone, MapPin, Clock, Star, ShoppingCart, X,
  MessageCircle, ChevronRight, Truck, Package, CheckCircle, Store, Navigation
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { obterUsuarioLocalId } from '@/lib/usuarioLocal';
import { getCurrentUser } from '@/lib/auth';

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
  donoId: string | null;
  nome: string;
  responsavel: string;
  telefone: string;
  whatsapp: string;
  bairro: string;
  endereco: string;
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
  latitude: number | null;
  longitude: number | null;
  precoAguaPadrao: number | null;
  descricaoAguaPadrao: string;
  precoGasPadrao: number | null;
  descricaoGasPadrao: string;
  mpConectado: boolean;
  aceitaDinheiro: boolean;
  aceitaCartao: boolean;
  aceitaPix: boolean;
  aceitaValeGas: boolean;
  aceitaFiado: boolean;
}

const FORMAS_PAGAMENTO_CLIENTE: { chave: keyof Pick<Fornecedor, 'aceitaDinheiro' | 'aceitaCartao' | 'aceitaPix' | 'aceitaValeGas' | 'aceitaFiado'>; label: string }[] = [
  { chave: 'aceitaDinheiro', label: 'Dinheiro' },
  { chave: 'aceitaCartao', label: 'Cartão' },
  { chave: 'aceitaPix', label: 'PIX' },
  { chave: 'aceitaValeGas', label: 'Vale-Gás' },
  { chave: 'aceitaFiado', label: 'Fiado' },
];

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

const CATEGORIAS: Record<'agua' | 'gas', { label: string; tipos: string[] }> = {
  agua: { label: 'Água', tipos: ['agua_garrafao', 'agua_mineral'] },
  gas: { label: 'Gás', tipos: ['gas_p13', 'gas_p20', 'gas_p45', 'gas_granel'] },
};

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
        {p.unidade ? <span className="text-gray-400 font-normal text-sm ml-1">/{p.unidade}</span> : null}
      </span>
    </div>
  );
}

// ─── Card de fornecedor ───────────────────────────────────────────────────────
function CardFornecedor({ forn, categoria, onPedir, onPedirExpresso, onReivindicar, distanciaKm: distancia }: {
  forn: Fornecedor; categoria: 'agua' | 'gas' | null;
  onPedir: (f: Fornecedor) => void; onPedirExpresso: (f: Fornecedor, categoria: 'agua' | 'gas') => void; onReivindicar: (f: Fornecedor) => void;
  distanciaKm?: number | null;
}) {
  const produtosVisiveis = forn.produtos?.filter((p) => p.disponivel !== false).slice(0, 4) || [];
  const precoExpresso = categoria === 'agua' ? forn.precoAguaPadrao : categoria === 'gas' ? forn.precoGasPadrao : null;
  const temPedidoExpresso = categoria != null && Number(precoExpresso) > 0;

  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-900 overflow-hidden ${forn.destaque ? 'ring-2 ring-blue-400/40' : ''}`}>
      {forn.destaque && (
        <div className="bg-blue-600 text-white text-center text-[13px] font-bold py-1 tracking-wide">
          ⭐ DESTAQUE
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
            {forn.responsavel && <p className="text-sm text-gray-400 mt-0.5">{forn.responsavel}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {forn.temEntrega && (
                <span className="flex items-center gap-1 text-sm bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                  <Truck className="w-3 h-3" />Entrega
                </span>
              )}
              {forn.taxaEntrega === 0 && forn.temEntrega && (
                <span className="text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Frete grátis
                </span>
              )}
              {forn.freteGratisAcima > 0 && (
                <span className="text-sm text-gray-400">
                  Frete grátis acima de R$ {forn.freteGratisAcima.toFixed(0)}
                </span>
              )}
            </div>
            {(forn.aceitaValeGas || forn.aceitaFiado || forn.aceitaPix || forn.aceitaCartao) && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {FORMAS_PAGAMENTO_CLIENTE.filter((f) => forn[f.chave]).map((f) => (
                  <span key={f.chave} className="text-[13px] bg-white/5 text-gray-300 border border-white/10 px-2 py-0.5 rounded-full">
                    {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 text-sm text-gray-400">
          {forn.endereco && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forn.endereco}</span>
            </div>
          )}
          {(forn.bairro || (!forn.endereco && forn.cidade) || distancia != null) && (
            <div className="flex items-center gap-1.5">
              {!forn.endereco && <MapPin className="w-4 h-4 shrink-0" />}
              {[forn.bairro, !forn.endereco ? forn.cidade : ''].filter(Boolean).join(' – ')}
              {distancia != null && (
                <span className="text-cyan-400 font-medium">
                  {[forn.bairro, forn.cidade].some(Boolean) ? ' · ' : ''}{distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(1)} km`}
                </span>
              )}
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
              <p className="text-sm text-gray-500 text-center">
                +{(forn.produtos?.filter((p) => p.disponivel !== false).length || 0) - 4} produto(s) disponíveis
              </p>
            )}
          </div>
        )}

        {/* Ação */}
        {temPedidoExpresso && (
          <button
            onClick={() => onPedirExpresso(forn, categoria as 'agua' | 'gas')}
            className={`mt-4 w-full flex items-center justify-center gap-1.5 text-white rounded-xl py-2.5 text-sm font-bold transition-colors ${categoria === 'agua' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'}`}
          >
            {categoria === 'agua' ? <Droplets className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
            Pedir {categoria === 'agua' ? 'água' : 'gás'} agora — R$ {Number(precoExpresso).toFixed(2)}
          </button>
        )}
        <div className={`grid grid-cols-2 gap-2 pt-4 border-t border-white/10 ${temPedidoExpresso ? 'mt-2' : 'mt-4'}`}>
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
            <ShoppingCart className="w-4 h-4" />{temPedidoExpresso ? 'Outro produto' : 'Pedir'}
          </button>
        </div>

        {!forn.donoId && (
          <button
            onClick={() => onReivindicar(forn)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl py-2 text-sm font-semibold"
          >
            <Store className="w-4 h-4" />Sou proprietário
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal de pedido ──────────────────────────────────────────────────────────
function ModalPedido({ forn, onClose }: { forn: Fornecedor; onClose: () => void }) {
  const produtosDisponiveis = forn.produtos?.filter((p) => p.disponivel !== false) || [];
  const formasAceitas = FORMAS_PAGAMENTO_CLIENTE.filter((f) => forn[f.chave]);
  const [form, setForm] = useState({ clienteNome: '', clienteTelefone: '', produto: '', quantidade: '1', endereco: '', observacoes: '', formaPagamento: '' });
  const [enviando, setEnviando] = useState(false);
  const [pedidoCriadoId, setPedidoCriadoId] = useState('');
  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  // Se o cliente já se cadastrou no app (CadastroPopup/lib/auth), reaproveita
  // nome e WhatsApp dele — não faz sentido pedir de novo o que já sabemos.
  // Sem cadastro salvo, cai pro formulário completo (fallback abaixo).
  const perfil = typeof window !== 'undefined' ? getCurrentUser() : null;
  const perfilCompleto = Boolean(perfil?.nome && perfil?.whatsapp);
  useEffect(() => {
    if (perfilCompleto && perfil) {
      setForm((prev) => ({ ...prev, clienteNome: perfil.nome, clienteTelefone: perfil.whatsapp }));
    }
  }, [perfilCompleto]); // eslint-disable-line

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
        body: JSON.stringify({ fornecedorId: forn.id, fornecedorNome: forn.nome, clienteId: obterUsuarioLocalId(), ...form, quantidade: Number(form.quantidade || 1) })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success('Pedido enviado! O fornecedor entrará em contato.');
      setPedidoCriadoId(data.data.id);

      // WhatsApp direto
      if (forn.whatsapp) {
        const msg = encodeURIComponent(
          `Olá ${forn.nome}! Quero fazer um pedido pelo Valente Conecta.\n` +
          `Produto: ${form.produto}\n` +
          `Quantidade: ${form.quantidade}\n` +
          (form.endereco ? `Endereço: ${form.endereco}\n` : '') +
          (form.formaPagamento ? `Pagamento: ${form.formaPagamento}\n` : '') +
          (form.observacoes ? `Obs: ${form.observacoes}` : '')
        );
        window.open(`https://wa.me/55${forn.whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar pedido.');
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoCriadoId) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Pedido enviado!</h2>
          <p className="text-gray-400 text-sm mb-5">{forn.nome} vai confirmar seu pedido em breve.</p>
          <a
            href={`/agua-gas/pedido/${pedidoCriadoId}`}
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold mb-2"
          >
            Acompanhar meu pedido
          </a>
          <button onClick={onClose} className="w-full text-gray-400 text-sm py-2">Fechar</button>
        </div>
      </div>
    );
  }

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
          {perfilCompleto ? (
            <p className="text-sm text-gray-400">
              Pedindo como <span className="text-white font-medium">{form.clienteNome}</span> · {form.clienteTelefone}
            </p>
          ) : (
            <>
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
            </>
          )}

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

          <div className={perfilCompleto ? '' : 'grid grid-cols-2 gap-3'}>
            <div>
              <label className="text-sm text-gray-400">Quantidade</label>
              <input type="number" min="1" value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            {!perfilCompleto && (
              <div>
                <label className="text-sm text-gray-400">Endereço de entrega</label>
                <input value={form.endereco} onChange={(e) => set('endereco', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Rua, número..." />
              </div>
            )}
          </div>
          {perfilCompleto && (
            <p className="text-sm text-gray-500">O fornecedor vai combinar o endereço de entrega direto pelo telefone.</p>
          )}

          {formasAceitas.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Forma de pagamento</label>
              <select value={form.formaPagamento} onChange={(e) => set('formaPagamento', e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400">
                <option value="">Selecione...</option>
                {formasAceitas.map((f) => <option key={f.chave} value={f.label}>{f.label}</option>)}
              </select>
            </div>
          )}

          {!perfilCompleto && (
            <div>
              <label className="text-sm text-gray-400">Observações</label>
              <textarea value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} rows={2}
                className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Ponto de referência, horário preferido..." />
            </div>
          )}

          <button type="submit" disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {enviando ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
          <p className="text-sm text-gray-500 text-center">
            Após confirmar, será aberto o WhatsApp do fornecedor com seu pedido.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Modal de pedido expresso (1 toque) ────────────────────────────────────────
function ModalPedidoExpresso({ forn, categoria, onClose }: { forn: Fornecedor; categoria: 'agua' | 'gas'; onClose: () => void }) {
  const descricao = (categoria === 'agua' ? forn.descricaoAguaPadrao : forn.descricaoGasPadrao) || (categoria === 'agua' ? 'Água' : 'Gás');
  const preco = Number((categoria === 'agua' ? forn.precoAguaPadrao : forn.precoGasPadrao) || 0);
  const [quantidade, setQuantidade] = useState(1);
  const [enviando, setEnviando] = useState<'online' | 'dinheiro' | null>(null);
  const [pedidoCriado, setPedidoCriado] = useState(false);
  const perfil = getCurrentUser();

  const confirmar = async (formaPagamento: 'online' | 'dinheiro') => {
    if (!perfil?.id) {
      toast.error('Complete seu cadastro no app pra fazer um pedido rápido.');
      return;
    }
    setEnviando(formaPagamento);
    try {
      const resp = await fetch('/api/agua-gas/pedido-expresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: perfil.id, fornecedorId: forn.id, categoria, quantidade, formaPagamento }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
        return;
      }
      setPedidoCriado(true);
      toast.success('Pedido confirmado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar pedido.');
    } finally {
      setEnviando(null);
    }
  };

  if (pedidoCriado) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Pedido confirmado!</h2>
          <p className="text-gray-400 text-sm mb-2">{forn.nome} vai combinar a entrega pelo seu WhatsApp.</p>
          <p className="text-gray-400 text-sm mb-5">
            Como o pagamento é em dinheiro, você e o fornecedor vão receber um aviso sobre a taxinha de uso do app (1%) — sem plano pago, ela fica pendente até ser paga.
          </p>
          <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {categoria === 'agua' ? <Droplets className="w-5 h-5 text-blue-400" /> : <Flame className="w-5 h-5 text-orange-400" />}
            <div>
              <h2 className="text-white font-bold text-lg">{descricao}</h2>
              <p className="text-gray-400 text-sm">{forn.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-sm text-gray-400">Quantidade</label>
            <div className="flex items-center justify-between mt-2 bg-slate-800 border border-white/10 rounded-xl px-4 py-3">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center">−</button>
              <span className="text-white font-bold text-lg">{quantidade}</span>
              <button type="button" onClick={() => setQuantidade((q) => Math.min(20, q + 1))} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="font-bold text-xl">R$ {(preco * quantidade).toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => confirmar('online')}
              disabled={!forn.mpConectado || enviando !== null}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {enviando === 'online' ? 'Abrindo pagamento...' : 'Pagar agora (Pix/Cartão)'}
            </button>
            {!forn.mpConectado && <p className="text-xs text-gray-500 text-center -mt-1">Esse fornecedor ainda não conectou pagamento online.</p>}
            <button
              onClick={() => confirmar('dinheiro')}
              disabled={enviando !== null}
              className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {enviando === 'dinheiro' ? 'Confirmando...' : 'Pagar em dinheiro na entrega'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal "Sou proprietário" ─────────────────────────────────────────────────
function ModalReivindicarAguaGas({ forn, onFechar, onEnviado }: {
  forn: Fornecedor; onFechar: () => void; onEnviado: () => void;
}) {
  const perfil = getCurrentUser();
  const [form, setForm] = useState({
    nomeProprietario: perfil?.nome || '',
    whatsappProprietario: perfil?.whatsapp || '',
    nome: forn.nome,
    responsavel: forn.responsavel,
    telefone: forn.telefone,
    whatsapp: forn.whatsapp || forn.telefone,
    endereco: forn.endereco,
    horario: forn.horario,
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<{ auto: boolean } | null>(null);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const enviar = async () => {
    if (!form.nomeProprietario.trim() || !form.whatsappProprietario.trim()) {
      toast.error('Preencha seu nome e WhatsApp — precisamos saber quem está reivindicando o fornecedor.');
      return;
    }
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error('Preencha nome e telefone da empresa');
      return;
    }
    if (!form.horario.trim()) {
      toast.error('Confirme o horário de funcionamento');
      return;
    }
    setEnviando(true);
    try {
      const usuarioId = perfil?.id || obterUsuarioLocalId();
      const resp = await fetch('/api/agua-gas/reivindicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fornecedorId: forn.id,
          usuarioId,
          nomeSolicitante: form.nomeProprietario,
          telefoneSolicitante: form.whatsappProprietario,
          dadosNovos: form,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setEnviado({ auto: Boolean(resultado.aprovadaAutomaticamente) });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar solicitação');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">{enviado.auto ? 'Cadastro atualizado!' : 'Solicitação enviada!'}</h2>
          <p className="text-gray-400 text-sm mb-5">
            {enviado.auto
              ? 'Agora complete com produtos, preços e foto no seu painel de fornecedor.'
              : 'Nossa equipe vai revisar e liberar em breve. Depois de aprovado, complete com produtos, preços e foto no seu painel de fornecedor.'}
          </p>
          {enviado.auto && (
            <a href="/agua-gas/fornecedor" className="block w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold mb-2">
              Completar meu cadastro
            </a>
          )}
          <button onClick={() => { setEnviado(null); onEnviado(); }} className="w-full text-gray-400 text-sm py-2">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-bold text-lg">Sou proprietário</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          <p className="text-sm text-gray-400">Confirme e atualize os dados do seu fornecedor. Sua solicitação passa por uma revisão antes de valer.</p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-3">
            <p className="text-sm font-semibold text-blue-400">Quem está reivindicando</p>
            <div>
              <label className="text-sm text-gray-400">Seu nome (proprietário) *</label>
              <input value={form.nomeProprietario} onChange={(e) => set('nomeProprietario', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Seu WhatsApp *</label>
              <input value={form.whatsappProprietario} onChange={(e) => set('whatsappProprietario', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Nome da empresa *</label>
            <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Responsável</label>
            <input value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Telefone *</label>
            <input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm text-gray-400">WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Endereço</label>
            <input value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Horário de funcionamento *</label>
            <textarea value={form.horario} onChange={(e) => set('horario', e.target.value)} rows={2} className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 shrink-0">
          <button onClick={enviar} disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
            {enviando ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </div>
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
  const [categoria, setCategoria] = useState<'agua' | 'gas' | null>(null);
  const [modalForn, setModalForn] = useState<Fornecedor | null>(null);
  const [modalExpresso, setModalExpresso] = useState<{ forn: Fornecedor; categoria: 'agua' | 'gas' } | null>(null);
  const [fornReivindicar, setFornReivindicar] = useState<Fornecedor | null>(null);
  const [recarregarChave, setRecarregarChave] = useState(0);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const escolherCategoria = (cat: 'agua' | 'gas') => {
    setCategoria(cat);
    setTipoFiltro('');
    if (!navigator.geolocation) return;
    setBuscandoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoLocalizacao(false);
      },
      () => setBuscandoLocalizacao(false),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

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
  }, [tipoFiltro, recarregarChave]); // eslint-disable-line

  const doCategoria = categoria
    ? fornecedores.filter((f) => f.produtos?.some((p) => CATEGORIAS[categoria].tipos.includes(p.tipo)))
    : fornecedores;

  const comDistancia = useMemo(() => {
    return doCategoria.map((f) => ({
      forn: f,
      distancia: userPosition && f.latitude != null && f.longitude != null
        ? distanciaKm(userPosition.lat, userPosition.lng, f.latitude, f.longitude)
        : null,
    }));
  }, [doCategoria, userPosition]);

  const ordenados = categoria && userPosition
    ? [...comDistancia].sort((a, b) => {
        if (a.distancia == null && b.distancia == null) return 0;
        if (a.distancia == null) return 1;
        if (b.distancia == null) return -1;
        return a.distancia - b.distancia;
      })
    : [...comDistancia.filter((c) => c.forn.destaque), ...comDistancia.filter((c) => !c.forn.destaque)];

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
        {/* Escolha rápida: 2 botões */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => escolherCategoria('agua')}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-6 border transition-colors ${
              categoria === 'agua' ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-white/10 hover:border-blue-500/40'
            }`}
          >
            <Droplets className={`w-8 h-8 ${categoria === 'agua' ? 'text-white' : 'text-blue-400'}`} />
            <span className="font-bold text-white">Água</span>
          </button>
          <button
            onClick={() => escolherCategoria('gas')}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-6 border transition-colors ${
              categoria === 'gas' ? 'bg-orange-600 border-orange-400' : 'bg-slate-900 border-white/10 hover:border-orange-500/40'
            }`}
          >
            <Flame className={`w-8 h-8 ${categoria === 'gas' ? 'text-white' : 'text-orange-400'}`} />
            <span className="font-bold text-white">Gás</span>
          </button>
        </div>

        {categoria && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {buscandoLocalizacao ? 'Localizando você...' : userPosition ? 'Ordenado por proximidade' : 'Localização indisponível — ordem padrão'}
            </p>
            <button onClick={() => setCategoria(null)} className="text-sm text-gray-500 hover:text-gray-300 underline">Ver tudo</button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          {(categoria ? FILTROS.filter((f) => !f.id || CATEGORIAS[categoria].tipos.includes(f.id)) : FILTROS).map((f) => (
            <button
              key={f.id}
              onClick={() => setTipoFiltro(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tipoFiltro === f.id ? 'bg-white text-slate-900' : 'bg-white/10 text-gray-300'}`}
            >
              {f.id.startsWith('gas') ? '🔥' : f.id ? '💧' : '🏪'} {f.label}
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
            {ordenados.map(({ forn, distancia }) => (
              <CardFornecedor
                key={forn.id}
                forn={forn}
                categoria={categoria}
                onPedir={setModalForn}
                onPedirExpresso={(f, cat) => setModalExpresso({ forn: f, categoria: cat })}
                onReivindicar={setFornReivindicar}
                distanciaKm={distancia}
              />
            ))}
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
      {modalExpresso && (
        <ModalPedidoExpresso forn={modalExpresso.forn} categoria={modalExpresso.categoria} onClose={() => setModalExpresso(null)} />
      )}
      {fornReivindicar && (
        <ModalReivindicarAguaGas
          forn={fornReivindicar}
          onFechar={() => setFornReivindicar(null)}
          onEnviado={() => { setFornReivindicar(null); setRecarregarChave((k) => k + 1); }}
        />
      )}
    </div>
  );
}


