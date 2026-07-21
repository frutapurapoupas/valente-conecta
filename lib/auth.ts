// lib/auth.ts
'use client';

import { supabase, type Usuario } from './supabase';

// FunÃ§Ã£o alternativa para gerar UUID (funciona em qualquer navegador)
function gerarUUID(): string {
  // Tentativa 1: usar crypto.randomUUID se disponÃ­vel
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: gerar UUID manualmente (funciona em todos os navegadores)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Gera ID de sessÃ£o temporÃ¡ria (30 minutos)
export function gerarSessaoTemp(): string {
  const sessaoId = gerarUUID();
  const expiraEm = new Date();
  expiraEm.setMinutes(expiraEm.getMinutes() + 30);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessao_temp_id', sessaoId);
    localStorage.setItem('sessao_temp_expira', expiraEm.toISOString());
    
    // Salvar cookies para o middleware
    document.cookie = `sessao_temp_id=${sessaoId}; path=/; max-age=1800`;
    document.cookie = `sessao_temp_expira=${expiraEm.toISOString()}; path=/; max-age=1800`;
  }
  
  return sessaoId;
}

// Verifica se a sessÃ£o temporÃ¡ria Ã© vÃ¡lida
export function isSessaoTempValida(): boolean {
  if (typeof window === 'undefined') return false;
  const expiraEm = localStorage.getItem('sessao_temp_expira');
  if (!expiraEm) return false;
  return new Date(expiraEm) > new Date();
}

// Verifica se usuÃ¡rio estÃ¡ logado
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('user_logged_in') === 'true';
}

// ObtÃ©m usuÃ¡rio atual do localStorage
export function getCurrentUser(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user_data');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Cadastro simples (nome e WhatsApp)
export async function cadastroSimples(
  nome: string, 
  whatsapp: string, 
  codigoIndicacao?: string
): Promise<{ success: boolean; user?: Usuario; error?: string }> {
  try {
    // Limpar WhatsApp (remover espaÃ§os e caracteres especiais)
    const whatsappLimpo = whatsapp.replace(/\D/g, '');
    
    // Verificar se usuÃ¡rio jÃ¡ existe
    const { data: existing, error: searchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('whatsapp', whatsappLimpo)
      .maybeSingle();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Erro ao buscar usuÃ¡rio:', searchError);
    }
    
    if (existing) {
      // UsuÃ¡rio jÃ¡ existe, apenas logar
      localStorage.setItem('user_logged_in', 'true');
      localStorage.setItem('user_data', JSON.stringify(existing));
      
      // Renovar cookie
      document.cookie = `user_logged_in=true; path=/; max-age=86400`;
      
      return { success: true, user: existing };
    }
    
    // Criar cÃ³digo de indicaÃ§Ã£o Ãºnico
    const codigo = `VALENTE_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + 2); // 2 dias grÃ¡tis
    
    // Buscar ID do usuÃ¡rio que indicou
    let convidadoPorId = null;
    if (codigoIndicacao) {
      const { data: indicador } = await supabase
        .from('usuarios')
        .select('id')
        .eq('codigo_indicacao', codigoIndicacao)
        .maybeSingle();
      
      if (indicador) {
        convidadoPorId = indicador.id;
      }
    }
    
    // Criar novo usuÃ¡rio
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nome,
        whatsapp: whatsappLimpo,
        codigo_indicacao: codigo,
        convidado_por_id: convidadoPorId,
        trial_started_at: new Date().toISOString(),
        trial_end_at: trialEndAt.toISOString(),
        is_viral_active: false,
        total_earned: 0,
        role: 'user'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao criar usuÃ¡rio:', insertError);
      return { success: false, error: insertError.message };
    }
    
    // Registrar indicaÃ§Ã£o
    if (convidadoPorId && newUser) {
      await supabase
        .from('indicacoes')
        .insert({
          usuario_id: convidadoPorId,
          indicado_id: newUser.id
        });
    }
    
    // Salvar no localStorage
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_data', JSON.stringify(newUser));
    
    // Salvar cookie para o middleware
    document.cookie = `user_logged_in=true; path=/; max-age=86400`;
    document.cookie = `user_role=${newUser.role}; path=/; max-age=86400`;
    
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    return { success: false, error: error.message };
  }
}

// Logout
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_logged_in');
    localStorage.removeItem('user_data');
    
    // Limpar cookies
    document.cookie = 'user_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sessao_temp_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sessao_temp_expira=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

// Verificar acesso do usuÃ¡rio (trial, viral, etc.)
export async function checkUserAccess(userId: number): Promise<{
  hasAccess: boolean;
  reason: 'trial' | 'viral' | 'paid' | 'expired';
  daysLeft: number;
  message?: string;
}> {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('trial_end_at, is_viral_active, viral_end_at, role')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    return { hasAccess: false, reason: 'expired', daysLeft: 0, message: 'UsuÃ¡rio nÃ£o encontrado' };
  }
  
  // Admin tem acesso total
  if (user.role === 'admin') {
    return { hasAccess: true, reason: 'paid', daysLeft: 999 };
  }
  
  const now = new Date();
  
  // Verificar trial (2 dias)
  if (user.trial_end_at && new Date(user.trial_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.trial_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { hasAccess: true, reason: 'trial', daysLeft };
  }
  
  // Verificar viral (30 dias)
  if (user.is_viral_active && user.viral_end_at && new Date(user.viral_end_at) > now) {
    const daysLeft = Math.ceil((new Date(user.viral_end_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { hasAccess: true, reason: 'viral', daysLeft };
  }
  
  // Acesso expirado
  // Contar quantos usuÃ¡rios este usuÃ¡rio indicou
  const { count } = await supabase
    .from('indicacoes')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId);
  
  const metaUsuarios = 50;
  const faltam = Math.max(0, metaUsuarios - (count || 0));
  
  return {
    hasAccess: false,
    reason: 'expired',
    daysLeft: 0,
    message: `â° Seu perÃ­odo de teste acabou. Indique mais ${faltam} amigos para ganhar 30 dias grÃ¡tis!`
  };
}

