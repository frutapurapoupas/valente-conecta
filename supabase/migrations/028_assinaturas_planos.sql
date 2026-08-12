-- Caminho: C:\valente_conecta\supabase\migrations\028_assinaturas_planos.sql
--
-- Usuario escolhe um plano (ver app/api/planos-config/route.ts pros planos
-- e servicos ja configurados), paga, e so' depois preenche os dados
-- complementares do negocio. status:
--   pendente_pagamento -> aguardando confirmacao do Mercado Pago (pix/cartao)
--   fiado_pendente      -> escolheu fiado, admin master acompanha manualmente
--   pago                -> Mercado Pago confirmou (webhook); falta dados complementares
--   ativo                -> dados complementares preenchidos, assinatura em uso
--   recusado / cancelado -> nao seguiu adiante
--
-- usuario_local_id (opcional) permite avisar pelo chat de suporte
-- (mensagens_chat.usuario_id usa o id anonimo do navegador, ver
-- 025_mensagens_chat.sql), mesmo padrao ja usado em usuario_cidades_adicionais.

create table if not exists assinaturas_planos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  usuario_local_id uuid,
  servico_id text not null,
  plano_id text not null,
  com_fiado boolean not null default false,
  metodo_pagamento text not null check (metodo_pagamento in ('pix', 'cartao', 'fiado')),
  parcelas integer not null default 1,
  valor numeric(12,2) not null default 0,
  status text not null default 'pendente_pagamento'
    check (status in ('pendente_pagamento', 'fiado_pendente', 'pago', 'ativo', 'recusado', 'cancelado')),
  mp_preference_id text,
  mp_payment_id text,
  dados_complementares jsonb,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_assinaturas_planos_usuario on assinaturas_planos(usuario_id);
create index if not exists idx_assinaturas_planos_status on assinaturas_planos(status);
create index if not exists idx_assinaturas_planos_mp_preference on assinaturas_planos(mp_preference_id);

alter table assinaturas_planos enable row level security;
create policy "assinaturas_planos_publica" on assinaturas_planos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto ate a autenticacao existir.
