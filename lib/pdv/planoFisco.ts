// Caminho: C:\valente_conecta\lib\pdv\planoFisco.ts
//
// Verifica se o lojista tem o plano Fisco/Contabilidade ativo -- unico
// pre-requisito pra emissao de nota fiscal automatica no futuro (ver
// 092_plano_fisco_ativacao.sql e app/api/admin-master/assinaturas-planos/route.ts
// POST, que e' quem ativa depois da negociacao no chat de suporte).

import { createClient } from '@/lib/supabase/server';

export interface StatusPlanoFisco {
  ativo: boolean;
  valor: number | null;
  notasMensaisEstimadas: number | null;
}

export async function obterPlanoFisco(usuarioId: string): Promise<StatusPlanoFisco> {
  const supabase = createClient();
  const { data } = await supabase
    .from('assinaturas_planos')
    .select('valor, notas_mensais_estimadas')
    .eq('usuario_id', usuarioId)
    .eq('plano_id', 'fisco')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { ativo: false, valor: null, notasMensaisEstimadas: null };
  return {
    ativo: true,
    valor: data.valor != null ? Number(data.valor) : null,
    notasMensaisEstimadas: data.notas_mensais_estimadas ?? null,
  };
}
