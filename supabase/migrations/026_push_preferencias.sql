-- Caminho: C:\valente_conecta\supabase\migrations\026_push_preferencias.sql
--
-- Segmentacao de push: cada inscricao (push_subscriptions) passa a guardar
-- a cidade e os grupos de interesse que o proprio usuario escolheu (ver
-- components/PushSubscriptionManager.tsx). Isso permite ao admin master
-- mandar aviso geral, so' pra quem interessa (ex: "Construcao" em "Valente"),
-- ou individual (ja coberto pelo chat, que dispara push por conversa).

alter table push_subscriptions
  add column if not exists cidade text,
  add column if not exists grupos_interesse text[] not null default '{}';

create index if not exists idx_push_subscriptions_cidade on push_subscriptions(cidade);
create index if not exists idx_push_subscriptions_grupos on push_subscriptions using gin (grupos_interesse);
