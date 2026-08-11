-- Caminho: C:\valente_conecta\supabase\migrations\009_push_subscriptions.sql
--
-- Fecha a lacuna apontada no VALENTE_CONECTA_MASTER_SPEC.md secao 6:
-- PushSubscriptionManager.tsx ja existia mas faltava o metodo
-- salvarPushSubscription no backend. Agora entra em uso real no fluxo de
-- notificacao de interesse do marketplace (ver 003_marketplace_interesse.sql
-- e MODULO_MARKETPLACE_MONETIZACAO.md secao 2, "Fluxo de notificacao").
--
-- Sem FK para usuarios: mesmo motivo documentado em 003_marketplace_interesse.sql
-- (login ainda nao implementado).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_escrita_publica" on push_subscriptions
  for all using (true) with check (true);

-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao de
-- 005_mototaxi.sql e 003_marketplace_interesse.sql. Apertar quando a
-- autenticacao existir.
