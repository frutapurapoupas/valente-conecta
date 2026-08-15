// Caminho: C:\valente_conecta\app\api\admin-master\quiz-perfil\resumo\route.ts
// Quantos usuários já responderam o quiz de perfil, por segmento.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('perfil_quiz_respostas').select('segmento_principal');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const porSegmento = { servico: 0, produto: 0, geral: 0 };
  for (const row of data || []) {
    if (row.segmento_principal in porSegmento) (porSegmento as any)[row.segmento_principal]++;
  }

  return NextResponse.json({ success: true, data: { total: (data || []).length, porSegmento } });
}
