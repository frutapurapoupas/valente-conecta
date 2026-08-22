// Caminho: C:\valente_conecta\app\api\config-suporte\route.ts
//
// Contato oficial de suporte da plataforma (WhatsApp + email) — antes
// existiam dois numeros identicos hardcoded ("5575999999999", sem vir de
// nenhum cadastro real) em app/servico-indisponivel/page.tsx e
// app/comercio/page.tsx. Agora centralizado em admin_configuracoes
// (chave='suporte_contato'), editavel pelo admin master sem deploy.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'suporte_contato';
const defaultConfig = { whatsapp: '', email: '' };

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : defaultConfig;
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = {
      whatsapp: String(body.whatsapp || '').replace(/\D/g, ''),
      email: String(body.email || '').trim(),
    };

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify(config), descricao: 'Contato oficial de suporte da plataforma (WhatsApp + email)' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
