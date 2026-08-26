-- Caminho: C:\valente_conecta\supabase\migrations\081_agua_gas_pedido_expresso.sql
--
-- Pedido expresso de Agua e Gas: cliente aperta o botao Agua/Gas, escolhe
-- fornecedor numa lista curta (mais proximos), define a quantidade e paga.
-- Pagamento online usa split automatico via Mercado Pago (mesmo padrao da
-- Carona Solidaria, ver 080_carona_split_pagamento.sql): fornecedor conecta
-- a propria conta, o app desconta 1%+1% via marketplace_fee. Pagamento em
-- dinheiro fica sem MP nenhum -- vira divida da taxa de uso (1% cliente +
-- 1% fornecedor, isentos com plano pago), cobrada com push imediato e
-- lembretes diarios (ver app/api/agua-gas/cron/lembretes-taxa/route.ts).
--
-- Tambem adiciona cadastro estruturado de horario/24h/precos padrao pro
-- fornecedor (ver app/agua-gas/fornecedor/page.tsx).

alter table agua_gas_fornecedores add column if not exists atendimento_24h boolean not null default false;
alter table agua_gas_fornecedores add column if not exists dias_funcionamento jsonb;
alter table agua_gas_fornecedores add column if not exists mp_access_token text;
alter table agua_gas_fornecedores add column if not exists mp_refresh_token text;
alter table agua_gas_fornecedores add column if not exists mp_user_id text;
alter table agua_gas_fornecedores add column if not exists mp_public_key text;
alter table agua_gas_fornecedores add column if not exists mp_conectado_em timestamptz;
alter table agua_gas_fornecedores add column if not exists preco_agua_padrao numeric(12,2);
alter table agua_gas_fornecedores add column if not exists descricao_agua_padrao text;
alter table agua_gas_fornecedores add column if not exists preco_gas_padrao numeric(12,2);
alter table agua_gas_fornecedores add column if not exists descricao_gas_padrao text;

alter table agua_gas_pedidos add column if not exists origem text not null default 'whatsapp' check (origem in ('whatsapp', 'expresso'));
alter table agua_gas_pedidos add column if not exists categoria text check (categoria in ('agua', 'gas'));
alter table agua_gas_pedidos add column if not exists pagamento_status text not null default 'nao_aplicavel' check (pagamento_status in ('nao_aplicavel', 'aguardando_pagamento', 'pago_online', 'combinado_dinheiro'));
alter table agua_gas_pedidos add column if not exists mp_preference_id text;
alter table agua_gas_pedidos add column if not exists mp_payment_id text;

create table if not exists agua_gas_taxas_uso (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references agua_gas_pedidos(id) on delete cascade,
  papel text not null check (papel in ('cliente', 'fornecedor')),
  usuario_id uuid references usuarios(id),
  telefone text,
  valor numeric(12,2) not null default 0,
  percentual_aplicado numeric(5,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'isento')),
  pago_via text,
  mp_preference_id text,
  mp_payment_id text,
  lembrete_enviado_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agua_gas_taxas_uso_pedido on agua_gas_taxas_uso(pedido_id);
create index if not exists idx_agua_gas_taxas_uso_usuario on agua_gas_taxas_uso(usuario_id);

alter table agua_gas_taxas_uso enable row level security;
create policy "agua_gas_taxas_uso_publica" on agua_gas_taxas_uso for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real completo), mesmo
-- padrao do resto do projeto.

alter publication supabase_realtime add table agua_gas_taxas_uso;

insert into admin_configuracoes (chave, valor, descricao)
select
  'agua_gas_taxa_config',
  '{"taxaPercentualCliente": 1, "taxaPercentualFornecedor": 1}',
  'Taxa de uso da plataforma no pedido expresso de Agua e Gas (% cobrado de cada lado quando o pagamento e combinado em dinheiro, isentos com plano pago)'
where not exists (select 1 from admin_configuracoes where chave = 'agua_gas_taxa_config');
