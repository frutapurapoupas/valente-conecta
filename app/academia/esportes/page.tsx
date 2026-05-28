"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, MapPin, Navigation, Clock, Plus, X, 
  ArrowLeft, Save, Edit, Bell, Trash2, Search,
  Activity, CheckCircle, AlertCircle, WifiOff
} from 'lucide-react';

interface AtividadeEsportiva {
  id: string;
  tipo: string;
  nome: string;
  local: string;
  localizador: { lat: number; lng: number };
  localizadorCapturado: boolean;
  diaSemana: string;
  horario: string;
  duracao: string;
  tempoPermanencia: number;
  alertaAtivo: boolean;
}

const ESPORTES_PREDEFINIDOS = [
  { nome: "⚽ Futebol", icone: "⚽", cor: "from-green-600 to-green-800" },
  { nome: "🏃 Corrida", icone: "🏃", cor: "from-red-600 to-red-800" },
  { nome: "🚴 Ciclismo", icone: "🚴", cor: "from-blue-600 to-blue-800" },
  { nome: "🏊 Natação", icone: "🏊", cor: "from-cyan-600 to-cyan-800" },
  { nome: "🏐 Vôlei", icone: "🏐", cor: "from-yellow-600 to-yellow-800" },
  { nome: "🏀 Basquete", icone: "🏀", cor: "from-orange-600 to-orange-800" },
  { nome: "🎾 Tênis", icone: "🎾", cor: "from-lime-600 to-lime-800" },
  { nome: "🥊 Boxe", icone: "🥊", cor: "from-red-700 to-red-900" },
  { nome: "🧘 Yoga", icone: "🧘", cor: "from-purple-600 to-purple-800" },
  { nome: "🏋️ Musculação", icone: "🏋️", cor: "from-gray-600 to-gray-800" },
  { nome: "🚶 Caminhada", icone: "🚶", cor: "from-emerald-600 to-emerald-800" },
  { nome: "🤸 Crossfit", icone: "🤸", cor: "from-amber-600 to-amber-800" },
  { nome: "🥋 Jiu-Jitsu", icone: "🥋", cor: "from-indigo-600 to-indigo-800" },
  { nome: "🏸 Beach Tennis", icone: "🏸", cor: "from-teal-600 to-teal-800" },
  { nome: "⛰️ Trilha", icone: "⛰️", cor: "from-stone-600 to-stone-800" }
];

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export default function EsportesPage() {
  const router = useRouter();
  const [atividades, setAtividades] = useState<AtividadeEsportiva[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [capturandoLocal, setCapturandoLocal] = useState(false);
  const [buscaEsporte, setBuscaEsporte] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<{ texto: string; tipo: 'sucesso' | 'erro' | 'info' | null }>({ texto: '', tipo: null });
  const [gpsPermissao, setGpsPermissao] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  // Formulário da nova atividade
  const [novaAtividade, setNovaAtividade] = useState({
    tipo: '',
    nome: '',
    local: '',
    localizador: { lat: 0, lng: 0 },
    localizadorCapturado: false,
    diaSemana: '',
    horario: '',
    duracao: '60',
    tempoPermanencia: 60,
    alertaAtivo: true
  });

  // Carregar atividades salvas
  useEffect(() => {
    const salvas = localStorage.getItem('academia_esportes');
    if (salvas) {
      setAtividades(JSON.parse(salvas));
    }
    // Verificar permissão de geolocalização
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGpsPermissao(result.state as any);
      });
    }
  }, []);

  // Limpar mensagem após 3 segundos
  useEffect(() => {
    if (mensagemStatus.texto) {
      const timer = setTimeout(() => setMensagemStatus({ texto: '', tipo: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensagemStatus]);

  const esportesFiltrados = ESPORTES_PREDEFINIDOS.filter(e =>
    e.nome.toLowerCase().includes(buscaEsporte.toLowerCase())
  );

  // Verificar permissão de geolocalização antes de capturar
  const verificarPermissaoGeolocalizacao = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setMensagemStatus({ texto: '❌ Seu navegador não suporta geolocalização', tipo: 'erro' });
        resolve(false);
        return;
      }
      
      // Teste rápido para verificar permissão
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setMensagemStatus({ 
            texto: '❌ Permissão de localização negada. Clique no cadeado na barra de endereço e permita o acesso.', 
            tipo: 'erro' 
          });
          resolve(false);
        } else {
          resolve(true);
        }
      }).catch(() => resolve(true));
    });
  };

  // Capturar localização
  const capturarLocalizacao = async () => {
    // Verificar permissão primeiro
    const temPermissao = await verificarPermissaoGeolocalizacao();
    if (!temPermissao) return;
    
    setCapturandoLocal(true);
    setMensagemStatus({ texto: '📍 Solicitando localização... Aguarde', tipo: 'info' });
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNovaAtividade(prev => ({
          ...prev,
          localizador: { lat: latitude, lng: longitude },
          localizadorCapturado: true
        }));
        setCapturandoLocal(false);
        setMensagemStatus({ 
          texto: `✅ Localização capturada! Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`, 
          tipo: 'sucesso' 
        });
        
        // Preencher o campo local automaticamente se estiver vazio
        if (!novaAtividade.local) {
          setNovaAtividade(prev => ({ ...prev, local: `Local na coordenada ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        }
      },
      (error) => {
        setCapturandoLocal(false);
        let mensagemErro = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro = '❌ Permissão de localização negada. Por favor, permita o acesso no navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensagemErro = '❌ Localização indisponível. Verifique se o GPS do seu dispositivo está ativo.';
            break;
          case error.TIMEOUT:
            mensagemErro = '❌ Tempo excedido. Tente novamente em um local com melhor sinal.';
            break;
          default:
            mensagemErro = `❌ Erro ao capturar localização: ${error.message}`;
        }
        setMensagemStatus({ texto: mensagemErro, tipo: 'erro' });
      },
      options
    );
  };

  const selecionarEsporte = (esporte: typeof ESPORTES_PREDEFINIDOS[0]) => {
    setNovaAtividade({
      ...novaAtividade,
      tipo: esporte.nome,
      nome: esporte.nome
    });
    setBuscaEsporte(esporte.nome);
    setMostrarDropdown(false);
  };

  const adicionarAtividade = () => {
    if (!novaAtividade.tipo) {
      setMensagemStatus({ texto: '⚠️ Selecione um esporte', tipo: 'erro' });
      return;
    }
    if (!novaAtividade.local) {
      setMensagemStatus({ texto: '⚠️ Informe o local onde você pratica', tipo: 'erro' });
      return;
    }
    if (!novaAtividade.diaSemana) {
      setMensagemStatus({ texto: '⚠️ Selecione o dia da semana', tipo: 'erro' });
      return;
    }
    if (!novaAtividade.horario) {
      setMensagemStatus({ texto: '⚠️ Informe o horário', tipo: 'erro' });
      return;
    }

    const atividade: AtividadeEsportiva = {
      id: editandoId || Date.now().toString(),
      tipo: novaAtividade.tipo,
      nome: novaAtividade.nome || novaAtividade.tipo,
      local: novaAtividade.local,
      localizador: novaAtividade.localizador,
      localizadorCapturado: novaAtividade.localizadorCapturado,
      diaSemana: novaAtividade.diaSemana,
      horario: novaAtividade.horario,
      duracao: `${novaAtividade.duracao} min`,
      tempoPermanencia: novaAtividade.tempoPermanencia,
      alertaAtivo: novaAtividade.alertaAtivo
    };

    let novasAtividades;
    if (editandoId) {
      novasAtividades = atividades.map(a => a.id === editandoId ? atividade : a);
    } else {
      novasAtividades = [...atividades, atividade];
    }

    setAtividades(novasAtividades);
    localStorage.setItem('academia_esportes', JSON.stringify(novasAtividades));
    
    resetFormulario();
    setMostrarFormulario(false);
    setEditandoId(null);
    
    setMensagemStatus({ texto: editandoId ? '✅ Atividade atualizada!' : '✅ Atividade adicionada!', tipo: 'sucesso' });
    
    if (atividade.alertaAtivo && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const resetFormulario = () => {
    setNovaAtividade({
      tipo: '',
      nome: '',
      local: '',
      localizador: { lat: 0, lng: 0 },
      localizadorCapturado: false,
      diaSemana: '',
      horario: '',
      duracao: '60',
      tempoPermanencia: 60,
      alertaAtivo: true
    });
    setBuscaEsporte('');
  };

  const editarAtividade = (atividade: AtividadeEsportiva) => {
    setEditandoId(atividade.id);
    setNovaAtividade({
      tipo: atividade.tipo,
      nome: atividade.nome,
      local: atividade.local,
      localizador: atividade.localizador,
      localizadorCapturado: atividade.localizadorCapturado,
      diaSemana: atividade.diaSemana,
      horario: atividade.horario,
      duracao: atividade.duracao.replace(' min', ''),
      tempoPermanencia: atividade.tempoPermanencia || 60,
      alertaAtivo: atividade.alertaAtivo
    });
    setBuscaEsporte(atividade.tipo);
    setMostrarFormulario(true);
  };

  const excluirAtividade = (id: string) => {
    if (confirm('❌ Tem certeza que deseja excluir esta atividade?')) {
      const novas = atividades.filter(a => a.id !== id);
      setAtividades(novas);
      localStorage.setItem('academia_esportes', JSON.stringify(novas));
      setMensagemStatus({ texto: '🗑️ Atividade removida!', tipo: 'sucesso' });
    }
  };

  const toggleAlerta = (id: string) => {
    const novas = atividades.map(a =>
      a.id === id ? { ...a, alertaAtivo: !a.alertaAtivo } : a
    );
    setAtividades(novas);
    localStorage.setItem('academia_esportes', JSON.stringify(novas));
    setMensagemStatus({ 
      texto: novas.find(a => a.id === id)?.alertaAtivo ? '🔔 Alertas ativados!' : '🔕 Alertas desativados', 
      tipo: 'sucesso' 
    });
  };

  useEffect(() => {
    const verificarAlertas = () => {
      const agora = new Date();
      const diaAtual = DIAS_SEMANA[agora.getDay()];
      const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');
      
      atividades.forEach(atividade => {
        if (atividade.alertaAtivo && atividade.diaSemana === diaAtual && atividade.horario === horaAtual) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚽ Hora do Esporte!', {
              body: `Hoje é dia de ${atividade.tipo} às ${atividade.horario} em ${atividade.local}`,
              icon: '/icon.png',
              vibrate: [200, 100, 200]
            });
          }
        }
      });
    };
    
    const interval = setInterval(verificarAlertas, 60000);
    return () => clearInterval(interval);
  }, [atividades]);

  const totalAtividades = atividades.length;
  const alertasAtivos = atividades.filter(a => a.alertaAtivo).length;
  const esportesUnicos = [...new Set(atividades.map(a => a.tipo))].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-28">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/academia")} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>MEUS ESPORTES</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Aviso de permissão de GPS */}
        {gpsPermissao === 'denied' && (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-400 font-bold text-sm">Permissão de localização negada</p>
              <p className="text-red-300 text-xs mt-1">Para usar a captura de localização, permita o acesso no navegador:</p>
              <p className="text-red-300 text-xs">🔒 Clique no cadeado na barra de endereço → Permitir localização → Recarregue a página</p>
            </div>
          </div>
        )}

        {mensagemStatus.texto && (
          <div className={`rounded-2xl p-3 text-center ${
            mensagemStatus.tipo === 'sucesso' ? 'bg-green-500/20 border border-green-500 text-green-400' :
            mensagemStatus.tipo === 'erro' ? 'bg-red-500/20 border border-red-500 text-red-400' :
            'bg-blue-500/20 border border-blue-500 text-blue-400'
          }`}>
            {mensagemStatus.texto}
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Atividades Esportivas</h1>
          <p className="text-zinc-400 text-sm">Cadastre onde você pratica e receba alertas</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-xl border border-white/20">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{totalAtividades}</p>
            <p className="text-xs text-zinc-400">Atividades</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-xl border border-white/20">
            <Bell className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{alertasAtivos}</p>
            <p className="text-xs text-zinc-400">Alertas ativos</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-xl border border-white/20">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{esportesUnicos}</p>
            <p className="text-xs text-zinc-400">Esportes</p>
          </div>
        </div>

        {mostrarFormulario && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">
                {editandoId ? '✏️ Editar Atividade' : '➕ Nova Atividade'}
              </h3>
              <button onClick={() => { setMostrarFormulario(false); resetFormulario(); }} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">🏆 Escolha o esporte</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={buscaEsporte}
                  onChange={(e) => {
                    setBuscaEsporte(e.target.value);
                    setNovaAtividade({ ...novaAtividade, tipo: e.target.value });
                    setMostrarDropdown(true);
                  }}
                  onFocus={() => setMostrarDropdown(true)}
                  placeholder="Digite ou selecione um esporte..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder:text-zinc-500"
                />
              </div>
              {mostrarDropdown && esportesFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-48 overflow-y-auto">
                  {esportesFiltrados.map((esporte, idx) => (
                    <button
                      key={idx}
                      onClick={() => selecionarEsporte(esporte)}
                      className={`w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors flex items-center gap-2 ${novaAtividade.tipo === esporte.nome ? 'bg-orange-500/20' : ''}`}
                    >
                      <span className="text-xl">{esporte.icone}</span>
                      <span className="text-white">{esporte.nome}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">✏️ Nome personalizado (opcional)</label>
              <input
                type="text"
                value={novaAtividade.nome}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, nome: e.target.value })}
                placeholder="Ex: Futebol com os amigos, Corrida do parque..."
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">📍 Local onde você pratica</label>
              <input
                type="text"
                value={novaAtividade.local}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, local: e.target.value })}
                placeholder="Ex: Campo do São José, Parque da Cidade..."
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">📍 Localizador GPS</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={novaAtividade.localizador.lat !== 0 ? `${novaAtividade.localizador.lat.toFixed(6)}, ${novaAtividade.localizador.lng.toFixed(6)}` : ''}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-zinc-400 text-sm"
                  placeholder="Clique em '📍 Capturar Local' para obter sua localização"
                />
                <button
                  onClick={capturarLocalizacao}
                  disabled={capturandoLocal}
                  className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 hover:opacity-90"
                >
                  <Navigation className="w-5 h-5" />
                  {capturandoLocal ? 'Capturando...' : novaAtividade.localizadorCapturado ? '📍 Atualizar' : '📍 Capturar Local'}
                </button>
              </div>
              {novaAtividade.localizadorCapturado && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Localização capturada!
                </p>
              )}
              {gpsPermissao === 'denied' && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Permissão negada. Habilite no navegador.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">📅 Dia da semana</label>
                <select
                  value={novaAtividade.diaSemana}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, diaSemana: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                >
                  <option value="">Selecione</option>
                  {DIAS_SEMANA.map((dia) => (
                    <option key={dia} value={dia} className="bg-zinc-800">{dia}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">⏰ Horário</label>
                <input
                  type="time"
                  value={novaAtividade.horario}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, horario: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">⏱️ Tempo que ficará praticando (minutos)</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={novaAtividade.tempoPermanencia}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, tempoPermanencia: parseInt(e.target.value), duracao: e.target.value })}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center px-3 py-2 bg-white/10 rounded-xl text-white font-bold">
                  {novaAtividade.tempoPermanencia} min
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">💡 Tempo estimado que você ficará no local</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-bold text-sm">Receber alerta</p>
                  <p className="text-xs text-zinc-500">Notificação no horário escolhido</p>
                </div>
              </div>
              <button
                onClick={() => setNovaAtividade({ ...novaAtividade, alertaAtivo: !novaAtividade.alertaAtivo })}
                className={`w-12 h-6 rounded-full transition-all ${novaAtividade.alertaAtivo ? 'bg-green-500' : 'bg-zinc-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${novaAtividade.alertaAtivo ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button
              onClick={adicionarAtividade}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <Save className="w-5 h-5" />
              {editandoId ? 'Salvar Alterações' : 'Adicionar Atividade'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {atividades.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
              <Trophy className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">Nenhuma atividade cadastrada</p>
              <p className="text-zinc-500 text-sm mt-2">Adicione sua primeira atividade esportiva</p>
            </div>
          ) : (
            atividades.map((atividade) => {
              const esporteInfo = ESPORTES_PREDEFINIDOS.find(e => e.nome === atividade.tipo) || ESPORTES_PREDEFINIDOS[0];
              return (
                <div key={atividade.id} className={`bg-gradient-to-r ${esporteInfo.cor} rounded-2xl p-5 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{esporteInfo.icone}</div>
                      <div>
                        <h3 className="font-bold text-white text-xl">{atividade.nome}</h3>
                        <p className="text-white/80 text-sm">{atividade.tipo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editarAtividade(atividade)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition">
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button onClick={() => excluirAtividade(atividade.id)} className="p-2 bg-red-500/30 rounded-xl hover:bg-red-500/50 transition">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                      <MapPin className="w-4 h-4 text-blue-300" />
                      <div>
                        <p className="text-[10px] text-white/60">Local</p>
                        <p className="text-sm text-white font-medium">{atividade.local}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                      <Clock className="w-4 h-4 text-purple-300" />
                      <div>
                        <p className="text-[10px] text-white/60">Horário</p>
                        <p className="text-sm text-white font-medium">{atividade.diaSemana} às {atividade.horario}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-300" />
                      <p className="text-sm text-white/80">Duração: {atividade.duracao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {atividade.localizadorCapturado && (
                        <div className="flex items-center gap-1 text-xs text-yellow-300">
                          <Navigation className="w-3 h-3" />
                          <span>GPS</span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleAlerta(atividade.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${atividade.alertaAtivo ? 'bg-green-500/30 text-green-300' : 'bg-zinc-500/30 text-zinc-400'}`}
                      >
                        {atividade.alertaAtivo ? <Bell className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                        {atividade.alertaAtivo ? 'Alerta ativo' : 'Alerta inativo'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 pb-8">
          <button
            onClick={() => { resetFormulario(); setMostrarFormulario(true); setEditandoId(null); }}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ➕ INCLUA AQUI SUA ATIVIDADE ESPORTIVA
          </button>
        </div>
      </main>
    </div>
  );
}


