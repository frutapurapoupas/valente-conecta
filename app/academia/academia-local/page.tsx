"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Dumbbell, MapPin, Navigation, Plus, X, 
  ArrowLeft, Save, Edit, Target, Trash2, 
  ChevronRight, BookOpen, CheckCircle, Circle,
  Clock, Activity, Zap, Brain, Bell, Droplet,
  TrendingUp, Award, Weight, Settings
} from "lucide-react";

interface ExercicioUsuario {
  id: string;
  nome: string;
  grupoMuscular: string;
  intensidade: 'baixa' | 'media' | 'alta';
  tempoPrevisto: number;
  cargaAtual: number;
  cargaMeta: number;
  concluido: boolean;
  dataConclusao?: string;
  caloriasEstimadas: number;
  series: number;
  repeticoes: string;
}

interface AcademiaLocal {
  nome: string;
  endereco: string;
  localizador: { lat: number; lng: number };
  localizadorCapturado: boolean;
  responsavel: string;
  responsavelWhatsapp: string;
  mensalidade: string;
  exercicios: ExercicioUsuario[];
}

// Exercícios pré-definidos
const EXERCICIOS_PADRAO: ExercicioUsuario[] = [
  { id: "supino_reto", nome: "Supino Reto", grupoMuscular: "Peito", intensidade: "media", tempoPrevisto: 15, cargaAtual: 40, cargaMeta: 60, concluido: false, caloriasEstimadas: 80, series: 4, repeticoes: "12" },
  { id: "agachamento", nome: "Agachamento Livre", grupoMuscular: "Pernas", intensidade: "alta", tempoPrevisto: 20, cargaAtual: 60, cargaMeta: 100, concluido: false, caloriasEstimadas: 120, series: 4, repeticoes: "10" },
  { id: "puxada_frontal", nome: "Puxada Frontal", grupoMuscular: "Costas", intensidade: "media", tempoPrevisto: 15, cargaAtual: 45, cargaMeta: 70, concluido: false, caloriasEstimadas: 70, series: 4, repeticoes: "12" },
  { id: "desenvolvimento", nome: "Desenvolvimento", grupoMuscular: "Ombros", intensidade: "media", tempoPrevisto: 15, cargaAtual: 30, cargaMeta: 50, concluido: false, caloriasEstimadas: 65, series: 3, repeticoes: "12" },
  { id: "rosca_direta", nome: "Rosca Direta", grupoMuscular: "Bíceps", intensidade: "baixa", tempoPrevisto: 12, cargaAtual: 20, cargaMeta: 35, concluido: false, caloriasEstimadas: 45, series: 3, repeticoes: "12" },
  { id: "triceps_pulley", nome: "Tríceps Polia", grupoMuscular: "Tríceps", intensidade: "baixa", tempoPrevisto: 12, cargaAtual: 25, cargaMeta: 40, concluido: false, caloriasEstimadas: 45, series: 3, repeticoes: "15" },
  { id: "leg_press", nome: "Leg Press", grupoMuscular: "Pernas", intensidade: "alta", tempoPrevisto: 15, cargaAtual: 100, cargaMeta: 150, concluido: false, caloriasEstimadas: 100, series: 4, repeticoes: "12" },
  { id: "remada_curvada", nome: "Remada Curvada", grupoMuscular: "Costas", intensidade: "media", tempoPrevisto: 15, cargaAtual: 35, cargaMeta: 55, concluido: false, caloriasEstimadas: 75, series: 4, repeticoes: "10" },
  { id: "prancha", nome: "Prancha Abdominal", grupoMuscular: "Abdômen", intensidade: "baixa", tempoPrevisto: 10, cargaAtual: 0, cargaMeta: 0, concluido: false, caloriasEstimadas: 30, series: 3, repeticoes: "45s" }
];

export default function AcademiaLocalPage() {
  const router = useRouter();
  const [academia, setAcademia] = useState<AcademiaLocal>({
    nome: '', endereco: '', localizador: { lat: 0, lng: 0 }, localizadorCapturado: false,
    responsavel: '', responsavelWhatsapp: '', mensalidade: '', exercicios: EXERCICIOS_PADRAO
  });
  const [editando, setEditando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [capturandoLocal, setCapturandoLocal] = useState(false);

  useEffect(() => {
    const academiaSalva = localStorage.getItem('academia_local_dados');
    if (academiaSalva) {
      const dados = JSON.parse(academiaSalva);
      setAcademia(dados);
      setSalvo(true);
    }
  }, []);

  const capturarLocalizacao = () => {
    setCapturandoLocal(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAcademia({
            ...academia,
            localizador: { lat: position.coords.latitude, lng: position.coords.longitude },
            localizadorCapturado: true
          });
          setCapturandoLocal(false);
          toast.success('📍 Localização capturada!');
        },
        () => { setCapturandoLocal(false); toast.error('❌ Erro ao capturar localização.'); }
      );
    } else { setCapturandoLocal(false); toast.error('❌ Geolocalização não suportada.'); }
  };

  const handleSalvar = () => {
    localStorage.setItem('academia_local_dados', JSON.stringify(academia));
    setSalvo(true);
    setEditando(false);
    toast.success('✅ Academia salva com sucesso!');
  };

  const atualizarCarga = (id: string, delta: number) => {
    const exerciciosAtualizados = academia.exercicios.map(ex =>
      ex.id === id ? { ...ex, cargaAtual: Math.max(0, ex.cargaAtual + delta) } : ex
    );
    const novaAcademia = { ...academia, exercicios: exerciciosAtualizados };
    setAcademia(novaAcademia);
    localStorage.setItem('academia_local_dados', JSON.stringify(novaAcademia));
    
    // Atualizar também no histórico de cargas
    const cargasParaHistorico = exerciciosAtualizados.map(ex => ({
      id: ex.id,
      nome: ex.nome,
      grupoMuscular: ex.grupoMuscular,
      cargaAtual: ex.cargaAtual,
      metaCarga: ex.cargaMeta,
      observacoes: `${ex.series}x${ex.repeticoes}`
    }));
    localStorage.setItem('historico_carga_atividades', JSON.stringify(cargasParaHistorico));
    toast.success(`⚡ ${exerciciosAtualizados.find(e => e.id === id)?.nome} - ${delta > 0 ? '+' : ''}${delta}kg`);
  };

  const toggleConcluirExercicio = (id: string) => {
    const exercicio = academia.exercicios.find(e => e.id === id);
    const novasAtividades = academia.exercicios.map(ex =>
      ex.id === id ? { ...ex, concluido: !ex.concluido, dataConclusao: !ex.concluido ? new Date().toISOString() : undefined } : ex
    );
    const novaAcademia = { ...academia, exercicios: novasAtividades };
    setAcademia(novaAcademia);
    localStorage.setItem('academia_local_dados', JSON.stringify(novaAcademia));
    
    if (!exercicio?.concluido) {
      toast.success(`✅ ${exercicio?.nome} concluído! Carga: ${exercicio?.cargaAtual}kg`);
    }
  };

  const progresso = academia.exercicios && academia.exercicios.length > 0 
    ? (academia.exercicios.filter(e => e.concluido).length / academia.exercicios.length) * 100 
    : 0;
  
  const caloriasTotais = academia.exercicios?.filter(e => e.concluido).reduce((sum, e) => sum + e.caloriasEstimadas, 0) || 0;
  const tempoTotal = academia.exercicios?.filter(e => e.concluido).reduce((sum, e) => sum + e.tempoPrevisto, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/academia"><ArrowLeft className="w-6 h-6 text-yellow-400" /></Link>
          <div className="font-black uppercase italic text-white text-sm tracking-widest"><span>ACADEMIA LOCAL</span></div>
          {salvo && !editando && <button onClick={() => setEditando(true)}><Edit className="w-6 h-6 text-yellow-400" /></button>}
          {!salvo && <div className="w-6" />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {salvo && !editando ? (
          <div className="space-y-6">
            {/* Informações da Academia */}
            <div className="bg-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4"><Dumbbell className="w-6 h-6 text-emerald-400" /><h3 className="font-bold text-white">Informações</h3></div>
              <div className="space-y-2">
                <div><p className="text-xs text-zinc-400">Nome</p><p className="font-bold text-white">{academia.nome || "Não cadastrada"}</p></div>
                <div><p className="text-xs text-zinc-400">Endereço</p><p className="font-bold text-white">{academia.endereco || "Não cadastrado"}</p></div>
                <div><p className="text-xs text-zinc-400">Mensalidade</p><p className="font-bold text-white">R$ {academia.mensalidade || "0"}</p></div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="bg-white/10 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white">Progresso do Treino Hoje</span>
                <span className="text-sm text-yellow-400">{Math.round(progresso)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs text-zinc-400">
                <span>⏱️ {tempoTotal} min</span>
                <span>🔥 {caloriasTotais} kcal</span>
              </div>
            </div>

            {/* LISTA DE EXERCÍCIOS */}
            <div className="bg-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><Target className="w-6 h-6 text-purple-400" /><h3 className="font-bold text-white">Meus Exercícios</h3></div>
                <span className="text-xs text-purple-400">{academia.exercicios?.filter(e => e.concluido).length || 0}/{academia.exercicios?.length || 0} concluídos</span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {academia.exercicios?.map((ex) => (
                  <div key={ex.id} className={`bg-white/5 rounded-xl p-3 transition-all ${ex.concluido ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white">{ex.nome}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            ex.intensidade === 'baixa' ? 'bg-green-500/30 text-green-300' :
                            ex.intensidade === 'media' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-red-500/30 text-red-300'
                          }`}>
                            {ex.intensidade}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{ex.grupoMuscular} • {ex.series}x{ex.repeticoes}</p>
                        
                        {/* Controle de Carga */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                            <Weight className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-zinc-400">Carga:</span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => atualizarCarga(ex.id, -2.5)}
                                className="w-6 h-6 bg-white/10 rounded-full text-white text-sm hover:bg-white/20"
                                disabled={ex.concluido}
                              >-</button>
                              <span className="text-sm font-bold text-yellow-400 w-12 text-center">{ex.cargaAtual}kg</span>
                              <button 
                                onClick={() => atualizarCarga(ex.id, 2.5)}
                                className="w-6 h-6 bg-white/10 rounded-full text-white text-sm hover:bg-white/20"
                                disabled={ex.concluido}
                              >+</button>
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">Meta: {ex.cargaMeta}kg</div>
                        </div>
                        
                        {ex.concluido && ex.dataConclusao && (
                          <p className="text-[10px] text-green-400 mt-1">✅ Concluído em {new Date(ex.dataConclusao).toLocaleDateString()}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleConcluirExercicio(ex.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${ex.concluido ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {ex.concluido ? <CheckCircle className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-zinc-400" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Link para Histórico de Cargas */}
            <Link href="/academia/historico-carga" className="flex items-center justify-between bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition group">
              <div className="flex items-center gap-3"><TrendingUp className="w-6 h-6 text-emerald-400" /><div><h4 className="font-bold text-white">Histórico de Cargas</h4><p className="text-xs text-zinc-400">Acompanhe sua evolução de pesos</p></div></div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-3xl p-6 space-y-4">
              <input type="text" placeholder="Nome da academia" value={academia.nome} onChange={e => setAcademia({...academia, nome: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
              <input type="text" placeholder="Endereço" value={academia.endereco} onChange={e => setAcademia({...academia, endereco: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
              <div className="flex gap-2"><input type="text" placeholder="Localização" readOnly className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-zinc-400" /><button onClick={capturarLocalizacao} disabled={capturandoLocal} className="px-4 py-3 bg-emerald-600 rounded-xl"><Navigation className="w-5 h-5" /> Capturar</button></div>
              <input type="number" placeholder="Mensalidade (R$)" value={academia.mensalidade} onChange={e => setAcademia({...academia, mensalidade: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
              <input type="text" placeholder="Responsável" value={academia.responsavel} onChange={e => setAcademia({...academia, responsavel: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
              <input type="tel" placeholder="WhatsApp" value={academia.responsavelWhatsapp} onChange={e => setAcademia({...academia, responsavelWhatsapp: e.target.value})} className="w-full px-4 py-3 bg-white/10 rounded-xl text-white" />
            </div>
            <button onClick={handleSalvar} disabled={!academia.nome || !academia.endereco} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold"><Save className="w-5 h-5 inline mr-2" />Salvar Academia</button>
          </div>
        )}
      </main>
    </div>
  );
}


