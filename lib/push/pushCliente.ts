// Caminho: C:\valente_conecta\lib\push\pushCliente.ts
//
// Logica de inscricao de push do lado do navegador, extraida de
// components/PushSubscriptionManager.tsx pra poder ser reaproveitada em
// mais de um lugar (o sino flutuante E a tela de Perfil) -- antes so'
// existia um jeito de achar isso, um icone sem texto escondido no canto.
//
// Salva sob o ID DA CONTA logada (usuarios.id), nao mais um id aleatorio
// por aparelho -- ver nota em PushSubscriptionManager.tsx sobre o bug que
// isso corrigiu.

import { notificacaoService } from '@/services/notificacaoService';

export function pushSuportadoNoNavegador(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function verificarInscricaoPush(): Promise<boolean> {
  if (!pushSuportadoNoNavegador()) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

// Retorna true se conseguiu ativar. false sem lançar erro quando a
// pessoa nega a permissão do navegador -- isso é escolha dela, não bug.
export async function ativarPush(usuarioId: string): Promise<boolean> {
  if (!usuarioId) return false;
  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  return notificacaoService.salvarPushSubscription(subscription, usuarioId);
}

export async function desativarPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
}
