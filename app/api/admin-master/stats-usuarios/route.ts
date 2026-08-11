// Caminho: C:\valente_conecta\app\api\admin-master\stats-usuarios\route.ts
//
// Contagens reais de usuarios/indicacoes pro dashboard do admin master —
// antes so existiam versoes mockadas (localStorage) ou numeros fixos no
// codigo (ver app/admin-master/dashboard-graficos/page.tsx). "Ativo" segue
// o mesmo criterio de acesso usado em lib/auth.ts::checkUserAccess: trial
// dentro do prazo, OU viral ativo dentro do prazo, OU role admin.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const agora = new Date().toISOString();

    const [totalUsuarios, usuariosAtivos, totalIndicacoes] = await Promise.all([
      supabase.from('usuarios').select('id', { count: 'exact', head: true }),
      supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .or(`trial_end_at.gt.${agora},and(is_viral_active.eq.true,viral_end_at.gt.${agora}),role.eq.admin`),
      supabase.from('indicacoes').select('id', { count: 'exact', head: true }),
    ]);

    if (totalUsuarios.error) throw totalUsuarios.error;
    if (usuariosAtivos.error) throw usuariosAtivos.error;
    if (totalIndicacoes.error) throw totalIndicacoes.error;

    // Indicacao "validada" = o indicado ainda esta com trial/acesso valido
    // (mesmo criterio usado na lista de "WhatsApps indicados e validados"
    // de app/qr-code/page.tsx). Busca em duas etapas (sem embedded resource
    // do supabase-js) porque a tabela indicacoes nao tem FK declarada pra
    // usuarios nas migrations deste repo — mesmo padrao "sem FK" do resto
    // do projeto ate a autenticacao real existir.
    const { data: indicacoes, error: erroIndicacoes } = await supabase
      .from('indicacoes')
      .select('indicado_id');
    if (erroIndicacoes) throw erroIndicacoes;

    const idsIndicados = Array.from(new Set((indicacoes || []).map((i: any) => i.indicado_id).filter(Boolean)));
    let validadas = 0;
    if (idsIndicados.length > 0) {
      const { data: indicadosComTrial, error: erroTrial } = await supabase
        .from('usuarios')
        .select('id, trial_end_at')
        .in('id', idsIndicados);
      if (erroTrial) throw erroTrial;
      validadas = (indicadosComTrial || []).filter((u: any) => u.trial_end_at && new Date(u.trial_end_at) > new Date()).length;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsuarios: totalUsuarios.count || 0,
        usuariosAtivos: usuariosAtivos.count || 0,
        totalIndicacoes: totalIndicacoes.count || 0,
        indicacoesValidadas: validadas,
        indicacoesPendentes: (totalIndicacoes.count || 0) - validadas,
      },
    });
  } catch (error: any) {
    console.error('Erro ao calcular estatísticas de usuários:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao calcular estatísticas' }, { status: 500 });
  }
}
