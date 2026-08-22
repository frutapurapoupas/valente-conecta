// Caminho: C:\valente_conecta\app\api\admin-master\usuarios-metricas\route.ts
//
// Dados agregados de usuarios pros graficos do admin master (Dashboard,
// tela de Metricas e tela de Usuarios) — cadastros por dia, por cidade e
// por status. Mesmo criterio de status de /api/admin-master/stats-usuarios.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient();
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, cidade_base, role, trial_end_at, is_viral_active, viral_end_at, created_at');
    if (error) throw error;

    const lista = usuarios || [];
    const agora = new Date();

    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const novosUltimos7Dias = lista.filter((u) => new Date(u.created_at) >= seteDiasAtras).length;

    let totalAdmins = 0;
    let totalTrial = 0;
    let totalViral = 0;
    let totalExpirado = 0;
    for (const u of lista) {
      if (u.role === 'admin') totalAdmins++;
      else if (u.trial_end_at && new Date(u.trial_end_at) > agora) totalTrial++;
      else if (u.is_viral_active && u.viral_end_at && new Date(u.viral_end_at) > agora) totalViral++;
      else totalExpirado++;
    }

    const porCidadeMapa = new Map<string, number>();
    for (const u of lista) {
      const cidade = u.cidade_base || 'Não informada';
      porCidadeMapa.set(cidade, (porCidadeMapa.get(cidade) || 0) + 1);
    }
    const porCidade = Array.from(porCidadeMapa.entries())
      .map(([cidade, total]) => ({ cidade, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    const cadastrosPorDiaMapa = new Map<string, number>();
    const dias: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      dias.push(chave);
      cadastrosPorDiaMapa.set(chave, 0);
    }
    for (const u of lista) {
      const chave = String(u.created_at).slice(0, 10);
      if (cadastrosPorDiaMapa.has(chave)) cadastrosPorDiaMapa.set(chave, (cadastrosPorDiaMapa.get(chave) || 0) + 1);
    }
    const cadastrosPorDia = dias.map((chave) => ({
      data: new Date(chave + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: cadastrosPorDiaMapa.get(chave) || 0,
    }));

    const { data: assinaturasAtivas } = await supabase.from('assinaturas_planos').select('usuario_id').eq('status', 'ativo');
    const comPlanoAtivo = new Set((assinaturasAtivas || []).map((a) => a.usuario_id)).size;

    return NextResponse.json({
      success: true,
      data: {
        totalUsuarios: lista.length,
        novosUltimos7Dias,
        comPlanoAtivo: comPlanoAtivo || 0,
        totalAdmins,
        porStatus: { trial: totalTrial, viral: totalViral, expirado: totalExpirado },
        porCidade,
        cadastrosPorDia,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao calcular métricas' }, { status: 500 });
  }
}
