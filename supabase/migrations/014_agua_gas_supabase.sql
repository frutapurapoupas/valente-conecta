-- Caminho: C:\valente_conecta\supabase\migrations\014_agua_gas_supabase.sql
--
-- Migra o modulo Agua e Gas de arquivos JSON locais (data/agua_gas_*.json,
-- via app/api/agua-gas/route.ts) para tabelas reais no Supabase. O motivo
-- nao e' so' organizacao: escrita em arquivo local nao sobrevive a runtime
-- serverless (Vercel) — cada instancia tem seu proprio filesystem efemero.
--
-- Trata o fornecedor como empresa mesmo: catalogo de produtos (jsonb, mesmo
-- formato que a tela ja usa), pedidos com status, e pagamentos ligados a
-- tabela generica `pagamentos` (003_marketplace_interesse.sql) para o admin
-- master enxergar as movimentacoes financeiras completas do modulo.

create table if not exists agua_gas_fornecedores (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid references usuarios(id) on delete set null,
  nome text not null,
  responsavel text,
  telefone text not null,
  whatsapp text,
  bairro text,
  cidade text not null default 'Valente',
  descricao text,
  foto text,
  horario text,
  tem_entrega boolean not null default true,
  taxa_entrega numeric(10,2) not null default 0,
  frete_gratis_acima numeric(10,2) not null default 0,
  produtos jsonb not null default '[]', -- [{tipo, descricao, preco, unidade, disponivel}]
  status text not null default 'pendente' check (status in ('pendente','publicado')),
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agua_gas_fornecedores_status on agua_gas_fornecedores(status);
create index if not exists idx_agua_gas_fornecedores_dono on agua_gas_fornecedores(dono_id);

create table if not exists agua_gas_pedidos (
  id uuid primary key default gen_random_uuid(),
  fornecedor_id uuid not null references agua_gas_fornecedores(id) on delete cascade,
  fornecedor_nome text,
  cliente_id uuid references usuarios(id) on delete set null,
  cliente_nome text not null,
  cliente_telefone text not null,
  produto text not null,
  quantidade integer not null default 1,
  valor_total numeric(10,2),
  endereco text,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente','confirmado','cancelado','entregue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agua_gas_pedidos_fornecedor on agua_gas_pedidos(fornecedor_id);
create index if not exists idx_agua_gas_pedidos_status on agua_gas_pedidos(status);
create index if not exists idx_agua_gas_pedidos_created on agua_gas_pedidos(created_at desc);

-- 'pedido' entra como novo tipo de origem em pagamentos (tabela generica do
-- ecossistema financeiro, ja usada por interesses/assinaturas) — reaproveita
-- para qualquer modulo baseado em pedido, nao so' agua-gas.
alter table pagamentos drop constraint if exists pagamentos_origem_check;
alter table pagamentos add constraint pagamentos_origem_check
  check (origem in ('interesse_comprador','interesse_fornecedor','assinatura','bonus_indicacao','pedido'));

alter table agua_gas_fornecedores enable row level security;
alter table agua_gas_pedidos enable row level security;

create policy "agua_gas_fornecedores_leitura_publica" on agua_gas_fornecedores
  for select using (true);
create policy "agua_gas_fornecedores_escrita_publica" on agua_gas_fornecedores
  for all using (true) with check (true);

create policy "agua_gas_pedidos_leitura_publica" on agua_gas_pedidos
  for select using (true);
create policy "agua_gas_pedidos_escrita_publica" on agua_gas_pedidos
  for all using (true) with check (true);

-- NOTA DE SEGURANCA: policies publicas temporarias (sem login), mesmo padrao
-- do resto do projeto. Apertar quando a autenticacao existir.
