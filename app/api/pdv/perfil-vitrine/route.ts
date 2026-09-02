// Caminho: C:\valente_conecta\app\api\pdv\perfil-vitrine\route.ts
//
// Nome de exibição e endereço da loja, pedidos na hora de publicar o
// estoque na vitrine (não no cadastro geral do app — decisão com o dono
// do produto: cadastro geral fica só nome/whatsapp/cidade, esse perfil de
// fornecedor é específico de quem vai vender na vitrine pública).

import { NextRequest, NextResponse } from 'next/server';
import { obterPerfilFornecedor, salvarCamposPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const perfil = await obterPerfilFornecedor(usuarioId);
  return NextResponse.json({ success: true, data: perfil });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const nomeExibicao = String(body.nomeExibicao || '').trim();
    const endereco = String(body.endereco || '').trim();
    const categoriaNegocio = String(body.categoriaNegocio || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!nomeExibicao) return NextResponse.json({ success: false, error: 'Nome da loja é obrigatório' }, { status: 400 });
    if (!endereco) return NextResponse.json({ success: false, error: 'Endereço é obrigatório' }, { status: 400 });
    if (!categoriaNegocio) return NextResponse.json({ success: false, error: 'Categoria do negócio é obrigatória' }, { status: 400 });
    if (!body.aceitouLimitacaoResponsabilidade) {
      return NextResponse.json({ success: false, error: 'É preciso aceitar os Termos de Limitação de Responsabilidade' }, { status: 400 });
    }

    const data = await salvarCamposPerfilFornecedor(usuarioId, { nomeExibicao, endereco, categoriaNegocio });

    // aceitou_limitacao_responsabilidade_em nao passa pela RPC versionada
    // salvar_perfil_fornecedor_v4 (evita criar uma v5 so' pra esse campo) --
    // mesmo desvio ja usado em app/api/pdv/validacao-proprietario/route.ts:
    // update direto via createAdminClient (perfis_fornecedor nao tem policy
    // de update publica pra chave anon).
    await createAdminClient()
      .from('perfis_fornecedor')
      .update({ aceitou_limitacao_responsabilidade_em: new Date().toISOString() })
      .eq('usuario_id', usuarioId);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar perfil' }, { status: 500 });
  }
}
