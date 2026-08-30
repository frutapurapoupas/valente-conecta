// Caminho: C:\valente_conecta\app\api\cozinha\revendedores\route.ts
//
// Cadastro/aprovacao de revendedores da Cozinha Chef Neide
// (087_cozinha_checkout_pedidos.sql). E' o que torna a alegacao "sou
// revendedor" confiavel no checkout (app/api/cozinha/pedidos/route.ts
// SEMPRE revalida contra esta tabela, nunca confia no `?perfil=` da URL).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('cozinha_revendedores').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const whatsapp = String(body.whatsapp || '').replace(/\D/g, '');
    const nome = String(body.nome || '').trim();
    if (!whatsapp || !nome) return NextResponse.json({ success: false, error: 'whatsapp e nome são obrigatórios' }, { status: 400 });

    const formasValidas = ['fiado_prazo', 'pagamento_entrega', 'aprovacao_manual'];
    const formaConfirmacao = formasValidas.includes(body.formaConfirmacao) ? body.formaConfirmacao : 'aprovacao_manual';

    const supabase = createClient();
    const { data, error } = await supabase
      .from('cozinha_revendedores')
      .insert({
        whatsapp,
        nome,
        forma_confirmacao: formaConfirmacao,
        observacoes: body.observacoes || null,
        aprovado_por: body.aprovadoPor || null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar revendedor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const atualizacao: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.ativo !== undefined) atualizacao.ativo = !!body.ativo;
    if (body.formaConfirmacao !== undefined) atualizacao.forma_confirmacao = body.formaConfirmacao;
    if (body.nome !== undefined) atualizacao.nome = String(body.nome).trim();
    if (body.observacoes !== undefined) atualizacao.observacoes = body.observacoes || null;

    const supabase = createClient();
    const { data, error } = await supabase.from('cozinha_revendedores').update(atualizacao).eq('id', id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar revendedor' }, { status: 500 });
  }
}
