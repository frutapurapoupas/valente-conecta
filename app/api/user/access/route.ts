// app/api/user/access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ hasAccess: false, message: 'Usuário não identificado' });
  }
  
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, trial_end_at, is_viral_active, viral_end_at, plano')
    .eq('id', parseInt(userId))
    .single();
  
  if (error || !user) {
    return NextResponse.json({ hasAccess: false, message: 'Usuário não encontrado' });
  }
  
  const now = new Date();
  
  // Verificar trial (2 dias)
  if (user.trial_end_at && new Date(user.trial_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.trial_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return NextResponse.json({ hasAccess: true, daysLeft });
  }
  
  // Verificar viral (30 dias)
  if (user.is_viral_active && user.viral_end_at && new Date(user.viral_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.viral_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return NextResponse.json({ hasAccess: true, daysLeft });
  }
  
  // Verificar plano pago
  if (user.plano === 'premium' || user.plano === 'basico') {
    return NextResponse.json({ hasAccess: true });
  }
  
  // Acesso expirado - verificar se pode ativar viral
  const { count: indicados } = await supabase
    .from('usuarios_indicados_por')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId);
  
  const metaUsuarios = 50; // Buscar da configuração
  
  if (indicados && indicados >= metaUsuarios) {
    // Ativar viral automaticamente
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
    
    return NextResponse.json({ 
      hasAccess: true, 
      daysLeft: 30,
      message: `🎉 Você indicou ${indicados} amigos! Ganhou 30 dias grátis!`
    });
  }
  
  const faltam = metaUsuarios - (indicados || 0);
  return NextResponse.json({ 
    hasAccess: false, 
    message: `⏰ Seu período de teste acabou. Indique mais ${faltam} amigos para ganhar 30 dias grátis!`,
    faltam
  });
}