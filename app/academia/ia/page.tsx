"use client";

export const dynamic = 'force-dynamic';  // ← ÚNICA LINHA ADICIONADA

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Brain, Heart, Activity, TrendingUp, Clock, 
  Target, Zap, AlertCircle, CheckCircle, ChevronRight, 
  Droplet, Moon, Sun, Dumbbell, Bell, ArrowLeft, 
  Flame, Weight, Ruler, Calendar, Scale
} from 'lucide-react';

interface PerfilUsuario {
  nome: string;
  peso_atual: number;
  peso_meta: number;
  altura: number;
  idade: number;
  sexo: string;
  objetivo: string;
  nivel: string;
  freq_semanal: number;
  condicoes_fisicas: string[];
}

interface PlanoTreino {
  duracao_minutos: number;
  calorias_estimadas: number;
  intensidade: 'leve' | 'moderado' | 'intenso';
  foco_muscular: string[];
  exercicios_sugeridos: string[];
  sugestao_principal: string;
  sugestao_secundaria: string;
  alertas: string[];
}

export default function DashboardIAPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [planoHoje, setPlanoHoje] = useState<PlanoTreino | null>(null);
  const [scoreRecuperacao, setScoreRecuperacao] = useState<{ valor: number; classificacao: string; recomendacao: string } | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricasHoje, setMetricasHoje] = useState<any>(null);
  const [ultimosTreinos, setUltimosTreinos] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const carregarDados = () => {
    const perfilSalvo = localStorage.getItem('academia_perfil_ia');
    const perfilInicial = localStorage.getItem('academia_perfil_inicial');
    const registrosTreinos = localStorage.getItem('academia_registros_treinos');
    
    let dadosPerfil = null;
    
    if (perfilSalvo) {
      dadosPerfil = JSON.parse(perfilSalvo);
    } else if (perfilInicial) {
      const data = JSON.parse(perfilInicial);
      dadosPerfil = {
        nome: data.nome,
        peso_atual: parseFloat(data.peso),
        peso_meta: parseFloat(data.pesoMeta),
        altura: parseFloat(data.altura),
        idade: parseInt(data.idade),
        sexo: data.sexo,
        objetivo: data.objetivos?.includes('Emagrecimento') ? 'emagrecer' :
                   data.objetivos?.includes('Ganho de massa muscular') ? 'hipertrofia' :
                   data.objetivos?.includes('Condicionamento físico') ? 'condicionamento' : 'saude',
        nivel: data.nivel || 'iniciante',
        freq_semanal: parseInt(data.freqSemanal) || 3,
        condicoes_fisicas: data.condicoesMedicas || []
      };
    }
    
    setPerfil(dadosPerfil);
    
    if (dadosPerfil) {
      if (registrosTreinos) {
        const treinos = JSON.parse(registrosTreinos);
        setUltimosTreinos(treinos.slice(-5));
      }
      
      // Score de recuperação
      let score = 70;
      let classificacao = "Boa";
      let recomendacao = "Continue com os treinos regulares";
      
      setScoreRecuperacao({ valor: score, classificacao, recomendacao });
      
      setMetricasHoje({
        passos: Math.floor(Math.random() * 5000) + 3000,
        freq_cardiaca_media: 70,
        sono_horas: 7.5,
        tempo_ativo_minutos: ultimosTreinos.length > 0 ? 45 : 20
      });
      
      const novasRecomendacoes = [];
      
      if (dadosPerfil.objetivo === 'emagrecer') {
        novasRecomendacoes.push({
          id: 1, titulo: "🎯 Foco no Emagrecimento", 
          mensagem: `Priorize exercícios aeróbicos e mantenha déficit calórico moderado.`,
          prioridade: "alta", tipo: "treino"
        });
      } else if (dadosPerfil.objetivo === 'hipertrofia') {
        novasRecomendacoes.push({
          id: 1, titulo: "💪 Foco na Hipertrofia", 
          mensagem: `Priorize treinos com pesos e ingestão adequada de proteínas.`,
          prioridade: "alta", tipo: "treino"
        });
      } else if (dadosPerfil.objetivo === 'condicionamento') {
        novasRecomendacoes.push({
          id: 1, titulo: "🏃 Foco no Condicionamento", 
          mensagem: `Trabalhe resistência cardiovascular e força funcional.`,
          prioridade: "alta", tipo: "treino"
        });
      }
      
      if (dadosPerfil.freq_semanal < 3) {
        novasRecomendacoes.push({
          id: 2, titulo: "📈 Aumente sua frequência", 
          mensagem: `Você treina apenas ${dadosPerfil.freq_semanal}x por semana. Tente aumentar para 4-5x para melhores resultados.`,
          prioridade: "media", tipo: "treino"
        });
      }
      
      setRecomendacoes(novasRecomendacoes);
    }
    
    setLoading(false);
  };

  const gerarPlanoTreino = () => {
    if (!perfil) return;
    
    let intensidade: 'leve' | 'moderado' | 'intenso' = 'moderado';
    if (perfil.nivel === 'iniciante') intensidade = 'leve';
    if (perfil.nivel === 'avancado') intensidade = 'intenso';
    
    let duracao_minutos = 45;
    if (perfil.freq_semanal <= 2) duracao_minutos = 60;
    if (perfil.freq_semanal >= 5) duracao_minutos = 30;
    
    let foco_muscular: string[] = [];
    let exercicios_sugeridos: string[] = [];
    
    if (perfil.objetivo === 'emagrecer') {
      foco_muscular = ["Full body", "Cardio"];
      exercicios_sugeridos = ["Corrida 20min", "Agachamento", "Prancha"];
    } else if (perfil.objetivo === 'hipertrofia') {
      foco_muscular = ["Peito", "Costas", "Pernas"];
      exercicios_sugeridos = ["Supino Reto", "Puxada Frontal", "Agachamento Livre"];
    } else if (perfil.objetivo === 'condicionamento') {
      foco_muscular = ["Cardio", "Core"];
      exercicios_sugeridos = ["Corrida Intervalada", "Prancha", "Burpees"];
    } else {
      foco_muscular = ["Corpo inteiro"];
      exercicios_sugeridos = ["Caminhada", "Alongamento", "Prancha"];
    }
    
    const caloriasPorMinuto = perfil.peso_atual * 0.08;
    const calorias_estimadas = Math.round(caloriasPorMinuto * duracao_minutos);
    
    let sugestao_principal = `Hoje foque em ${foco_muscular.join(" e ")}.`;
    let sugestao_secundaria = "Mantenha a hidratação e respiração correta.";
    let alertas: string[] = ["💧 Beba água antes, durante e depois do treino"];
    
    if (perfil.condicoes_fisicas?.length > 0) {
      alertas.push(`⚠️ Atenção: Consulte um médico regularmente.`);
    }
    
    const novoPlano: PlanoTreino = {
      duracao_minutos,
      calorias_estimadas,
      intensidade,
      foco_muscular,
      exercicios_sugeridos,
      sugestao_principal,
      sugestao_secundaria,
      alertas
    };
    
    setPlanoHoje(novoPlano);
    localStorage.setItem('academia_plano_hoje', JSON.stringify(novoPlano));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Brain className="w-16 h-16 text-yellow-400 animate-pulse" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Complete seu perfil</h2>
          <Link href="/academia/cadastro-inicial" className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">
            Fazer Cadastro
          </Link>
        </div>
      </div>
    );
  }

  // CALCULAR IMC CORRETAMENTE
  const alturaEmMetros = perfil.altura / 100;
  const imcCalculado = perfil.peso_atual / (alturaEmMetros * alturaEmMetros);
  let statusImc = '';
  let corImc = '';
  
  if (imcCalculado < 18.5) { statusImc = 'Abaixo do peso'; corImc = 'text-yellow-400'; }
  else if (imcCalculado < 25) { statusImc = 'Peso saudável'; corImc = 'text-green-400'; }
  else if (imcCalculado < 30) { statusImc = 'Sobrepeso'; corImc = 'text-orange-400'; }
  else { statusImc = 'Obesidade'; corImc = 'text-red-400'; }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/academia")} className="p-2 bg-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Brain className="w-5 h-5 text-yellow-400" />IA Fitness
          </h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Perfil resumido com IMC corrigido */}
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Olá,</p>
              <p className="text-lg font-bold text-white">{perfil.nome}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Objetivo</p>
              <p className="text-sm text-yellow-400 font-bold">
                {perfil.objetivo === 'emagrecer' ? '🎯 Emagrecimento' :
                 perfil.objetivo === 'hipertrofia' ? '💪 Hipertrofia' :
                 perfil.objetivo === 'condicionamento' ? '🏃 Condicionamento' : '❤️ Saúde'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1"><Weight className="w-3 h-3 text-blue-400" /><span className="text-xs text-zinc-400">{perfil.peso_atual}kg</span></div>
            <div className="flex items-center gap-1"><Ruler className="w-3 h-3 text-green-400" /><span className="text-xs text-zinc-400">{(perfil.altura/100).toFixed(2)}m</span></div>
            <div className="flex items-center gap-1"><Scale className="w-3 h-3 text-purple-400" /><span className={`text-xs font-bold ${corImc}`}>IMC: {imcCalculado.toFixed(1)}</span></div>
          </div>
        </div>

        {/* Score de Recuperação */}
        {scoreRecuperacao && (
          <div className={`bg-gradient-to-br ${scoreRecuperacao.valor >= 70 ? 'from-green-500 to-emerald-500' : scoreRecuperacao.valor >= 50 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'} rounded-2xl p-5 text-white`}>
            <div className="flex justify-between mb-3">
              <div><h3 className="font-bold">Recuperação</h3><p className="text-xs opacity-90">{scoreRecuperacao.classificacao}</p></div>
              {scoreRecuperacao.valor >= 70 ? <CheckCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
            </div>
            <div className="text-3xl font-black mb-2">{scoreRecuperacao.valor}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-3"><div className="bg-white rounded-full h-2" style={{ width: `${scoreRecuperacao.valor}%` }} /></div>
            <p className="text-xs opacity-90">{scoreRecuperacao.recomendacao}</p>
          </div>
        )}

        {/* Plano de Treino */}
        <div className="bg-zinc-900 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Dumbbell className="w-5 h-5 text-yellow-400" />Plano de Treino</h3>
            {!planoHoje && (
              <button onClick={gerarPlanoTreino} className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition">
                GERAR PLANO
              </button>
            )}
          </div>
          
          {planoHoje ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-800 rounded-xl p-2"><Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" /><p className="text-lg font-bold">{planoHoje.duracao_minutos} min</p><p className="text-[10px] text-zinc-500">Duração</p></div>
                <div className="bg-zinc-800 rounded-xl p-2"><Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" /><p className="text-lg font-bold">{planoHoje.calorias_estimadas}</p><p className="text-[10px] text-zinc-500">Calorias</p></div>
                <div className="bg-zinc-800 rounded-xl p-2"><Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" /><p className="text-lg font-bold capitalize">{planoHoje.intensidade}</p><p className="text-[10px] text-zinc-500">Intensidade</p></div>
              </div>
              
              <div><p className="text-xs text-zinc-500 mb-1">🎯 Foco muscular</p><div className="flex flex-wrap gap-2">{planoHoje.foco_muscular.map(f => (<span key={f} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{f}</span>))}</div></div>
              
              {planoHoje.exercicios_sugeridos.length > 0 && (<div><p className="text-xs text-zinc-500 mb-1">🏋️ Exercícios sugeridos</p><div className="flex flex-wrap gap-2">{planoHoje.exercicios_sugeridos.map(ex => (<span key={ex} className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">{ex}</span>))}</div></div>)}
              
              <div className="p-3 bg-indigo-500/10 rounded-xl"><p className="text-sm text-white">{planoHoje.sugestao_principal}</p><p className="text-xs text-zinc-400 mt-1">{planoHoje.sugestao_secundaria}</p></div>
              
              {planoHoje.alertas.length > 0 && (<div className="border border-yellow-500/30 bg-yellow-500/10 rounded-xl p-3"><p className="text-xs text-yellow-400 font-bold">⚠️ Alertas</p><ul className="mt-1 space-y-1">{planoHoje.alertas.map((a, i) => (<li key={i} className="text-xs text-yellow-300">• {a}</li>))}</ul></div>)}
              
              <button onClick={gerarPlanoTreino} className="w-full py-2 bg-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-700 transition">Gerar Novo Plano</button>
            </div>
          ) : (
            <div className="text-center py-8"><Brain className="w-12 h-12 text-zinc-600 mx-auto mb-3" /><p className="text-zinc-500">Clique em GERAR PLANO para receber seu treino personalizado</p></div>
          )}
        </div>

        {/* Recomendações */}
        {recomendacoes.length > 0 && (<div className="bg-zinc-900 rounded-2xl p-5"><h3 className="font-bold mb-3 flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-400" />Recomendações IA</h3><div className="space-y-2">{recomendacoes.map(r => (<div key={r.id} className="border border-yellow-500/30 bg-yellow-500/10 rounded-xl p-3"><p className="font-bold text-sm text-yellow-400">{r.titulo}</p><p className="text-xs text-zinc-300 mt-1">{r.mensagem}</p></div>))}</div></div>)}
      </main>
    </div>
  );
}