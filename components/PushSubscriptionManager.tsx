'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { verificarInscricaoPush, ativarPush, desativarPush, pushSuportadoNoNavegador } from '@/lib/push/pushCliente';
import { GRUPOS_INTERESSE } from '@/lib/gruposInteresse';
import { Bell, BellRing, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Antes disso usava obterUsuarioLocalId() (um id aleatorio por
// aparelho, guardado antes de existir login de verdade) -- a inscricao
// de push ficava salva sob um id que NUNCA bate com usuarios.id, que e'
// o que enviarPushParaUsuario() usa em todo o app (lib/push.ts, ~30
// rotas). Resultado: nenhum push jamais chegou a ninguem, em lugar
// nenhum do app, desde que o recurso existe (confirmado: push_subscriptions
// estava vazia). Agora usa a conta logada de verdade.
//
// Tambem era so' um icone de sino sem texto nenhum, escondido no canto
// -- quem tem pouca intimidade com celular nunca ia adivinhar o que
// aquilo faz. Agora tem escrito, e a mesma acao tambem existe dentro do
// Perfil (ver app/profile/page.tsx) -- dois jeitos de achar, nao um so'.
export default function PushSubscriptionManager() {
  const [usuarioId, setUsuarioId] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [mostrarPreferencias, setMostrarPreferencias] = useState(false);
  const [cidade, setCidade] = useState('');
  const [grupos, setGrupos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const usuario = getCurrentUser();
    setUsuarioId(usuario?.id || '');
    if (pushSuportadoNoNavegador()) {
      setIsSupported(true);
      verificarInscricaoPush().then(setIsSubscribed);
    }
  }, []);

  const ativar = async () => {
    const ok = await ativarPush(usuarioId);
    if (ok) {
      setIsSubscribed(true);
      setMostrarPreferencias(true);
      toast.success('Avisos ativados!');
    }
  };

  const desativar = async () => {
    await desativarPush();
    setIsSubscribed(false);
    setMostrarPreferencias(false);
  };

  const abrirPreferencias = async () => {
    setMostrarPreferencias(true);
    try {
      const resp = await fetch(`/api/push/preferencias?usuarioId=${usuarioId}`);
      const resultado = await resp.json();
      if (resultado.success) {
        setCidade(resultado.data.cidade || '');
        setGrupos(resultado.data.grupos_interesse || []);
      }
    } catch {
      // segue com os valores atuais do formulario
    }
  };

  const alternarGrupo = (id: string) => {
    setGrupos((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const salvarPreferencias = async () => {
    setSalvando(true);
    try {
      const resp = await fetch('/api/push/preferencias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, cidade, gruposInteresse: grupos }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success('Preferências salvas!');
      setMostrarPreferencias(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar preferências');
    } finally {
      setSalvando(false);
    }
  };

  if (!isSupported || !usuarioId) return null;

  return (
    <>
      <button
        onClick={() => (isSubscribed ? abrirPreferencias() : ativar())}
        className={`fixed bottom-24 right-4 z-50 flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full shadow-lg transition-all text-sm font-semibold ${
          isSubscribed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
        } text-white`}
      >
        {isSubscribed ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {isSubscribed ? 'Avisos ativados' : 'Ativar avisos'}
      </button>

      {mostrarPreferencias && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Suas notificações</h3>
              <button onClick={() => setMostrarPreferencias(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Isso ajuda a gente a te avisar só sobre o que interessa pra você. Tudo opcional.
            </p>

            <label className="block text-xs font-medium text-gray-600 mb-1">Sua cidade</label>
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Valente"
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-xs font-medium text-gray-600 mb-2">O que te interessa?</label>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {GRUPOS_INTERESSE.map((g) => (
                <button
                  key={g.id}
                  onClick={() => alternarGrupo(g.id)}
                  className={`px-2.5 py-1 rounded-full text-xs border ${
                    grupos.includes(g.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <button
              onClick={salvarPreferencias}
              disabled={salvando}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium mb-2"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={desativar}
              className="w-full py-2 text-red-500 text-xs font-medium"
            >
              Desativar notificações
            </button>
          </div>
        </div>
      )}
    </>
  );
}
