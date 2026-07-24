// ============================================================================
// ARQUIVO 8: services/notificationQueue.ts
// Funcionalidade: Fila de processamento de notificações com Bull + Redis
// ============================================================================

import Queue from 'bull';
import Redis from 'ioredis';

// Configuração do Redis (usando Redis Cloud gratuita ou local)
// Para desenvolvimento local, você pode usar: redis://localhost:6379
// Para produção, recomendo: Upstash Redis (plano gratuito: 10k comandos/dia)

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Configuração do Redis
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Interface da notificação na fila
interface NotificationJobData {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  importancia: string;
  enviar_telegram: boolean;
  enviar_push: boolean;
  para_grupo?: string;
  para_usuario_id?: string;
  link_url?: string;
  modo_teste: boolean;
  created_at: string;
}

// Criação da fila
export const notificationQueue = new Queue<NotificationJobData>('notifications', {
  redis: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100, // Mantém últimos 100 jobs completos
    removeOnFail: 200, // Mantém últimos 200 jobs falhos
    timeout: 30000 // 30 segundos timeout
  }
});

// ============================================================================
// WORKER: Processamento das notificações em background
// ============================================================================

import { enviarTelegramJob, enviarPushJob } from './notificationWorkers';

notificationQueue.process(async (job) => {
  const data = job.data;
  const results: Array<{ canal: string; success: boolean; error?: string }> = [];
  
  console.log(`📨 Processando notificação: ${data.id} - ${data.titulo}`);
  
  // Enviar Telegram
  if (data.enviar_telegram) {
    try {
      const result = await enviarTelegramJob(data);
      results.push({ canal: 'telegram', success: result });
    } catch (error) {
      console.error(`Erro ao enviar Telegram para ${data.id}:`, error);
      results.push({ canal: 'telegram', success: false, error: String(error) });
    }
  }
  
  // Enviar Push Notification
  if (data.enviar_push) {
    try {
      const result = await enviarPushJob(data);
      results.push({ canal: 'push', success: result });
    } catch (error) {
      console.error(`Erro ao enviar Push para ${data.id}:`, error);
      results.push({ canal: 'push', success: false, error: String(error) });
    }
  }
  
  // Registrar log do processamento
  await registrarLogJob(data.id, results);
  
  return { results };
});

// ============================================================================
// EVENTOS DA FILA (Monitoramento)
// ============================================================================

notificationQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completado: ${job.data.titulo}`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err);
});

notificationQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job?.id} stalled`);
});

notificationQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progresso: ${progress}%`);
});

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

async function registrarLogJob(notificationId: string, results: any[]) {
  try {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('notificacoes_logs_queue').insert({
      notificacao_id: notificationId,
      resultados: results,
      data_processamento: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar log do job:', error);
  }
}

// ============================================================================
// FUNÇÕES DE GERENCIAMENTO DA FILA
// ============================================================================

export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    notificationQueue.getWaitingCount(),
    notificationQueue.getActiveCount(),
    notificationQueue.getCompletedCount(),
    notificationQueue.getFailedCount(),
    notificationQueue.getDelayedCount()
  ]);
  
  return { waiting, active, completed, failed, delayed };
}

export async function cleanQueue() {
  await notificationQueue.clean(0, 'completed');
  await notificationQueue.clean(0, 'failed');
  return { success: true };
}

export async function pauseQueue() {
  await notificationQueue.pause();
  return { success: true };
}

export async function resumeQueue() {
  await notificationQueue.resume();
  return { success: true };
}


