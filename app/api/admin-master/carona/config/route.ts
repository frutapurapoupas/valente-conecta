// Caminho: C:\valente_conecta\app\api\admin-master\carona\config\route.ts
//
// Duas taxas configuraveis pelo admin master pra Carona Solidaria:
// taxaMotorista (motorista paga pra ter a viagem exibida na vitrine) e
// taxaPassageiro (caronista paga pra desbloquear o contato do motorista
// numa viagem especifica). Mesmo padrao key-value ja usado em varios
// outros modulos (admin_configuracoes).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'carona_config';
const defaultConfig = { taxaMotorista: 10, taxaPassageiro: 5, updatedAt: new Date().toISOString() };

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
    const taxaMotorista = Number(body.taxaMotorista);
    const taxaPassageiro = Number(body.taxaPassageiro);
    if (!Number.isFinite(taxaMotorista) || taxaMotorista < 0 || !Number.isFinite(taxaPassageiro) || taxaPassageiro < 0) {
      return NextResponse.json({ success: false, error: 'Taxas inválidas' }, { status: 400 });
    }

    const supabase = createClient();
    const next = { taxaMotorista, taxaPassageiro, updatedAt: new Date().toISOString() };

    const { data: atual } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor: JSON.stringify(next) }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor: JSON.stringify(next), descricao: 'Taxas da Carona Solidária (motorista pra exibir, passageiro pra desbloquear contato)' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: next });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
