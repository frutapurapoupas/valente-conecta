-- Caminho: C:\valente_conecta\supabase\migrations\033_cidades_moeda_config.sql
--
-- Nome/prefixo da Moeda Conecta por cidade — pedido explicito: a moeda leva
-- o nome (ou parte do nome) da cidade base como prefixo, pre-sugerido pelo
-- sistema quando uma cidade nova entra no app, e aprovado/editado pelo
-- admin master antes de valer.

create table if not exists cidades_moeda_config (
  id uuid primary key default gen_random_uuid(),
  cidade text not null unique,
  moeda_nome text not null,
  moeda_prefixo text not null,
  aprovado boolean not null default false,
  aprovado_por uuid references usuarios(id),
  aprovado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cidades_moeda_config enable row level security;
create policy "cidades_moeda_config_publica" on cidades_moeda_config for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto.
