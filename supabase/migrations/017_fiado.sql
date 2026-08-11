-- Caminho: C:\valente_conecta\supabase\migrations\017_fiado.sql
--
-- Modulo de Fiado (credito ao cliente) — pedido do usuario do projeto:
-- modulo opcional, disponivel para qualquer lojista, liberado pelo admin
-- master sob solicitacao. Lojista lanca uma divida (produto/valor/
-- vencimento), sistema avisa o cliente por push com total+saldo+vencimento,
-- e reenvia lembrete perto do vencimento (ver 018_fiado_cron.sql /
-- app/api/fiado/cron/lembretes).
--
-- app/pdv/fiado/page.tsx ja existia com essa modelagem (cliente + divida +
-- pagamento) mas 100% mock (setTimeout, sem persistencia, sem push real).
-- Estas tabelas dao' backend real pra essa tela, agora escopada por loja
-- (dono_id) em vez de generica.

create table if not exists fiado_habilitacoes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null unique,
  ativo boolean not null default false,
  solicitado_em timestamptz not null default now(),
  liberado_em timestamptz,
  observacao text,
  updated_at timestamptz not null default now()
);

create table if not exists fiado_clientes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  nome text not null,
  telefone text not null,
  cliente_usuario_id uuid references usuarios(id) on delete set null, -- resolvido por telefone quando possivel, pra push funcionar
  limite_credito numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_fiado_clientes_dono on fiado_clientes(dono_id);

create table if not exists fiado_dividas (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  cliente_id uuid not null references fiado_clientes(id) on delete cascade,
  valor_total numeric(10,2) not null,
  valor_pago numeric(10,2) not null default 0,
  data_venda date not null default current_date,
  data_vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente','parcial','pago','vencido')),
  itens jsonb not null default '[]',
  observacoes text,
  lembrete_enviado_em date, -- evita mandar mais de um lembrete por dia
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fiado_dividas_dono on fiado_dividas(dono_id);
create index if not exists idx_fiado_dividas_cliente on fiado_dividas(cliente_id);
create index if not exists idx_fiado_dividas_vencimento on fiado_dividas(data_vencimento) where status in ('pendente','parcial');

create table if not exists fiado_pagamentos (
  id uuid primary key default gen_random_uuid(),
  divida_id uuid not null references fiado_dividas(id) on delete cascade,
  valor numeric(10,2) not null,
  metodo text not null default 'dinheiro' check (metodo in ('dinheiro','pix','cartao')),
  created_at timestamptz not null default now()
);

create index if not exists idx_fiado_pagamentos_divida on fiado_pagamentos(divida_id);

alter table fiado_habilitacoes enable row level security;
alter table fiado_clientes enable row level security;
alter table fiado_dividas enable row level security;
alter table fiado_pagamentos enable row level security;

-- Publico/temporario, mesmo padrao do resto do projeto (sem login ainda).
-- O "gate" de quem pode usar o modulo fica na CHECAGEM DE APLICACAO
-- (fiado_habilitacoes.ativo), nao em RLS — igual ao resto do admin-master,
-- que hoje so' e' protegido pelo cookie do middleware, nao por RLS.
create policy "fiado_habilitacoes_publica" on fiado_habilitacoes for all using (true) with check (true);
create policy "fiado_clientes_publica" on fiado_clientes for all using (true) with check (true);
create policy "fiado_dividas_publica" on fiado_dividas for all using (true) with check (true);
create policy "fiado_pagamentos_publica" on fiado_pagamentos for all using (true) with check (true);
