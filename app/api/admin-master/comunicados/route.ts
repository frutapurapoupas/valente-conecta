// Caminho: C:\valente_conecta\app\api\admin-master\comunicados\route.ts
//
// Admin master ve todos os comunicados (rascunho/publicado/arquivado) e
// cria um novo digitado na hora — publica direto (nao precisa de
// "aprovar" a propria mensagem, so as sugestoes da IA passam por
// aprovacao, ver /api/admin-master/comunicados/[id]).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('comunicados').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const titulo = String(body.titulo || '').trim();
    const mensagem = String(body.mensagem || '').trim();
    const adminId = String(body.adminId || '').trim();
    if (!titulo || !mensagem) return NextResponse.json({ success: false, error: 'titulo e mensagem são obrigatórios' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('comunicados')
      .insert({
        titulo,
        mensagem,
        origem: 'admin',
        status: 'publicado',
        grupos: Array.isArray(body.grupos) && body.grupos.length ? body.grupos : null,
        cidades: Array.isArray(body.cidades) && body.cidades.length ? body.cidades : null,
        criado_por: adminId || null,
        aprovado_por: adminId || null,
        publicado_em: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao publicar comunicado' }, { status: 400 });
  }
}
