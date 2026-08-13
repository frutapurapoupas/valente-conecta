// Caminho: C:\valente_conecta\app\api\admin-master\usuarios-lista\route.ts
//
// Lista real de usuarios cadastrados (tabela usuarios), com status
// calculado (mesmo criterio de /api/admin-master/stats-usuarios) e detalhes
// segregados: plano ativo (assinaturas_planos) e cidades adicionais ativas
// (usuario_cidades_adicionais). Suporta busca por nome/whatsapp, filtro por
// cidade, status e "novos" (cadastrados nos ultimos 7 dias).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function calcularStatus(usuario: any): 'admin' | 'trial' | 'viral' | 'expirado' {
  const agora = new Date();
  if (usuario.role === 'admin') return 'admin';
  if (usuario.trial_end_at && new Date(usuario.trial_end_at) > agora) return 'trial';
  if (usuario.is_viral_active && usuario.viral_end_at && new Date(usuario.viral_end_at) > agora) return 'viral';
  return 'expirado';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const busca = searchParams.get('busca')?.trim();
    const cidade = searchParams.get('cidade');
    const statusFiltro = searchParams.get('status');
    const novos = searchParams.get('novos') === 'true';

    const supabase = createClient();
    let query = supabase
      .from('usuarios')
      .select('id, nome, whatsapp, cidade_base, role, trial_end_at, is_viral_active, viral_end_at, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (busca) query = query.or(`nome.ilike.%${busca}%,whatsapp.ilike.%${busca}%`);
    if (cidade) query = query.eq('cidade_base', cidade);
    if (novos) {
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', seteDiasAtras);
    }

    const { data: usuarios, error } = await query;
    if (error) throw error;

    const ids = (usuarios || []).map((u) => u.id);

    const [{ data: assinaturas }, { data: cidadesAdicionais }] = await Promise.all([
      ids.length
        ? supabase.from('assinaturas_planos').select('usuario_id, plano_id, servico_id').eq('status', 'ativo').in('usuario_id', ids)
        : Promise.resolve({ data: [] as any[] }),
      ids.length
        ? supabase.from('usuario_cidades_adicionais').select('usuario_id, cidade').eq('status', 'ativo').in('usuario_id', ids)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const planosPorUsuario = new Map<string, { plano_id: string; servico_id: string }[]>();
    for (const a of assinaturas || []) {
      const lista = planosPorUsuario.get(a.usuario_id) || [];
      lista.push({ plano_id: a.plano_id, servico_id: a.servico_id });
      planosPorUsuario.set(a.usuario_id, lista);
    }
    const cidadesPorUsuario = new Map<string, string[]>();
    for (const c of cidadesAdicionais || []) {
      const lista = cidadesPorUsuario.get(c.usuario_id) || [];
      lista.push(c.cidade);
      cidadesPorUsuario.set(c.usuario_id, lista);
    }

    let data = (usuarios || []).map((u) => ({
      ...u,
      status: calcularStatus(u),
      planos_ativos: planosPorUsuario.get(u.id) || [],
      cidades_adicionais: cidadesPorUsuario.get(u.id) || [],
    }));

    if (statusFiltro) data = data.filter((u) => u.status === statusFiltro);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao listar usuários' }, { status: 500 });
  }
}
