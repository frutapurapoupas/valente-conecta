// Caminho: C:\valente_conecta\app\api\usuario-cidades-adicionais\route.ts
//
// Usuario registrado pede acesso a uma cidade alem da base (usuarios.cidade_base).
// Cria o pedido e ja manda um aviso automatico no chat de suporte, pra o
// admin master ver na hora (ver app/admin-master/chat).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('usuario_cidades_adicionais')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('solicitado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, usuarioLocalId, cidade } = body;
    if (!usuarioId || !cidade?.trim()) {
      return NextResponse.json({ success: false, error: 'usuarioId e cidade são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: precoConfig } = await supabase
      .from('admin_configuracoes')
      .select('valor')
      .eq('chave', 'preco_cidade_adicional')
      .maybeSingle();
    const preco = precoConfig?.valor ? JSON.parse(precoConfig.valor).preco : 0;

    const { data, error } = await supabase
      .from('usuario_cidades_adicionais')
      .insert({
        usuario_id: usuarioId,
        usuario_local_id: usuarioLocalId || null,
        cidade: cidade.trim(),
        valor_cobrado: preco,
      })
      .select('*')
      .single();
    if (error) throw error;

    if (usuarioLocalId) {
      await supabase.from('mensagens_chat').insert({
        usuario_id: usuarioLocalId,
        remetente: 'usuario',
        texto: `Solicito acesso à cidade adicional: ${cidade.trim()}`,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'Você já solicitou essa cidade' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar cidade' }, { status: 500 });
  }
}
