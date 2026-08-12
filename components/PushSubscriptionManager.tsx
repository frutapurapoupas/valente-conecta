'use client';

import { useEffect, useState } from 'react';
import { obterUsuarioLocalId } from '@/lib/usuarioLocal';
import { notificacaoService } from '@/services/notificacaoService';
import { GRUPOS_INTERESSE } from '@/lib/gruposInteresse';
import { Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PushSubscriptionManager() {
  const [usuarioId, setUsuarioId] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [mostrarPreferencias, setMostrarPreferencias] = useState(false);
  const [cidade, setCidade] = useState('');
  const [grupos, setGrupos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setUsuarioId(obterUsuarioLocalId());
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      verificarAssinatura();
    }
  }, []);

  const verificarAssinatura = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      const success = await notificacaoService.salvarPushSubscription(subscription, usuarioId);

      if (success) {
        setIsSubscribed(true);
        setMostrarPreferencias(true);
      }
    } catch (error) {
      console.error('Erro ao assinar push:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      setIsSubscribed(false);
    }
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
        onClick={() => (isSubscribed ? abrirPreferencias() : subscribeToPush())}
        className={`fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          isSubscribed
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-500 hover:bg-gray-600'
        } text-white`}
        title={isSubscribed ? 'Notificações ativadas' : 'Ativar notificações'}
      >
        <Bell className="w-5 h-5" />
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
              onClick={unsubscribeFromPush}
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
