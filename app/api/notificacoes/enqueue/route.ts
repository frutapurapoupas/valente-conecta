// ============================================================================
// ARQUIVO 10: app/api/notificacoes/enqueue/route.ts
// Funcionalidade: API para adicionar notificaÃ§Ã£o Ã  fila
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { notificationQueue } from '@/services/notificationQueue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Adicionar job Ã  fila
    const job = await notificationQueue.add('send-notification', body, {
      priority: body.importancia === 'alta' ? 1 : body.importancia === 'media' ? 2 : 3,
      delay: body.agendar ? new Date(body.agendar).getTime() - Date.now() : 0
    });
    
    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'NotificaÃ§Ã£o adicionada Ã  fila'
    });
    
  } catch (error) {
    console.error('Erro ao adicionar Ã  fila:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'stats') {
    const stats = await notificationQueue.getJobCounts();
    return NextResponse.json({ success: true, stats });
  }
  
  if (action === 'jobs') {
    const jobs = await notificationQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    return NextResponse.json({ success: true, jobs: jobs.map(j => ({ id: j.id, data: j.data, status: j.finishedOn ? 'completed' : 'processing' })) });
  }
  
  return NextResponse.json({ error: 'AÃ§Ã£o nÃ£o reconhecida' }, { status: 400 });
}

