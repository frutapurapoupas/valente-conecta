-- Caminho: C:\valente_conecta\supabase\migrations\052_agua_gas_entregadores_pagamento.sql
--
-- Amplia o modulo Agua e Gas (014_agua_gas_supabase.sql) pra suportar:
--   1. Localizacao do fornecedor (calcular proximidade/distancia no cliente)
--   2. Formas de pagamento aceitas por fornecedor, incluindo fiado e
--      vale-gas/beneficio do governo — nem todo fornecedor aceita esse
--      ultimo, entao o cliente precisa ver isso por fornecedor antes de
--      escolher, nao so' depois de pedir.
--   3. Entregadores vinculados ao fornecedor, com localizacao ao vivo —
--      mesmo padrao ja usado em mototaxi_motoristas (005_mototaxi.sql), pra
--      o cliente acompanhar a entrega no mapa.

alter table agua_gas_fornecedores
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists aceita_dinheiro boolean not null default true,
  add column if not exists aceita_cartao boolean not null default false,
  add column if not exists aceita_pix boolean not null default false,
  add column if not exists aceita_vale_gas boolean not null default false,
  add column if not exists aceita_fiado boolean not null default false;

create table if not exists agua_gas_entregadores (
  id uuid primary key default gen_random_uuid(),
  fornecedor_id uuid not null references agua_gas_fornecedores(id) on delete cascade,
  nome text not null,
  telefone text not null,
  foto_url text,
  veiculo text,
  ativo boolean not null default true,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agua_gas_entregadores_fornecedor on agua_gas_entregadores(fornecedor_id);

alter table agua_gas_pedidos
  add column if not exists entregador_id uuid references agua_gas_entregadores(id) on delete set null,
  add column if not exists forma_pagamento text;

alter table agua_gas_pedidos drop constraint if exists agua_gas_pedidos_status_check;
alter table agua_gas_pedidos add constraint agua_gas_pedidos_status_check
  check (status in ('pendente','confirmado','em_entrega','cancelado','entregue'));

alter publication supabase_realtime add table agua_gas_pedidos;
alter publication supabase_realtime add table agua_gas_entregadores;

alter table agua_gas_entregadores enable row level security;
create policy "agua_gas_entregadores_leitura_publica" on agua_gas_entregadores
  for select using (true);
create policy "agua_gas_entregadores_escrita_publica" on agua_gas_entregadores
  for all using (true) with check (true);

-- NOTA DE SEGURANCA: policy publica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir.
