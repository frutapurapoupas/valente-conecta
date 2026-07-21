"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, MapPin, Navigation, Clock, Plus, X, 
  ArrowLeft, Save, Edit, Bell, Trash2, Search,
  Activity, CheckCircle, AlertCircle, WifiOff
} from 'lucide-react';

// Interface estendida para suportar a propriedade 'vibrate' que nÃ£o existe no tipo base do TS
interface NotificationOptionsCustom extends NotificationOptions {
  vibrate?: number[];
}

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
  { nome: "? Futebol", icone: "?", cor: "from-green-600 to-green-800" },
  { nome: "?? Corrida", icone: "??", cor: "from-red-600 to-red-800" },
  { nome: "?? Ciclismo", icone: "??", cor: "from-blue-600 to-blue-800" },
  { nome: "?? NataÃ§Ã£o", icone: "??", cor: "from-cyan-600 to-cyan-800" },
  { nome: "?? VÃ´lei", icone: "??", cor: "from-yellow-600 to-yellow-800" },
  { nome: "?? Basquete", icone: "??", cor: "from-orange-600 to-orange-800" },
  { nome: "?? TÃªnis", icone: "??", cor: "from-lime-600 to-lime-800" },
  { nome: "?? Boxe", icone: "??", cor: "from-red-700 to-red-900" },
  { nome: "?? Yoga", icone: "??", cor: "from-purple-600 to-purple-800" },
  { nome: "??? MusculaÃ§Ã£o", icone: "???", cor: "from-gray-600 to-gray-800" },
  { nome: "?? Caminhada", icone: "??", cor: "from-emerald-600 to-emerald-800" },
  { nome: "?? Crossfit", icone: "??", cor: "from-amber-600 to-amber-800" },
  { nome: "?? Jiu-Jitsu", icone: "??", cor: "from-indigo-600 to-indigo-800" },
  { nome: "?? Beach Tennis", icone: "??", cor: "from-teal-600 to-teal-800" },
  { nome: "?? Trilha", icone: "??", cor: "from-stone-600 to-stone-800" }
];

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'TerÃ§a-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'SÃ¡bado'
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

  useEffect(() => {
    const salvas = localStorage.getItem('academia_esportes');
    if (salvas) {
      setAtividades(JSON.parse(salvas));
    }
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setGpsPermissao(result.state as any);
      });
    }
  }, []);

  useEffect(() => {
    if (mensagemStatus.texto) {
      const timer = setTimeout(() => setMensagemStatus({ texto: '', tipo: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensagemStatus]);

  useEffect(() => {
    const verificarAlertas = () => {
      const agora = new Date();
      const diaAtual = DIAS_SEMANA[agora.getDay()];
      const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');
      
      atividades.forEach(atividade => {
        if (atividade.alertaAtivo && atividade.diaSemana === diaAtual && atividade.horario === horaAtual) {
          if ('Notification' in window && Notification.permission === 'granted') {
            // CORREÃ‡ÃƒO: Criar um objeto options explicitamente tipado
            const options: NotificationOptionsCustom = {
              body: `Hoje Ã© dia de ${atividade.tipo} Ã s ${atividade.horario} em ${atividade.local}`,
              icon: '/icon.png',
              vibrate: [200, 100, 200]
            };
            new Notification('? Hora do Esporte!', options);
          }
        }
      });
    };
    
    const interval = setInterval(verificarAlertas, 60000);
    return () => clearInterval(interval);
  }, [atividades]);

  const esportesFiltrados = ESPORTES_PREDEFINIDOS.filter(e =>
    e.nome.toLowerCase().includes(buscaEsporte.toLowerCase())
  );

  // Capturar localizaÃ§Ã£o
  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      setMensagemStatus({ texto: 'GeolocalizaÃ§Ã£o nÃ£o suportada', tipo: 'erro' });
      return;
    }

    setCapturandoLocal(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNovaAtividade(prev => ({
          ...prev,
          localizador: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          localizadorCapturado: true
        }));
        setCapturandoLocal(false);
        setMensagemStatus({ texto: '?? LocalizaÃ§Ã£o capturada com sucesso!', tipo: 'sucesso' });
      },
      (err) => {
        setCapturandoLocal(false);
        let mensagem = 'Erro ao capturar localizaÃ§Ã£o';
        if (err.code === 1) {
          mensagem = 'PermissÃ£o de localizaÃ§Ã£o negada. Ative no navegador.';
          setGpsPermissao('denied');
        } else if (err.code === 2) {
          mensagem = 'Sinal de GPS indisponÃ­vel. Tente novamente.';
        } else if (err.code === 3) {
          mensagem = 'Tempo de busca excedido. Tente novamente.';
        }
        setMensagemStatus({ texto: mensagem, tipo: 'erro' });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  // Adicionar atividade
  const adicionarAtividade = () => {
    if (!novaAtividade.tipo || !novaAtividade.local || !novaAtividade.diaSemana || !novaAtividade.horario) {
      setMensagemStatus({ texto: 'Preencha todos os campos obrigatÃ³rios', tipo: 'erro' });
      return;
    }

    const nova: AtividadeEsportiva = {
      id: Date.now().toString(),
      ...novaAtividade,
      tipo: novaAtividade.tipo,
      nome: novaAtividade.nome || novaAtividade.tipo,
      local: novaAtividade.local,
      localizador: novaAtividade.localizador,
      localizadorCapturado: novaAtividade.localizadorCapturado,
      diaSemana: novaAtividade.diaSemana,
      horario: novaAtividade.horario,
      duracao: novaAtividade.duracao,
      tempoPermanencia: novaAtividade.tempoPermanencia,
      alertaAtivo: novaAtividade.alertaAtivo
    };

    let novasAtividades;
    if (editandoId) {
      novasAtividades = atividades.map(a => a.id === editandoId ? nova : a);
      setMensagemStatus({ texto: '? Atividade atualizada com sucesso!', tipo: 'sucesso' });
    } else {
      novasAtividades = [...atividades, nova];
      setMensagemStatus({ texto: '? Atividade adicionada com sucesso!', tipo: 'sucesso' });
    }

    setAtividades(novasAtividades);
    localStorage.setItem('academia_esportes', JSON.stringify(novasAtividades));
    resetarFormulario();
  };

  // Editar atividade
  const editarAtividade = (id: string) => {
    const atividade = atividades.find(a => a.id === id);
    if (!atividade) return;

    setNovaAtividade({
      tipo: atividade.tipo,
      nome: atividade.nome,
      local: atividade.local,
      localizador: atividade.localizador,
      localizadorCapturado: atividade.localizadorCapturado,
      diaSemana: atividade.diaSemana,
      horario: atividade.horario,
      duracao: atividade.duracao,
      tempoPermanencia: atividade.tempoPermanencia,
      alertaAtivo: atividade.alertaAtivo
    });
    setEditandoId(id);
    setMostrarFormulario(true);
  };

  // Remover atividade
  const removerAtividade = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta atividade?')) {
      const novas = atividades.filter(a => a.id !== id);
      setAtividades(novas);
      localStorage.setItem('academia_esportes', JSON.stringify(novas));
      setMensagemStatus({ texto: '??? Atividade removida', tipo: 'info' });
    }
  };

  // Resetar formulÃ¡rio
  const resetarFormulario = () => {
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
    setEditandoId(null);
    setMostrarFormulario(false);
    setBuscaEsporte('');
    setMostrarDropdown(false);
  };

  // Alternar alerta
  const alternarAlerta = (id: string) => {
    const atividadesAtualizadas = atividades.map(a => {
      if (a.id === id) {
        const nova = { ...a, alertaAtivo: !a.alertaAtivo };
        return nova;
      }
      return a;
    });
    setAtividades(atividadesAtualizadas);
    localStorage.setItem('academia_esportes', JSON.stringify(atividadesAtualizadas));
  };

  // Solicitar permissÃ£o de notificaÃ§Ã£o
  const solicitarPermissaoNotificacao = async () => {
    if ('Notification' in window) {
      const permissao = await Notification.requestPermission();
      if (permissao === 'granted') {
        setMensagemStatus({ texto: '?? NotificaÃ§Ãµes ativadas!', tipo: 'sucesso' });
      } else {
        setMensagemStatus({ texto: '? NotificaÃ§Ãµes bloqueadas', tipo: 'erro' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Esportes & Atividades
            </h1>
            <p className="text-sm text-white/80">Organize suas atividades fÃ­sicas</p>
          </div>
          <button
            onClick={solicitarPermissaoNotificacao}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Ativar notificaÃ§Ãµes"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mensagem de Status */}
      {mensagemStatus.texto && (
        <div className={`mx-4 mt-4 p-3 rounded-lg flex items-center gap-2 ${
          mensagemStatus.tipo === 'sucesso' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          mensagemStatus.tipo === 'erro' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {mensagemStatus.tipo === 'sucesso' && <CheckCircle className="w-5 h-5" />}
          {mensagemStatus.tipo === 'erro' && <AlertCircle className="w-5 h-5" />}
          {mensagemStatus.tipo === 'info' && <Bell className="w-5 h-5" />}
          <span className="flex-1 text-sm">{mensagemStatus.texto}</span>
          <button onClick={() => setMensagemStatus({ texto: '', tipo: null })}>
            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* BotÃ£o Adicionar */}
        <button
          onClick={() => {
            resetarFormulario();
            setMostrarFormulario(true);
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Atividade
        </button>

        {/* FormulÃ¡rio */}
        {mostrarFormulario && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editandoId ? '?? Editar' : '? Nova'} Atividade</h3>
              <button onClick={resetarFormulario} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tipo de Esporte com Busca */}
            <div className="relative">
              <label className="text-sm text-white/70 block mb-1">Tipo de Esporte *</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={buscaEsporte || novaAtividade.tipo}
                    onChange={(e) => {
                      setBuscaEsporte(e.target.value);
                      setMostrarDropdown(true);
                      if (!e.target.value) {
                        setNovaAtividade(prev => ({ ...prev, tipo: '', nome: '' }));
                      }
                    }}
                    onFocus={() => setMostrarDropdown(true)}
                    placeholder="Buscar esporte..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {mostrarDropdown && esportesFiltrados.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                      {esportesFiltrados.map((e) => (
                        <button
                          key={e.nome}
                          onClick={() => {
                            setNovaAtividade(prev => ({ ...prev, tipo: e.nome, nome: e.nome }));
                            setBuscaEsporte(e.nome);
                            setMostrarDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm flex items-center gap-2"
                        >
                          <span>{e.icone}</span>
                          <span>{e.nome}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={capturarLocalizacao}
                  disabled={capturandoLocal}
                  className={`px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition text-sm whitespace-nowrap ${
                    capturandoLocal ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {capturandoLocal ? '?' : '??'}
                </button>
              </div>
              {novaAtividade.localizadorCapturado && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> LocalizaÃ§Ã£o capturada
                </p>
              )}
            </div>

            {/* Nome da Atividade */}
            <div>
              <label className="text-sm text-white/70 block mb-1">Nome da Atividade</label>
              <input
                type="text"
                value={novaAtividade.nome}
                onChange={(e) => setNovaAtividade(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Jogo da Galera"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Local */}
            <div>
              <label className="text-sm text-white/70 block mb-1">Local *</label>
              <input
                type="text"
                value={novaAtividade.local}
                onChange={(e) => setNovaAtividade(prev => ({ ...prev, local: e.target.value }))}
                placeholder="Ex: PraÃ§a do MocÃ³, Academia X"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Dia da Semana */}
            <div>
              <label className="text-sm text-white/70 block mb-1">Dia da Semana *</label>
              <select
                value={novaAtividade.diaSemana}
                onChange={(e) => setNovaAtividade(prev => ({ ...prev, diaSemana: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione...</option>
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
            </div>

            {/* HorÃ¡rio e DuraÃ§Ã£o */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/70 block mb-1">HorÃ¡rio *</label>
                <input
                  type="time"
                  value={novaAtividade.horario}
                  onChange={(e) => setNovaAtividade(prev => ({ ...prev, horario: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/70 block mb-1">DuraÃ§Ã£o (min)</label>
                <input
                  type="number"
                  value={novaAtividade.duracao}
                  onChange={(e) => setNovaAtividade(prev => ({ ...prev, duracao: e.target.value }))}
                  min="5"
                  max="480"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Tempo de PermanÃªncia */}
            <div>
              <label className="text-sm text-white/70 block mb-1">Tempo de permanÃªncia (min)</label>
              <input
                type="number"
                value={novaAtividade.tempoPermanencia}
                onChange={(e) => setNovaAtividade(prev => ({ ...prev, tempoPermanencia: parseInt(e.target.value) || 60 }))}
                min="5"
                max="480"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Alerta Ativo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={novaAtividade.alertaAtivo}
                onChange={(e) => setNovaAtividade(prev => ({ ...prev, alertaAtivo: e.target.checked }))}
                className="w-4 h-4 accent-purple-500"
              />
              <label className="text-sm text-white/70">Ativar alerta para este evento</label>
            </div>

            {/* BotÃµes FormulÃ¡rio */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={adicionarAtividade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editandoId ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                onClick={resetarFormulario}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Atividades */}
        <div className="space-y-3">
          {atividades.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma atividade cadastrada</p>
              <p className="text-sm">Adicione suas atividades fÃ­sicas</p>
            </div>
          ) : (
            atividades.map((atividade) => (
              <div
                key={atividade.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{atividade.tipo.split(' ')[0]}</span>
                      <h3 className="font-semibold">{atividade.nome || atividade.tipo}</h3>
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{atividade.local}</span>
                        {atividade.localizadorCapturado && (
                          <span className="text-xs text-green-400">?? GPS</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{atividade.diaSemana} Ã s {atividade.horario}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span>?? {atividade.duracao}min</span>
                        <span>â€¢</span>
                        <span>? {atividade.tempoPermanencia}min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => alternarAlerta(atividade.id)}
                      className={`p-1.5 rounded-lg transition ${
                        atividade.alertaAtivo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                      title={atividade.alertaAtivo ? 'Alerta ativo' : 'Alerta inativo'}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editarAtividade(atividade.id)}
                      className="p-1.5 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removerAtividade(atividade.id)}
                      className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status GPS */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/40 mt-4">
          {gpsPermissao === 'granted' ? (
            <><CheckCircle className="w-3 h-3 text-green-400" /> GPS ativo</>
          ) : gpsPermissao === 'denied' ? (
            <><AlertCircle className="w-3 h-3 text-red-400" /> GPS bloqueado</>
          ) : (
            <><WifiOff className="w-3 h-3" /> GPS disponÃ­vel</>
          )}
        </div>
      </div>
    </div>
  );
}

