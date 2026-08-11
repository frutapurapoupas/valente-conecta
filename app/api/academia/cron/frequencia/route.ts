// Caminho: C:\valente_conecta\app\api\academia\cron\frequencia\route.ts
// Disparado diariamente pelo Vercel Cron (ver vercel.json). Compara, para
// cada aluno com meta de frequencia semanal definida no perfil, quantos
// check-ins ja fez essa semana contra o ritmo esperado ate hoje, e manda um
// lembrete por push se estiver atrasado. Ninguem recebe mais de um lembrete
// por dia, mesmo rodando diariamente, porque so notifica quem esta atrasado
// no dia da checagem.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaAluno } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  try {
    const supabase = createClient();

    const { data: perfis, error } = await supabase
      .from('academia_perfis')
      .select('aluno_id, freq_semanal')
      .not('freq_semanal', 'is', null)
      .gt('freq_semanal', 0);
    if (error) throw error;

    const hoje = new Date();
    const diaIsoSemana = ((hoje.getDay() + 6) % 7) + 1; // segunda=1 ... domingo=7
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - (diaIsoSemana - 1));
    inicioSemana.setHours(0, 0, 0, 0);

    let lembretesEnviados = 0;

    for (const perfil of perfis || []) {
      const { count } = await supabase
        .from('academia_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('aluno_id', perfil.aluno_id)
        .gte('checkin_time', inicioSemana.toISOString());

      const esperadoAteHoje = Math.floor((perfil.freq_semanal * diaIsoSemana) / 7);
      const feitos = count || 0;

      if (feitos < esperadoAteHoje) {
        await enviarPushParaAluno(perfil.aluno_id, {
          title: 'Falta pouco pra sua meta da semana!',
          body: `Você treinou ${feitos} de ${perfil.freq_semanal} vezes essa semana. Bora manter o ritmo?`,
          url: '/academia/aluno',
        });
        lembretesEnviados += 1;
      }
    }

    return NextResponse.json({ success: true, alunosVerificados: (perfis || []).length, lembretesEnviados });
  } catch (error: any) {
    console.error('Erro no cron de frequencia:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
