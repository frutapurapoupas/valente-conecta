"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Target, Activity, Heart, Scale, Ruler, 
  ArrowLeft, Edit, Save, X, Dumbbell, Weight,
  Calendar, TrendingUp, Award, Smartphone, Mail,
  AlertCircle, CheckCircle, Flame, Zap, Stethoscope
} from "lucide-react";
import toast from "react-hot-toast";

interface PerfilData {
  nome: string;
  idade: number;
  sexo: string;
  email: string;
  telefone: string;
  peso: number;
  pesoMeta: number;
  alturaCm: number;
  objetivo: string;
  nivel: string;
  freqSemanal: number;
  condicoesMedicas: string[];
}

// Opções de condições médicas
const CONDICOES_MEDICAS_OPCOES = [
  "Diabetes",
  "Hipertensão",
  "Problemas cardíacos",
  "Asma",
  "Lesões anteriores",
  "Dores nas articulações",
  "Nenhuma"
];

const OBJETIVOS = [
  { valor: "emagrecer", label: "🎯 Emagrecimento", icone: "🎯" },
  { valor: "hipertrofia", label: "💪 Hipertrofia", icone: "💪" },
  { valor: "condicionamento", label: "🏃 Condicionamento Físico", icone: "🏃" },
  { valor: "saude", label: "❤️ Saúde", icone: "❤️" }
];

const NIVEIS = [
  { valor: "iniciante", label: "Iniciante", cor: "bg-green-500/20 text-green-300" },
  { valor: "intermediario", label: "Intermediário", cor: "bg-yellow-500/20 text-yellow-300" },
  { valor: "avancado", label: "Avançado", cor: "bg-red-500/20 text-red-300" }
];

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const perfilIA = localStorage.getItem('academia_perfil_ia');
    const perfilInicial = localStorage.getItem('academia_perfil_inicial');
    
    let dados: PerfilData | null = null;
    
    if (perfilIA) {
      const data = JSON.parse(perfilIA);
      dados = {
        nome: data.nome || '',
        idade: data.idade || 0,
        sexo: data.sexo || 'masculino',
        email: data.email || '',
        telefone: data.telefone || '',
        peso: data.peso_atual || 0,
        pesoMeta: data.peso_meta || 0,
        alturaCm: data.altura || 0,
        objetivo: data.objetivo || 'saude',
        nivel: data.nivel || 'iniciante',
        freqSemanal: data.freq_semanal || 3,
        condicoesMedicas: data.condicoes_fisicas || []
      };
    } else if (perfilInicial) {
      const data = JSON.parse(perfilInicial);
      dados = {
        nome: data.nome || '',
        idade: parseInt(data.idade) || 0,
        sexo: data.sexo || 'masculino',
        email: data.email || '',
        telefone: data.telefone || '',
        peso: parseFloat(data.peso) || 0,
        pesoMeta: parseFloat(data.pesoMeta) || 0,
        alturaCm: parseFloat(data.altura) || 0,
        objetivo: data.objetivos?.includes('Emagrecimento') ? 'emagrecer' :
                   data.objetivos?.includes('Ganho de massa muscular') ? 'hipertrofia' :
                   data.objetivos?.includes('Condicionamento físico') ? 'condicionamento' : 'saude',
        nivel: data.nivel || 'iniciante',
        freqSemanal: parseInt(data.freqSemanal) || 3,
        condicoesMedicas: data.condicoesMedicas || []
      };
    }
    
    if (dados) {
      setPerfil(dados);
      setFormData({ ...dados });
    }
    setLoading(false);
  };

  const calcularIMC = (peso: number, alturaCm: number): number => {
    if (alturaCm <= 0 || peso <= 0) return 0;
    const alturaM = alturaCm / 100;
    return peso / (alturaM * alturaM);
  };

  const getStatusIMC = (imc: number) => {
    if (imc < 18.5) return { texto: 'Abaixo do peso', cor: 'text-yellow-400', bg: 'bg-yellow-500/20', icone: '⚠️' };
    if (imc < 25) return { texto: 'Peso saudável', cor: 'text-green-400', bg: 'bg-green-500/20', icone: '✅' };
    if (imc < 30) return { texto: 'Sobrepeso', cor: 'text-orange-400', bg: 'bg-orange-500/20', icone: '📊' };
    return { texto: 'Obesidade', cor: 'text-red-400', bg: 'bg-red-500/20', icone: '⚠️' };
  };

  const toggleCondicaoMedica = (condicao: string) => {
    if (!formData) return;
    
    let novasCondicoes;
    if (condicao === "Nenhuma") {
      novasCondicoes = formData.condicoesMedicas.includes("Nenhuma") ? [] : ["Nenhuma"];
    } else {
      let novas = formData.condicoesMedicas.filter(c => c !== "Nenhuma");
      if (novas.includes(condicao)) {
        novas = novas.filter(c => c !== condicao);
      } else {
        novas = [...novas, condicao];
      }
      novasCondicoes = novas;
    }
    setFormData({ ...formData, condicoesMedicas: novasCondicoes });
  };

  const salvarAlteracoes = () => {
    if (!formData) return;
    
    const perfilIA = {
      id: 1,
      user_id: 'demo-user',
      nome: formData.nome,
      peso_atual: formData.peso,
      peso_meta: formData.pesoMeta,
      altura: formData.alturaCm,
      idade: formData.idade,
      sexo: formData.sexo,
      email: formData.email,
      telefone: formData.telefone,
      objetivo: formData.objetivo,
      nivel: formData.nivel,
      freq_semanal: formData.freqSemanal,
      condicoes_fisicas: formData.condicoesMedicas,
      ativo: true
    };
    localStorage.setItem('academia_perfil_ia', JSON.stringify(perfilIA));
    
    const perfilInicial = {
      nome: formData.nome,
      idade: formData.idade.toString(),
      sexo: formData.sexo,
      email: formData.email,
      telefone: formData.telefone,
      peso: formData.peso.toString(),
      pesoMeta: formData.pesoMeta.toString(),
      altura: formData.alturaCm.toString(),
      objetivos: formData.objetivo === 'emagrecer' ? ['Emagrecimento'] :
                  formData.objetivo === 'hipertrofia' ? ['Ganho de massa muscular'] :
                  formData.objetivo === 'condicionamento' ? ['Condicionamento físico'] : ['Saúde'],
      nivel: formData.nivel,
      freqSemanal: formData.freqSemanal.toString(),
      condicoesMedicas: formData.condicoesMedicas
    };
    localStorage.setItem('academia_perfil_inicial', JSON.stringify(perfilInicial));
    
    setPerfil(formData);
    setEditando(false);
    toast.success('✅ Perfil atualizado com sucesso!');
  };

  const cancelarEdicao = () => {
    setFormData(perfil ? { ...perfil } : null);
    setEditando(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <User className="w-16 h-16 text-yellow-400 animate-pulse" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <Dumbbell className="w-16 h-16 text-yellow-400 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhum perfil encontrado</h2>
        <Link href="/academia/cadastro-inicial" className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">
          Criar Perfil
        </Link>
      </div>
    );
  }

  const dadosExibicao = editando ? formData : perfil;
  const imc = calcularIMC(dadosExibicao?.peso || 0, dadosExibicao?.alturaCm || 0);
  const statusIMC = getStatusIMC(imc);
  const alturaM = ((dadosExibicao?.alturaCm || 0) / 100).toFixed(2);
  const objetivoLabel = OBJETIVOS.find(o => o.valor === dadosExibicao?.objetivo)?.label || 'Saúde';
  const nivelLabel = NIVEIS.find(n => n.valor === dadosExibicao?.nivel)?.label || 'Iniciante';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-28">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/academia")} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>MEU PERFIL</span>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)} className="relative group">
              <Edit className="w-6 h-6 text-yellow-400" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={salvarAlteracoes} className="p-1">
                <Save className="w-5 h-5 text-green-400" />
              </button>
              <button onClick={cancelarEdicao} className="p-1">
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-5">
        
        {/* DADOS PESSOAIS */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" />Dados Pessoais</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {editando ? (
                  <input
                    type="text"
                    value={dadosExibicao?.nome || ''}
                    onChange={(e) => setFormData({ ...formData!, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white font-bold"
                  />
                ) : (
                  <h3 className="text-xl font-black text-white">{dadosExibicao?.nome}</h3>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                  {editando ? (
                    <>
                      <input
                        type="number"
                        value={dadosExibicao?.idade || 0}
                        onChange={(e) => setFormData({ ...formData!, idade: parseInt(e.target.value) })}
                        className="w-20 px-2 py-1 bg-white/10 rounded-lg text-white text-xs"
                      />
                      <span>anos</span>
                      <select
                        value={dadosExibicao?.sexo || 'masculino'}
                        onChange={(e) => setFormData({ ...formData!, sexo: e.target.value })}
                        className="px-2 py-1 bg-white/10 rounded-lg text-white text-xs"
                      >
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <span>{dadosExibicao?.idade} anos</span>
                      <span>•</span>
                      <span className="capitalize">{dadosExibicao?.sexo}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                {editando ? (
                  <input
                    type="email"
                    value={dadosExibicao?.email || ''}
                    onChange={(e) => setFormData({ ...formData!, email: e.target.value })}
                    placeholder="E-mail"
                    className="flex-1 px-2 py-1 bg-white/10 rounded-lg text-white text-xs"
                  />
                ) : (
                  <span className="text-sm text-white/70">{dadosExibicao?.email || 'Não informado'}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                {editando ? (
                  <input
                    type="tel"
                    value={dadosExibicao?.telefone || ''}
                    onChange={(e) => setFormData({ ...formData!, telefone: e.target.value })}
                    placeholder="WhatsApp"
                    className="flex-1 px-2 py-1 bg-white/10 rounded-lg text-white text-xs"
                  />
                ) : (
                  <span className="text-sm text-white/70">{dadosExibicao?.telefone || 'Não informado'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DADOS FÍSICOS E SAÚDE */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-green-400" />Dados Físicos</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Weight className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                {editando ? (
                  <input
                    type="number"
                    step="0.1"
                    value={dadosExibicao?.peso || 0}
                    onChange={(e) => setFormData({ ...formData!, peso: parseFloat(e.target.value) })}
                    className="w-full text-center text-2xl font-black text-white bg-transparent"
                  />
                ) : (
                  <p className="text-2xl font-black text-white">{dadosExibicao?.peso}kg</p>
                )}
                <p className="text-xs text-zinc-400">Peso atual</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Ruler className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                {editando ? (
                  <input
                    type="number"
                    step="1"
                    value={dadosExibicao?.alturaCm || 0}
                    onChange={(e) => setFormData({ ...formData!, alturaCm: parseFloat(e.target.value) })}
                    className="w-full text-center text-2xl font-black text-white bg-transparent"
                  />
                ) : (
                  <p className="text-2xl font-black text-white">{alturaM}m</p>
                )}
                <p className="text-xs text-zinc-400">Altura</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                {editando ? (
                  <input
                    type="number"
                    step="0.1"
                    value={dadosExibicao?.pesoMeta || 0}
                    onChange={(e) => setFormData({ ...formData!, pesoMeta: parseFloat(e.target.value) })}
                    className="w-full text-center text-2xl font-black text-white bg-transparent"
                  />
                ) : (
                  <p className="text-2xl font-black text-white">{dadosExibicao?.pesoMeta}kg</p>
                )}
                <p className="text-xs text-zinc-400">Meta</p>
              </div>
            </div>
            
            <div className={`${statusIMC.bg} rounded-xl p-4`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  <span className="text-sm text-white">IMC (Índice de Massa Corporal)</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusIMC.cor}`}>
                  {statusIMC.texto}
                </span>
              </div>
              <p className="text-3xl font-black text-white mb-1">{imc.toFixed(1)}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" 
                     style={{ width: `${Math.min(100, (imc / 40) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/60">{statusIMC.icone} {statusIMC.texto}</p>
              <p className="text-[10px] text-white/40 mt-2">
                Cálculo: {dadosExibicao?.peso}kg ÷ ({alturaM}m × {alturaM}m) = {imc.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* TREINO E OBJETIVOS */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-purple-400" />Treino e Objetivos</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-zinc-400">Objetivo</span>
                </div>
                {editando ? (
                  <select
                    value={dadosExibicao?.objetivo || 'saude'}
                    onChange={(e) => setFormData({ ...formData!, objetivo: e.target.value })}
                    className="w-full px-2 py-1 bg-white/10 rounded-lg text-white text-sm"
                  >
                    {OBJETIVOS.map(obj => (
                      <option key={obj.valor} value={obj.valor}>{obj.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-bold">{objetivoLabel}</p>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Nível</span>
                </div>
                {editando ? (
                  <select
                    value={dadosExibicao?.nivel || 'iniciante'}
                    onChange={(e) => setFormData({ ...formData!, nivel: e.target.value })}
                    className="w-full px-2 py-1 bg-white/10 rounded-lg text-white text-sm"
                  >
                    {NIVEIS.map(n => (
                      <option key={n.valor} value={n.valor}>{n.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-bold capitalize">{nivelLabel}</p>
                )}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-400">Frequência semanal</span>
              </div>
              {editando ? (
                <div className="flex gap-1 flex-wrap">
                  {[1,2,3,4,5,6,7].map(f => (
                    <button
                      key={f}
                      onClick={() => setFormData({ ...formData!, freqSemanal: f })}
                      className={`w-10 py-2 rounded-lg text-sm font-bold transition-all ${
                        dadosExibicao?.freqSemanal === f ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white font-bold">{dadosExibicao?.freqSemanal} treinos por semana</p>
              )}
            </div>
          </div>
        </div>

        {/* CONDIÇÕES MÉDICAS - COM TODAS AS OPÇÕES */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600/30 to-rose-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2"><Stethoscope className="w-5 h-5 text-red-400" />Condições Médicas</h2>
          </div>
          <div className="p-5">
            {editando ? (
              <div className="flex flex-wrap gap-2">
                {CONDICOES_MEDICAS_OPCOES.map((condicao) => (
                  <button
                    key={condicao}
                    onClick={() => toggleCondicaoMedica(condicao)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      dadosExibicao?.condicoesMedicas?.includes(condicao)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {condicao}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dadosExibicao?.condicoesMedicas && dadosExibicao.condicoesMedicas.length > 0 ? (
                  dadosExibicao.condicoesMedicas.map((cond, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                      {cond}
                    </span>
                  ))
                ) : (
                  <p className="text-zinc-400 text-sm">Nenhuma condição informada</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


