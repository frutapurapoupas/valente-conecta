import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configurar VAPID keys (gerar com: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:suporte@valenteconecta.com.br',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const { subscription, title, body, icon, url } = await request.json();

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: url || '/' }
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar push:', error);
    
    // Se subscription expirou, marcar como inativa
    if (error.statusCode === 410) {
      // Remover subscription do banco
    }
    
    return NextResponse.json({ error: 'Erro ao enviar push' }, { status: 500 });
  }
}
