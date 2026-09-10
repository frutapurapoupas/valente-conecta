-- Caminho: supabase/migrations/108_fila_saude_prontuario.sql
--
-- Prontuario da Fila Virtual de Saude (ver proposta "Modo Valente Facil",
-- item 5) -- guardado pra sempre por padrao, a criterio do diretor da
-- unidade (unidade_saude_config.retencao_prontuario). So' o que a equipe
-- da unidade (nivel 'administrar' ou 'atender') ou o proprio paciente
-- podem ver -- checagem feita no codigo da API (lib/saude/nivelAcesso.ts),
-- nao ha' campo clinico obrigatorio, so' o que for de fato registrado.

create table if not exists prontuarios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade, -- paciente
  unidade_id uuid not null references unidades_saude(id) on delete cascade,
  senha_id uuid references fila_saude_senhas(id),
  tipo text not null check (tipo in ('historico', 'fixo', 'exame')),
  titulo text not null,
  conteudo text,
  anexo_url text,
  criado_por uuid references usuarios(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_prontuarios_usuario on prontuarios(usuario_id, unidade_id);

create table if not exists unidade_saude_config (
  unidade_id uuid primary key references unidades_saude(id) on delete cascade,
  retencao_prontuario text not null default 'permanente' check (retencao_prontuario in ('permanente', 'x_anos')),
  anos_retencao integer,
  comissao_pagamento_dinheiro_pct numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table prontuarios enable row level security;
alter table unidade_saude_config enable row level security;
create policy "prontuarios_publica" on prontuarios for all using (true) with check (true);
create policy "unidade_saude_config_publica" on unidade_saude_config for all using (true) with check (true);
