"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Play, BookOpen, Dumbbell, ChevronRight, ArrowLeft, Info, Video, X } from 'lucide-react';

interface ExercicioBiblioteca {
  id: string;
  nome: string;
  categoria: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  equipamento: string[];
  descricao: string;
  notaExplicativa: string;
  instrucoes: string[];
  dicas: string[];
  videoUrl?: string;
}

const EXERCICIOS: ExercicioBiblioteca[] = [
  {
    id: '1', nome: 'Supino Reto com Barra', categoria: 'Peito', nivel: 'intermediario',
    equipamento: ['Barra', 'Banco'], descricao: 'ExercÃ­cio fundamental para desenvolvimento do peitoral.',
    notaExplicativa: '?? Foco: Peitoral maior e trÃ­ceps. Mantenha a escÃ¡pula retraÃ­da durante todo o movimento.',
    instrucoes: [
      'Deite-se no banco com a barra acima do peito',
      'Segure a barra com as mÃ£os alÃ©m da largura dos ombros',
      'DesÃ§a a barra atÃ© tocar levemente o peito',
      'Empurre a barra de volta Ã  posiÃ§Ã£o inicial'
    ],
    dicas: ['Mantenha a escÃ¡pula retraÃ­da', 'NÃ£o arqueie as costas', 'Respire corretamente'],
    videoUrl: '/videos/supino.mp4'
  },
  {
    id: '2', nome: 'Agachamento Livre', categoria: 'Pernas', nivel: 'intermediario',
    equipamento: ['Barra', 'Rack'], descricao: 'O rei dos exercÃ­cios de pernas.',
    notaExplicativa: '??? Foco: QuadrÃ­ceps, glÃºteos e isquiotibiais. Mantenha a coluna reta e o peito erguido.',
    instrucoes: [
      'Posicione a barra nas costas',
      'Afaste os pÃ©s na largura dos ombros',
      'DesÃ§a flexionando joelhos e quadris',
      'Suba empurrando pelos calcanhares'
    ],
    dicas: ['NÃ£o deixe os joelhos entrarem', 'DesÃ§a atÃ© pelo menos paralelo', 'Mantenha o peso nos calcanhares'],
    videoUrl: '/videos/agachamento.mp4'
  },
  {
    id: '3', nome: 'Puxada Frontal', categoria: 'Costas', nivel: 'iniciante',
    equipamento: ['Polia'], descricao: 'Excelente para desenvolvimento da largura das costas.',
    notaExplicativa: '?? Foco: Dorsal e latÃ­ssimo. Contraia as escÃ¡pulas no topo do movimento.',
    instrucoes: [
      'Sente-se no aparelho',
      'Segure a barra com as mÃ£os alÃ©m da largura dos ombros',
      'Puxe a barra em direÃ§Ã£o ao peito superior',
      'Retorne lentamente'
    ],
    dicas: ['NÃ£o use impulso', 'Contraia as escÃ¡pulas', 'DesÃ§a lentamente'],
    videoUrl: '/videos/puxada.mp4'
  },
  {
    id: '4', nome: 'Rosca Direta', categoria: 'BÃ­ceps', nivel: 'iniciante',
    equipamento: ['Barra', 'Halteres'], descricao: 'ExercÃ­cio clÃ¡ssico para hipertrofia dos bÃ­ceps.',
    notaExplicativa: '?? Foco: BÃ­ceps braquial. Mantenha os cotovelos fixos ao lado do corpo.',
    instrucoes: [
      'Fique em pÃ© com a barra na frente das coxas',
      'Segure com as palmas voltadas para frente',
      'Flexione os cotovelos levando a barra aos ombros',
      'DesÃ§a lentamente'
    ],
    dicas: ['NÃ£o balance o corpo', 'Mantenha a tensÃ£o na descida', 'Use amplitude completa'],
    videoUrl: '/videos/rosca.mp4'
  },
  {
    id: '5', nome: 'Desenvolvimento Militar', categoria: 'Ombros', nivel: 'intermediario',
    equipamento: ['Barra', 'Halteres'], descricao: 'ExercÃ­cio completo para desenvolvimento dos ombros.',
    notaExplicativa: '?? Foco: Deltoide anterior e lateral. Mantenha o core contraÃ­do.',
    instrucoes: [
      'Fique em pÃ© com a barra na altura dos ombros',
      'Empurre a barra para cima',
      'DesÃ§a controlado',
      'Mantenha o core contraÃ­do'
    ],
    dicas: ['Mantenha a barra alinhada', 'Respire corretamente', 'Use carga moderada'],
    videoUrl: '/videos/desenvolvimento.mp4'
  },
  {
    id: '6', nome: 'Prancha Abdominal', categoria: 'Core', nivel: 'iniciante',
    equipamento: [], descricao: 'ExercÃ­cio isomÃ©trico para fortalecimento do core.',
    notaExplicativa: '?? Foco: Core completo. Mantenha o corpo em linha reta e respire.',
    instrucoes: [
      'Apoie antebraÃ§os e pontas dos pÃ©s',
      'Mantenha o corpo em linha reta',
      'Contraia abdÃ´men e glÃºteos',
      'Mantenha a posiÃ§Ã£o'
    ],
    dicas: ['Comece com 30 segundos', 'Mantenha a respiraÃ§Ã£o', 'Olhe para o chÃ£o'],
    videoUrl: '/videos/prancha.mp4'
  }
];

const CATEGORIAS = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'BÃ­ceps', 'AbdÃ´men', 'Core'];
const NIVEIS = ['Todos', 'Iniciante', 'IntermediÃ¡rio', 'AvanÃ§ado'];

export default function BibliotecaPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [nivelFiltro, setNivelFiltro] = useState('Todos');
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioBiblioteca | null>(null);
  const [videoModal, setVideoModal] = useState<{ open: boolean; url: string; titulo: string }>({ open: false, url: '', titulo: '' });

  const filtrados = EXERCICIOS.filter(ex => {
    const matchSearch = ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) || ex.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaFiltro === 'Todos' || ex.categoria === categoriaFiltro;
    const matchNivel = nivelFiltro === 'Todos' || (nivelFiltro === 'Iniciante' && ex.nivel === 'iniciante') || (nivelFiltro === 'IntermediÃ¡rio' && ex.nivel === 'intermediario') || (nivelFiltro === 'AvanÃ§ado' && ex.nivel === 'avancado');
    return matchSearch && matchCategoria && matchNivel;
  });

  const getCorNivel = (nivel: string) => {
    if (nivel === 'iniciante') return 'bg-green-100 text-green-700';
    if (nivel === 'intermediario') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push("/academia")} className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-gray-900">Biblioteca de ExercÃ­cios</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar exercÃ­cio..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium">
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={nivelFiltro} onChange={e => setNivelFiltro(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium">
            {NIVEIS.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filtrados.map(ex => (
            <button key={ex.id} onClick={() => setExercicioSelecionado(ex)} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{ex.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCorNivel(ex.nivel)}`}>
                      {ex.nivel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{ex.descricao}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{ex.categoria}</span>
                    <span className="text-gray-300">â€¢</span>
                    <span className="text-xs text-gray-400">{ex.equipamento.join(', ')}</span>
                  </div>
                  {/* NOTA REDUZIDA EDUCATIVA */}
                  <div className="mt-2 p-2 bg-indigo-50 rounded-lg flex items-start gap-1">
                    <Info className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-700">{ex.notaExplicativa}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
        
        {filtrados.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum exercÃ­cio encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou a busca</p>
          </div>
        )}
      </main>

      {/* Modal de detalhes com vÃ­deo */}
      {exercicioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">{exercicioSelecionado.nome}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCorNivel(exercicioSelecionado.nivel)}`}>
                  {exercicioSelecionado.nivel}
                </span>
              </div>
              <button onClick={() => setExercicioSelecionado(null)} className="text-2xl text-gray-500">Ã—</button>
            </div>
            
            {/* VÃ­deo demonstrativo */}
            {exercicioSelecionado.videoUrl && (
              <div 
                className="bg-gray-100 rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-200 transition" 
                onClick={() => setVideoModal({ open: true, url: exercicioSelecionado.videoUrl!, titulo: exercicioSelecionado.nome })}
              >
                <Video className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">?? Clique para assistir ao vÃ­deo demonstrativo</p>
              </div>
            )}
            
            <p className="text-gray-700">{exercicioSelecionado.descricao}</p>
            
            {/* Nota explicativa destacada */}
            <div className="p-3 bg-indigo-50 rounded-xl">
              <p className="text-sm text-indigo-700">?? {exercicioSelecionado.notaExplicativa}</p>
            </div>
            
            {/* InstruÃ§Ãµes */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" />
                InstruÃ§Ãµes
              </h3>
              <ol className="space-y-2">
                {exercicioSelecionado.instrucoes.map((inst, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i+1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Dicas */}
            {exercicioSelecionado.dicas.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-yellow-500">??</span>
                  Dicas Importantes
                </h3>
                <ul className="space-y-2">
                  {exercicioSelecionado.dicas.map((dica, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-yellow-500">??</span>
                      <span>{dica}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Equipamento */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2">??? Equipamento NecessÃ¡rio</h3>
              <div className="flex flex-wrap gap-2">
                {exercicioSelecionado.equipamento.map(eq => (
                  <span key={eq} className="px-3 py-1 bg-slate-100 text-gray-700 rounded-full text-sm">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setExercicioSelecionado(null)} 
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de vÃ­deo */}
      {videoModal.open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{videoModal.titulo}</h3>
              <button onClick={() => setVideoModal({ open: false, url: '', titulo: '' })}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video 
                src={videoModal.url} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

