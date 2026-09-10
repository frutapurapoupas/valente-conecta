// Caminho: C:\valente_conecta\app\api\saude-fila\unidades\route.ts
//
// Lista publica de unidades participantes da Fila Virtual de Saude, pro
// paciente escolher onde entrar na fila.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('unidades_saude')
    .select('id, nome, tipo, regime, endereco, cidade, unidade_saude_servicos(id, nome, tipo, preco)')
    .eq('ativo', true)
    .order('nome');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
