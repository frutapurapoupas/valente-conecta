'use client';

import { useState } from 'react';
import {
  HardHat, Hammer, Paintbrush2, Zap, Droplets, TreePine,
  Laptop, Scissors, Wrench, CheckCircle, ChevronLeft, User, Phone, MapPin, Clock, DollarSign, Star
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORIAS = [
  { id: 'pedreiro',    label: 'Pedreiro',    icon: HardHat,     descricao: 'Construcao, reforma, reboco, assentamento' },
  { id: 'carpinteiro', label: 'Carpinteiro', icon: Hammer,      descricao: 'Madeira, forros, portas, estruturas' },
  { id: 'pintor',      label: 'Pintor',      icon: Paintbrush2, descricao: 'Pintura interna, externa, textura, gesso' },
  { id: 'eletricista', label: 'Eletricista', icon: Zap,         descricao: 'Instalacoes, manutencao eletrica, AR' },
  { id: 'encanador',   label: 'Encanador',   icon: Droplets,    descricao: 'Hidraulica, vazamentos, instalacoes' },
  { id: 'marceneiro',  label: 'Marceneiro',  icon: Wrench,      descricao: 'Moveis sob medida, reparos em madeira' },
  { id: 'jardineiro',  label: 'Jardineiro',  icon: TreePine,    descricao: 'Jardins, poda, paisagismo, limpeza de terreno' },
  { id: 'informatica', label: 'Informatica', icon: Laptop,      descricao: 'Manutencao de computadores, redes, suporte' },
  { id: 'diarista',    label: 'Diarista',    icon: Scissors,    descricao: 'Limpeza residencial e comercial' },
  { id: 'outros',      label: 'Outros',      icon: Wrench,      descricao: 'Outras especialidades e servicos gerais' },
];

const PLANOS = [
  {
    id: 'basico',
    label: 'Basico',
    preco: 'Gratis',
    cor: 'border-gray-500',
    corBtn: 'bg-gray-600 hover:bg-gray-500',
    features: ['Perfil publico visivel', 'Receber solicitacoes', 'Contato via WhatsApp']
  },
  {
    id: 'premium',
    label: 'Premium',
    preco: 'R$ 25/mes',
    cor: 'border-yellow-500',
    corBtn: 'bg-yellow-600 hover:bg-yellow-500',
    features: ['Tudo do Basico', 'Destaque no topo da lista', 'Selo Premium visivel', 'Mais visibilidade nas buscas'],
    destaque: true
  },
];

interface FormData {
  nome: string; telefone: string; whatsapp: string; bairro: string;
  descricao: string; especialidades: string; experiencia: string;
  precoHora: string; disponibilidade: string; categoria: string; plano: string; foto: string;
}

const emptyForm: FormData = {
  nome: '', telefone: '', whatsapp: '', bairro: '', descricao: '',
  especialidades: '', experiencia: '', precoHora: '', disponibilidade: '', categoria: '', plano: 'basico', foto: ''
};

export default function CadastroProfissionalPage() {
  const [step, setStep] = useState<'categoria' | 'plano' | 'form' | 'sucesso'>('categoria');
  const [form, setForm] = useState<FormData>(emptyForm);
  const [enviando, setEnviando] = useState(false);

  const set = (k: keyof FormData, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim() || !form.categoria) {
      toast.error('Preencha nome, telefone e categoria.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/profissionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experiencia: Number(form.experiencia || 0),
          precoHora: Number(form.precoHora || 0),
          especialidades: form.especialidades.split(',').map((s) => s.trim()).filter(Boolean),
          cidade: 'Valente',
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

  /* â”€â”€ Step: Escolha de categoria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (step === 'categoria') {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto">
          <a href="/profissionais" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </a>
          <h1 className="text-2xl font-extrabold mb-1">Anunciar meus servicos</h1>
          <p className="text-gray-400 mb-8">Escolha a categoria que melhor representa sua profissao:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              const selecionado = form.categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { set('categoria', cat.id); setStep('plano'); }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${selecionado ? 'border-orange-400 bg-orange-500/10' : 'border-white/10 bg-slate-900 hover:border-white/30'}`}
                >
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{cat.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.descricao}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* â”€â”€ Step: Escolha de plano â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (step === 'plano') {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep('categoria')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <h1 className="text-2xl font-extrabold mb-1">Escolha seu plano</h1>
          <p className="text-gray-400 mb-8">Comece gratuitamente ou ganhe mais visibilidade com o Premium.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANOS.map((plano) => (
              <div key={plano.id} className={`relative rounded-2xl border-2 p-6 ${plano.cor} ${plano.destaque ? 'bg-yellow-500/5' : 'bg-slate-900'}`}>
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{plano.label}</h3>
                <p className="text-2xl font-extrabold mt-1 mb-4 text-orange-400">{plano.preco}</p>
                <ul className="space-y-2 mb-6">
                  {plano.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { set('plano', plano.id); setStep('form'); }}
                  className={`w-full py-3 rounded-xl text-white font-bold transition-colors ${plano.corBtn}`}
                >
                  Continuar com {plano.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* â”€â”€ Step: Formulario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (step === 'form') {
    const catSel = CATEGORIAS.find((c) => c.id === form.categoria);
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep('plano')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold">Seus dados</h1>
            <p className="text-gray-400">
              {catSel?.label} Â· Plano{' '}
              <span className={form.plano === 'premium' ? 'text-yellow-400' : 'text-gray-300'}>
                {form.plano === 'premium' ? 'Premium (R$ 25/mes)' : 'Basico (Gratis)'}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 border border-white/10 rounded-2xl p-6">
            {/* Nome */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><User className="w-4 h-4" />Nome completo *</label>
              <input value={form.nome} onChange={(e) => set('nome', e.target.value)} required className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="Seu nome completo" />
            </div>

            {/* Telefone + WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Phone className="w-4 h-4" />Telefone *</label>
                <input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="(75) 99999-0000" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Phone className="w-4 h-4" />WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="Igual ao telefone" />
              </div>
            </div>

            {/* Bairro */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><MapPin className="w-4 h-4" />Bairro / Referencia</label>
              <input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="Ex: Centro, Bairro Novo..." />
            </div>

            {/* Especialidades */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Star className="w-4 h-4" />Especialidades (separadas por virgula)</label>
              <input value={form.especialidades} onChange={(e) => set('especialidades', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder={catSel?.id === 'pedreiro' ? 'Reboco, fundacao, alvenaria' : catSel?.id === 'pintor' ? 'Pintura interna, textura, gesso' : 'Liste suas especialidades'} />
            </div>

            {/* Descricao */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Star className="w-4 h-4" />Descricao dos seus servicos</label>
              <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)} rows={3} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" placeholder="Conte um pouco sobre sua experiencia e os servicos que oferece..." />
            </div>

            {/* Experiencia + Preco */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Clock className="w-4 h-4" />Anos de experiencia</label>
                <input type="number" min="0" value={form.experiencia} onChange={(e) => set('experiencia', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="0" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><DollarSign className="w-4 h-4" />Preco por hora/dia (R$)</label>
                <input type="number" min="0" step="0.01" value={form.precoHora} onChange={(e) => set('precoHora', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="0,00 (0 = a combinar)" />
              </div>
            </div>

            {/* Disponibilidade */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1"><Clock className="w-4 h-4" />Disponibilidade</label>
              <input value={form.disponibilidade} onChange={(e) => set('disponibilidade', e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" placeholder="Ex: Segunda a Sexta, manha e tarde" />
            </div>

            <button type="submit" disabled={enviando} className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base">
              {enviando ? 'Enviando cadastro...' : 'Finalizar Cadastro'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Seu perfil sera revisado e publicado em breve. Profissionais Premium ficam em destaque automaticamente.
            </p>
          </form>
        </div>
      </div>
    );
  }

  /* â”€â”€ Step: Sucesso â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Cadastro enviado!</h1>
        <p className="text-gray-400 mt-3">
          Seu perfil foi recebido e sera publicado apos revisao. Voce ja pode ser encontrado pelos clientes em breve.
        </p>
        {form.plano === 'premium' && (
          <p className="mt-4 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
            Para ativar o plano Premium (R$ 25/mes), entre em contato via WhatsApp ou aguarde o retorno da equipe Valente Conecta.
          </p>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <a href="/profissionais" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors">
            Ver profissionais
          </a>
          <a href="/" className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-colors">
            Voltar ao inicio
          </a>
        </div>
      </div>
    </div>
  );
}

