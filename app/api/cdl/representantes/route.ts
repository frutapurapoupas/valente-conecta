// Caminho: C:\valente_conecta\app\api\cdl\representantes\route.ts
// Lista publica (so' id/nome/cidade, sem PIN) pra tela de login do CDL
// escolher quem vai entrar.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cidade = request.nextUrl.searchParams.get('cidade');
  const supabase = createClient();
  let query = supabase.from('cdl_representantes').select('id, nome, cidade').eq('ativo', true).order('nome');
  if (cidade) query = query.eq('cidade', cidade.toUpperCase());
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}
