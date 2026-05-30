'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { notificacaoService } from '@/services/notificacaoService';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PushSubscriptionManager() {
  const { user } = useApp();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

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
      
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão necessária para enviar notificações');
        return;
      }

      // Inscrever
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Salvar no backend
      const success = await notificacaoService.salvarPushSubscription(subscription, user?.id || '');
      
      if (success) {
        setIsSubscribed(true);
        toast.success('🔔 Notificações ativadas! Você receberá avisos importantes.');
      }
    } catch (error) {
      console.error('Erro ao assinar push:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const unsubscribeFromPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      setIsSubscribed(false);
      toast.success('Notificações desativadas');
    }
  };

  if (!isSupported || !user) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      className={`fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
        isSubscribed 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-500 hover:bg-gray-600'
      } text-white`}
      title={isSubscribed ? 'Notificações ativadas' : 'Ativar notificações'}
    >
      <Bell className="w-5 h-5" />
    </button>
  );
}