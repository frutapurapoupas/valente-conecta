-- Caminho sugerido: C:\valente_conecta\supabase\migrations\005_mototaxi.sql

-- ============================================================
-- 1. Motoristas
-- ============================================================
create table if not exists mototaxi_motoristas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete set null, -- null ate existir login
  nome text not null,
  telefone text not null,
  foto_url text,
  veiculo text not null,
  placa text not null,
  avaliacao numeric not null default 5,
  plano text not null default 'gratis' check (plano in ('gratis','basico','premium')),
  online boolean not null default false,
  latitude double precision,
  longitude double precision,
  cnh_numero text not null,
  cnh_valida boolean not null default false,
  documento_veiculo_ok boolean not null default false,
  licenciamento_vencimento date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mototaxi_motoristas_online on mototaxi_motoristas(online);

-- ============================================================
-- 2. Corridas
-- ============================================================
create table if not exists mototaxi_corridas (
  id uuid primary key default gen_random_uuid(),
  passageiro_id uuid, -- referencia usuarios(id) quando login existir; por ora texto/uuid livre
  passageiro_nome text not null,
  passageiro_plano text not null default 'gratis',

  motorista_id uuid references mototaxi_motoristas(id) on delete set null,

  origem text not null,
  destino text not null,
  origem_lat double precision not null,
  origem_lng double precision not null,
  destino_lat double precision not null,
  destino_lng double precision not null,
  motorista_lat double precision,
  motorista_lng double precision,

  preco numeric not null,
  metodo_pagamento text not null default 'pix',
  status_pagamento text not null default 'pendente' check (status_pagamento in ('pendente','confirmado')),

  -- 'aguardando_motorista' = pedido feito, esperando algum motorista aceitar
  -- 'aceita' = motorista aceitou, ainda nao iniciou deslocamento ate o passageiro
  -- 'em_andamento' = corrida em curso apos embarque
  -- 'concluida' / 'cancelada'
  status text not null default 'aguardando_motorista'
    check (status in ('aguardando_motorista','aceita','em_andamento','concluida','cancelada')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mototaxi_corridas_status on mototaxi_corridas(status);
create index if not exists idx_mototaxi_corridas_motorista on mototaxi_corridas(motorista_id);
create index if not exists idx_mototaxi_corridas_passageiro on mototaxi_corridas(passageiro_id);

-- ============================================================
-- 3. Configuração de anúncios (popup para passageiros sem plano)
-- ============================================================
create table if not exists mototaxi_ads_config (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default true,
  show_to_free_passengers_only boolean not null default true,
  cooldown_minutes integer not null default 30,
  popup_title text not null default 'Destrave vantagens no Moto Taxi',
  popup_message text,
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

insert into mototaxi_ads_config (enabled, show_to_free_passengers_only, popup_title, popup_message, items)
select true, true, 'Destrave vantagens no Moto Taxi', 'Assine e evite pop-ups durante as corridas.', '[]'
where not exists (select 1 from mototaxi_ads_config);

-- ============================================================
-- Realtime — habilita atualização ao vivo (corridas e localização do motorista)
-- ============================================================
alter publication supabase_realtime add table mototaxi_corridas;
alter publication supabase_realtime add table mototaxi_motoristas;

-- ============================================================
-- RLS básico (ajustar quando o login for implementado, hoje fica permissivo)
-- ============================================================
alter table mototaxi_motoristas enable row level security;
alter table mototaxi_corridas enable row level security;
alter table mototaxi_ads_config enable row level security;

create policy "mototaxi_motoristas_leitura_publica" on mototaxi_motoristas
  for select using (true);

create policy "mototaxi_corridas_leitura_publica" on mototaxi_corridas
  for select using (true);

create policy "mototaxi_corridas_insercao_publica" on mototaxi_corridas
  for insert with check (true);

create policy "mototaxi_corridas_atualizacao_publica" on mototaxi_corridas
  for update using (true);

create policy "mototaxi_ads_leitura_publica" on mototaxi_ads_config
  for select using (true);

-- NOTA DE SEGURANÇA: as políticas de "insercao/atualizacao publica" são
-- temporárias, para funcionar enquanto não existe autenticação. Quando o
-- login for implementado (etapa final do lançamento), substituir por
-- políticas restritas a auth.uid() = passageiro_id / motorista_id.
