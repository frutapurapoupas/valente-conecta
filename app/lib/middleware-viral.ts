// lib/middleware-viral.ts
import { supabase } from './supabase';

export interface AccessStatus {
  hasAccess: boolean;
  reason: 'trial' | 'viral' | 'paid' | 'expired' | 'blocked';
  daysLeft: number;
  showMessage?: string;
}

export async function checkUserAccess(userId: number): Promise<AccessStatus> {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { hasAccess: false, reason: 'blocked', daysLeft: 0 };
  }

  const now = new Date();

  // 1. Verificar perÃ­odo de teste inicial (2 dias)
  if (user.trial_end_at && new Date(user.trial_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.trial_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { hasAccess: true, reason: 'trial', daysLeft };
  }

  // 2. Verificar acesso viral (30 dias)
  if (user.is_viral_active && user.viral_end_at && new Date(user.viral_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.viral_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { hasAccess: true, reason: 'viral', daysLeft };
  }

  // 3. Verificar plano pago (se implementado)
  // if (user.plano === 'premium') { ... }

  // 4. Acesso expirado - verificar se pode ativar viral
  const indicadosCount = await getIndicadosCount(userId);
  const metaUsuarios = await getConfiguracao('meta_usuarios_indicados', 50);

  if (indicadosCount >= metaUsuarios) {
    // Ativar automaticamente 30 dias grÃ¡tis
    await ativarViralGratis(userId);
    const daysLeft = 30;
    return { 
      hasAccess: true, 
      reason: 'viral', 
      daysLeft,
      showMessage: `ðŸŽ‰ VocÃª indicou ${indicadosCount} usuÃ¡rios! Ganhou 30 dias grÃ¡tis!`
    };
  }

  const faltam = metaUsuarios - indicadosCount;
  return { 
    hasAccess: false, 
    reason: 'expired', 
    daysLeft: 0,
    showMessage: `â° Seu perÃ­odo de teste acabou. Indique mais ${faltam} amigos para ganhar 30 dias grÃ¡tis!`
  };
}

async function getIndicadosCount(userId: number): Promise<number> {
  const { count } = await supabase
    .from('usuarios_indicados_por')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId);
  return count || 0;
}

async function getConfiguracao(chave: string, defaultValue: number): Promise<number> {
  const { data } = await supabase
    .from('admin_configuracoes')
    .select('valor')
    .eq('chave', chave)
    .single();
  return data ? parseInt(data.valor) : defaultValue;
}

async function ativarViralGratis(userId: number) {
  const now = new Date();
  const viralEndAt = new Date();
  viralEndAt.setDate(now.getDate() + 30);

  await supabase
    .from('usuarios')
    .update({
      is_viral_active: true,
      viral_activated_at: now.toISOString(),
      viral_end_at: viralEndAt.toISOString()
    })
    .eq('id', userId);
}

