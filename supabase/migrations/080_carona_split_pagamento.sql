-- Caminho: C:\valente_conecta\supabase\migrations\080_carona_split_pagamento.sql
--
-- Split de pagamento de verdade na Carona Solidaria: o motorista conecta a
-- propria conta Mercado Pago (OAuth), e o passageiro passa a poder pagar a
-- vaga em dinheiro pelo app -- o valor cai direto na conta do motorista,
-- com a taxa da plataforma (5% cliente + 5% motorista, isentos com plano
-- pago -- mesma mototaxi_taxa_config) descontada automaticamente pelo
-- Mercado Pago (parametro marketplace_fee). Ver
-- app/api/carona/motorista/mercadopago/*.
--
-- Motorista sem conta conectada continua no modelo antigo (taxa fixa de
-- listagem + acerto direto fora do app) -- essa migration NAO remove nada
-- do que ja existe.

alter table carona_motoristas add column if not exists mp_access_token text;
alter table carona_motoristas add column if not exists mp_refresh_token text;
alter table carona_motoristas add column if not exists mp_user_id text;
alter table carona_motoristas add column if not exists mp_public_key text;
alter table carona_motoristas add column if not exists mp_conectado_em timestamptz;

-- Reserva de vaga(s) com pagamento pelo app -- quando paga, substitui a
-- necessidade do desbloqueio avulso (ver carona_desbloqueios): quem pagou a
-- vaga ja fica com o contato liberado.
create table if not exists carona_reservas (
  id uuid primary key default gen_random_uuid(),
  viagem_id uuid not null references carona_viagens(id) on delete cascade,
  usuario_id uuid not null references usuarios(id),
  vagas integer not null default 1 check (vagas > 0),
  valor_total numeric(12,2) not null,
  taxa_cliente numeric(12,2) not null default 0,
  taxa_motorista numeric(12,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_carona_reservas_viagem on carona_reservas(viagem_id);
create index if not exists idx_carona_reservas_usuario on carona_reservas(usuario_id);
create index if not exists idx_carona_reservas_mp_preference on carona_reservas(mp_preference_id);

alter table carona_reservas enable row level security;
create policy "carona_reservas_publica" on carona_reservas for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real completo), mesmo
-- padrao do resto do projeto.

alter publication supabase_realtime add table carona_reservas;

-- Config compartilhada com a taxa do Moto Taxi (mesmo principio de 5%/5%),
-- so' que com chave propria pra poder ajustar os percentuais da carona sem
-- afetar o moto-taxi.
insert into admin_configuracoes (chave, valor, descricao)
select
  'carona_taxa_split_config',
  '{"taxaPercentualCliente": 5, "taxaPercentualMotorista": 5}',
  'Taxa de uso da plataforma na Carona Solidaria quando o motorista tem conta Mercado Pago conectada (% cobrado de cada lado sobre o valor da vaga, isentos com plano pago)'
where not exists (select 1 from admin_configuracoes where chave = 'carona_taxa_split_config');
