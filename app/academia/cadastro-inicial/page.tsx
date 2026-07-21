"use client";

export const dynamic = 'force-dynamic';  // ? ÃšNICA LINHA ADICIONADA

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Ruler, Scale, Activity, Target, Heart, ArrowLeft, Save, Edit } from 'lucide-react';

interface PerfilUsuario {
  nome: string;
  altura: string;
  peso: string;
  pesoMeta: string;
  idade: string;
  sexo: 'masculino' | 'feminino' | 'outro';
  condicaoFisica: string;
  nivelVida: string;
  objetivos: string[];
  condicoesMedicas: string[];
  freqSemanal: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  tipoExercicio: string[];
}

const objetivosOpcoes = [
  'Emagrecimento',
  'Ganho de massa muscular',
  'Condicionamento fÃ­sico',
  'SaÃºde geral',
  'ForÃ§a',
  'Flexibilidade',
  'ResistÃªncia'
];

const condicoesOpcoes = [
  'Diabetes',
  'HipertensÃ£o',
  'Problemas cardÃ­acos',
  'Asma',
  'LesÃµes anteriores',
  'Dores nas articulaÃ§Ãµes',
  'Nenhuma'
];

const condicaoFisicaOpcoes = [
  'SedentÃ¡rio',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Atleta'
];

const nivelVidaOpcoes = [
  'Trabalho sentado',
  'Trabalho em pÃ©',
  'Trabalho fÃ­sico leve',
  'Trabalho fÃ­sico pesado',
  'Estudante'
];

export default function CadastroInicialPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome: '', altura: '', peso: '', pesoMeta: '', idade: '', sexo: 'masculino',
    condicaoFisica: '', nivelVida: '', objetivos: [], condicoesMedicas: [],
    freqSemanal: '3', nivel: 'iniciante', tipoExercicio: []
  });
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const nomeSalvo = localStorage.getItem('usuario_nome');
    if (nomeSalvo) setPerfil(prev => ({ ...prev, nome: nomeSalvo }));
    const perfilSalvo = localStorage.getItem('academia_perfil_inicial');
    if (perfilSalvo) { setPerfil(JSON.parse(perfilSalvo)); setSalvo(true); }
  }, []);

  const toggleObjetivo = (objetivo: string) => {
    setPerfil(prev => ({ ...prev, objetivos: prev.objetivos.includes(objetivo) ? prev.objetivos.filter(o => o !== objetivo) : [...prev.objetivos, objetivo] }));
  };

  const toggleCondicao = (condicao: string) => {
    if (condicao === 'Nenhuma') {
      setPerfil(prev => ({ ...prev, condicoesMedicas: prev.condicoesMedicas.includes('Nenhuma') ? [] : ['Nenhuma'] }));
    } else {
      setPerfil(prev => ({ ...prev, condicoesMedicas: prev.condicoesMedicas.includes(condicao) ? prev.condicoesMedicas.filter(c => c !== condicao) : [...prev.condicoesMedicas.filter(c => c !== 'Nenhuma'), condicao] }));
    }
  };

  const handleSalvar = () => {
    localStorage.setItem('academia_perfil_inicial', JSON.stringify(perfil));
    const perfilIA = {
      id: 1, user_id: 'demo-user', nome: perfil.nome, peso_atual: parseFloat(perfil.peso),
      peso_meta: parseFloat(perfil.pesoMeta), altura: parseFloat(perfil.altura), idade: parseInt(perfil.idade),
      sexo: perfil.sexo, objetivo: perfil.objetivos.includes('Emagrecimento') ? 'emagrecer' :
                 perfil.objetivos.includes('Ganho de massa muscular') ? 'hipertrofia' :
                 perfil.objetivos.includes('Condicionamento fÃ­sico') ? 'condicionamento' : 'saude',
      nivel: perfil.nivel, freq_semanal: parseInt(perfil.freqSemanal), condicoes_fisicas: perfil.condicoesMedicas,
      tipo_exercicio: perfil.tipoExercicio, ativo: true
    };
    localStorage.setItem('academia_perfil_ia', JSON.stringify(perfilIA));
    localStorage.setItem('usuario_nome', perfil.nome);
    setSalvo(true);
    alert('Perfil salvo com sucesso! IA configurada.');
    router.push('/academia');
  };

  if (salvo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
        <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
          <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
            <Link href="/academia" className="relative group"><ArrowLeft className="w-6 h-6 text-yellow-400" /></Link>
            <div className="font-black uppercase italic text-white text-sm tracking-widest"><span>PERFIL</span></div>
            <button onClick={() => setSalvo(false)} className="relative group"><Edit className="w-6 h-6 text-yellow-400" /></button>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3"><User className="w-5 h-5 text-indigo-400" /><div><p className="text-xs text-zinc-400">Nome</p><p className="font-bold text-white">{perfil.nome}</p></div></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2"><Ruler className="w-5 h-5 text-emerald-400" /><div><p className="text-xs text-zinc-400">Altura</p><p className="font-bold text-white">{perfil.altura} cm</p></div></div>
              <div className="flex items-center gap-2"><Scale className="w-5 h-5 text-blue-400" /><div><p className="text-xs text-zinc-400">Peso</p><p className="font-bold text-white">{perfil.peso} kg</p></div></div>
              <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-pink-400" /><div><p className="text-xs text-zinc-400">Idade</p><p className="font-bold text-white">{perfil.idade} anos</p></div></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"><h3 className="font-bold text-white">?? Objetivos</h3><div className="flex flex-wrap gap-2 mt-2">{perfil.objetivos.map(obj => (<span key={obj} className="px-3 py-1 bg-purple-500/30 rounded-full text-sm">{obj}</span>))}</div></div>
          <button onClick={() => router.push('/academia')} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold">Ir para Academia</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/academia" className="relative group"><ArrowLeft className="w-6 h-6 text-yellow-400" /></Link>
          <div className="font-black uppercase italic text-white text-sm tracking-widest"><span>CADASTRO INICIAL</span></div>
          <div className="w-6" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"><User className="w-10 h-10 text-white" /></div><h1 className="text-2xl font-black text-white">Seu Perfil FÃ­sico</h1><p className="text-zinc-400">Configure suas caracterÃ­sticas e metas</p></div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
          <input type="text" placeholder="Nome" value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Altura (cm)" value={perfil.altura} onChange={e => setPerfil({...perfil, altura: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" /><input type="number" placeholder="Idade" value={perfil.idade} onChange={e => setPerfil({...perfil, idade: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" /></div>
          <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Peso atual (kg)" value={perfil.peso} onChange={e => setPerfil({...perfil, peso: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" /><input type="number" placeholder="Peso meta (kg)" value={perfil.pesoMeta} onChange={e => setPerfil({...perfil, pesoMeta: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" /></div>
          <div className="grid grid-cols-3 gap-2">{['masculino', 'feminino', 'outro'].map(sexo => (<button key={sexo} onClick={() => setPerfil({...perfil, sexo: sexo as any})} className={`py-3 rounded-xl text-sm font-bold border-2 ${perfil.sexo === sexo ? 'border-indigo-500 bg-indigo-500/30' : 'border-white/20'}`}>{sexo}</button>))}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"><h3 className="font-bold text-white">?? Objetivos</h3><div className="flex flex-wrap gap-2 mt-2">{objetivosOpcoes.map(obj => (<button key={obj} onClick={() => toggleObjetivo(obj)} className={`px-4 py-2 rounded-full text-sm border-2 ${perfil.objetivos.includes(obj) ? 'border-purple-500 bg-purple-500/30' : 'border-white/20'}`}>{obj}</button>))}</div></div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"><h3 className="font-bold text-white">?? CondiÃ§Ãµes MÃ©dicas</h3><div className="flex flex-wrap gap-2 mt-2">{condicoesOpcoes.map(cond => (<button key={cond} onClick={() => toggleCondicao(cond)} className={`px-4 py-2 rounded-full text-sm border-2 ${perfil.condicoesMedicas.includes(cond) ? 'border-red-500 bg-red-500/30' : 'border-white/20'}`}>{cond}</button>))}</div></div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"><h3 className="font-bold text-white">?? ConfiguraÃ§Ãµes da IA</h3>
          <label className="text-xs text-zinc-400">FrequÃªncia semanal</label>
          <div className="grid grid-cols-4 gap-2 mt-2">{[1,2,3,4,5,6,7].map(freq => (<button key={freq} onClick={() => setPerfil({...perfil, freqSemanal: freq.toString()})} className={`py-3 rounded-xl text-sm font-bold border-2 ${perfil.freqSemanal === freq.toString() ? 'border-emerald-500 bg-emerald-500/30' : 'border-white/20'}`}>{freq}</button>))}</div>
          <label className="text-xs text-zinc-400 mt-3">NÃ­vel de treino</label>
          <div className="grid grid-cols-3 gap-2 mt-2">{['iniciante', 'intermediario', 'avancado'].map(nivel => (<button key={nivel} onClick={() => setPerfil({...perfil, nivel: nivel as any})} className={`py-3 rounded-xl text-sm font-bold border-2 ${perfil.nivel === nivel ? 'border-emerald-500 bg-emerald-500/30' : 'border-white/20'}`}>{nivel}</button>))}</div>
        </div>

        <button onClick={handleSalvar} disabled={!perfil.nome || !perfil.altura || !perfil.peso || !perfil.idade || !perfil.pesoMeta} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg disabled:opacity-40">Salvar Perfil e Configurar IA</button>
      </main>
    </div>
  );
}

