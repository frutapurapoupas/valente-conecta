// Caminho: C:\valente_conecta\app\api\admin-master\comunicados\sugerir\route.ts
//
// "Inteligencia do sistema" sugerindo comunicados — nao e' um modelo de
// linguagem generativo (esse projeto nao tem chave de API de IA
// configurada, e decidir contratar uma nao e' algo pra presumir aqui).
// Em vez disso, monta rascunhos reais a partir de sinais que ja existem no
// banco (itens novos no catalogo, cadastros da semana, cidade nova com
// moeda aprovada) — sempre nasce como 'rascunho', so' vira visivel na home
// depois que o admin master aprovar em /admin-master/configuracoes/comunicados.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LABEL_MODULO } from '@/lib/catalogo/marketplaceTypes';

export async function POST() {
  try {
    const supabase = createClient();
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sugestoes: { titulo: string; mensagem: string }[] = [];

    const { data: itensRecentes } = await supabase
      .from('catalogo_itens')
      .select('modulo')
      .eq('status', 'ativo')
      .gte('created_at', seteDiasAtras);
    const porModulo = new Map<string, number>();
    for (const item of itensRecentes || []) {
      porModulo.set(item.modulo, (porModulo.get(item.modulo) || 0) + 1);
    }
    const [moduloTop] = Array.from(porModulo.entries()).sort((a, b) => b[1] - a[1]);
    if (moduloTop) {
      const [modulo, total] = moduloTop;
      const label = (LABEL_MODULO as Record<string, string>)[modulo] || modulo;
      sugestoes.push({
        titulo: `Novidades em ${label}!`,
        mensagem: `${total} novo${total > 1 ? 's' : ''} anúncio${total > 1 ? 's' : ''} em ${label} essa semana. Dá uma olhada!`,
      });
    }

    const { count: novosUsuarios } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', seteDiasAtras);
    if (novosUsuarios && novosUsuarios > 0) {
      sugestoes.push({
        titulo: 'Comunidade crescendo!',
        mensagem: `${novosUsuarios} nov${novosUsuarios > 1 ? 'os' : 'o'} usuário${novosUsuarios > 1 ? 's' : ''} se cadastrou no Valente Conecta essa semana.`,
      });
    }

    const { data: cidadesAprovadas } = await supabase
      .from('cidades_moeda_config')
      .select('cidade, moeda_nome, aprovado_em')
      .eq('aprovado', true)
      .gte('aprovado_em', seteDiasAtras);
    for (const c of cidadesAprovadas || []) {
      sugestoes.push({
        titulo: `${c.moeda_nome} chegou em ${c.cidade}!`,
        mensagem: `Agora ${c.cidade} já tem sua própria Moeda Conecta: ${c.moeda_nome}. Confira na Carteira.`,
      });
    }

    if (sugestoes.length === 0) {
      return NextResponse.json({ success: true, data: [], mensagem: 'Sem sinais novos essa semana pra sugerir comunicado.' });
    }

    const { data, error } = await supabase
      .from('comunicados')
      .insert(sugestoes.map((s) => ({ titulo: s.titulo, mensagem: s.mensagem, origem: 'ia', status: 'rascunho' })))
      .select('*');
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao gerar sugestões' }, { status: 500 });
  }
}
