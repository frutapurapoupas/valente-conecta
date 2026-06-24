'use client';

import { useState } from 'react';
import { Droplets, Flame, ChevronLeft, Plus, Trash2, CheckCircle, Store, Package, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TIPOS_PRODUTO = [
  { id: 'agua_garrafao', label: 'Garrafão 20L',   unidade: 'unidade' },
  { id: 'agua_mineral',  label: 'Água Mineral',   unidade: 'fardo'   },
  { id: 'gas_p13',       label: 'Gás P13',        unidade: 'unidade' },
  { id: 'gas_p20',       label: 'Gás P20',        unidade: 'unidade' },
  { id: 'gas_p45',       label: 'Gás P45',        unidade: 'unidade' },
  { id: 'gas_granel',    label: 'Gás Granel',     unidade: 'kg'      },
  { id: 'outro',         label: 'Outro produto',  unidade: 'unidade' },
];

interface Produto {
  tipo: string; descricao: string; preco: number; unidade: string; disponivel: boolean;
}

const produtoVazio = (): Produto => ({
  tipo: 'agua_garrafao', descricao: '', preco: 0, unidade: 'unidade', disponivel: true
});

type Step = 'dados' | 'produtos' | 'sucesso';

export default function CadastroFornecedorAguaGas() {
  const [step, setStep] = useState<Step>('dados');
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nome: '', responsavel: '', telefone: '', whatsapp: '',
    bairro: '', descricao: '', foto: '', horario: '',
    temEntrega: true, taxaEntrega: '0', freteGratisAcima: '0'
  });
  const [produtos, setProdutos] = useState<Produto[]>([produtoVazio()]);

  const setF = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const addProduto = () => setProdutos((p) => [...p, produtoVazio()]);
  const removeProduto = (i: number) => setProdutos((p) => p.filter((_, idx) => idx !== i));
  const setProd = (i: number, k: keyof Produto, v: any) =>
    setProdutos((p) => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error('Nome da empresa e telefone são obrigatórios.');
      return;
    }
    if (produtos.length === 0 || produtos.every((p) => !p.descricao && !p.tipo)) {
      toast.error('Adicione ao menos um produto.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch('/api/agua-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cidade: 'Valente',
          taxaEntrega: Number(form.taxaEntrega || 0),
          freteGratisAcima: Number(form.freteGratisAcima || 0),
          produtos: produtos.map((p) => ({
            ...p,
            descricao: p.descricao || TIPOS_PRODUTO.find((t) => t.id === p.tipo)?.label || p.tipo,
            preco: Number(p.preco || 0)
          }))
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erro ao cadastrar.');
      setStep('sucesso');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar cadastro.');
    } finally {
      setEnviando(false);
    }
  };

  // ── Sucesso ─────────────────────────────────────────────────────────────────
  if (step === 'sucesso') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <Toaster position="top-right" />
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Cadastro enviado!</h1>
          <p className="text-gray-400 mt-3">
            Sua empresa foi recebida e será publicada após revisão. Em breve os clientes poderão encontrá-la.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <a href="/agua-gas" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
              Ver fornecedores
            </a>
            <a href="/" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-colors">
              Voltar ao início
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto">
        <a href="/agua-gas" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </a>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-1">
            <Droplets className="w-8 h-8 text-blue-400" />
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Cadastrar empresa</h1>
            <p className="text-gray-400 text-sm">Água e Gás – Valente Conecta</p>
          </div>
        </div>

        {/* Progresso */}
        <div className="flex items-center gap-2 mb-8">
          {(['dados', 'produtos'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s || (step === 'sucesso') ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${step === s ? 'text-white font-semibold' : 'text-gray-500'}`}>
                {s === 'dados' ? 'Dados da empresa' : 'Produtos'}
              </span>
              {i < 1 && <div className="w-8 h-px bg-white/20" />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 'dados' ? (e) => { e.preventDefault(); setStep('produtos'); } : handleSubmit}
          className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">

          {/* ── STEP DADOS ─────────────────────────────────────────────────── */}
          {step === 'dados' && (
            <>
              <div>
                <label className="text-sm text-gray-400">Nome da empresa *</label>
                <input value={form.nome} onChange={(e) => setF('nome', e.target.value)} required
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ex: Águas do Valente, Gasista Zé" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Responsável / Proprietário</label>
                <input value={form.responsavel} onChange={(e) => setF('responsavel', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Nome do dono ou responsável" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400">Telefone *</label>
                  <input value={form.telefone} onChange={(e) => setF('telefone', e.target.value)} required
                    className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="(75) 99999-0000" />
                </div>
                <div>
                  <label className="text-sm text-gray-400">WhatsApp</label>
                  <input value={form.whatsapp} onChange={(e) => setF('whatsapp', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Igual ao telefone" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Bairro / Referência</label>
                <input value={form.bairro} onChange={(e) => setF('bairro', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ex: Centro, Alto da Boa Vista..." />
              </div>

              <div>
                <label className="text-sm text-gray-400">Horário de funcionamento</label>
                <input value={form.horario} onChange={(e) => setF('horario', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ex: Seg a Sab das 7h às 18h" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Descrição (opcional)</label>
                <textarea value={form.descricao} onChange={(e) => setF('descricao', e.target.value)} rows={2}
                  className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="Fale sobre sua empresa, diferenciais..." />
              </div>

              {/* Entrega */}
              <div className="border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="entrega" checked={form.temEntrega} onChange={(e) => setF('temEntrega', e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="entrega" className="text-sm text-gray-300 font-medium">Faz entrega</label>
                </div>
                {form.temEntrega && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400">Taxa de entrega (R$)</label>
                      <input type="number" min="0" step="0.50" value={form.taxaEntrega} onChange={(e) => setF('taxaEntrega', e.target.value)}
                        className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="0 = grátis" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Frete grátis acima de (R$)</label>
                      <input type="number" min="0" value={form.freteGratisAcima} onChange={(e) => setF('freteGratisAcima', e.target.value)}
                        className="w-full mt-1 bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="0 = não aplica" />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                Próximo: Produtos →
              </button>
            </>
          )}

          {/* ── STEP PRODUTOS ──────────────────────────────────────────────── */}
          {step === 'produtos' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-white">Seus produtos</h2>
                  <p className="text-gray-400 text-sm">Adicione os produtos que você vende e seus preços.</p>
                </div>
                <button type="button" onClick={() => setStep('dados')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />Voltar
                </button>
              </div>

              {produtos.map((p, i) => (
                <div key={i} className="bg-slate-800 border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Produto {i + 1}
                    </span>
                    {produtos.length > 1 && (
                      <button type="button" onClick={() => removeProduto(i)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Tipo</label>
                      <select value={p.tipo} onChange={(e) => {
                        const t = TIPOS_PRODUTO.find((x) => x.id === e.target.value);
                        setProd(i, 'tipo', e.target.value);
                        if (t) setProd(i, 'unidade', t.unidade);
                      }} className="w-full mt-1 bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                        {TIPOS_PRODUTO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Descrição (ex: "Garrafão Itambé")</label>
                      <input value={p.descricao} onChange={(e) => setProd(i, 'descricao', e.target.value)}
                        className="w-full mt-1 bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="Deixe em branco para padrão" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Preço (R$)</label>
                      <input type="number" min="0" step="0.50" value={p.preco} onChange={(e) => setProd(i, 'preco', Number(e.target.value))}
                        className="w-full mt-1 bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="0 = consultar" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Unidade</label>
                      <input value={p.unidade} onChange={(e) => setProd(i, 'unidade', e.target.value)}
                        className="w-full mt-1 bg-slate-700 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        placeholder="unidade, kg, fardo..." />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`disp_${i}`} checked={p.disponivel} onChange={(e) => setProd(i, 'disponivel', e.target.checked)} className="w-4 h-4 accent-green-500" />
                    <label htmlFor={`disp_${i}`} className="text-sm text-gray-300">Disponível para venda</label>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addProduto}
                className="w-full border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar produto
              </button>

              <button type="submit" disabled={enviando}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base">
                {enviando ? 'Enviando cadastro...' : 'Finalizar Cadastro'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Sua empresa será revisada antes de ser publicada. Você receberá um contato da equipe Valente Conecta.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
