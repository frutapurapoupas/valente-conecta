-- Caminho: C:\valente_conecta\supabase\migrations\092_plano_fisco_ativacao.sql
--
-- Fecha o loop do plano "Fisco / Contabilidade" (ja existe em
-- app/api/planos-config/route.ts, negociavel/sem preco fixo, manda o
-- lojista pro chat de suporte em vez do checkout normal) -- ate aqui nao
-- havia como o admin master ATIVAR a assinatura depois de negociar o valor
-- e o volume de notas no chat. Ver plano "Plano Fisco/Contabilidade --
-- fechar o loop de ativacao + gate no PDV".

-- Admin passa a poder registrar uma assinatura negociada manualmente
-- (preco combinado no chat de suporte, nao passa pelo checkout do Mercado Pago).
alter table assinaturas_planos drop constraint if exists assinaturas_planos_metodo_pagamento_check;
alter table assinaturas_planos add constraint assinaturas_planos_metodo_pagamento_check
  check (metodo_pagamento in ('pix', 'cartao', 'fiado', 'negociado'));

-- Estimativa de notas/mes combinada na contratacao -- referencia pro admin
-- escolher o plano certo do provedor de NFC-e depois (Focus NFe etc.).
alter table assinaturas_planos add column if not exists notas_mensais_estimadas integer;
