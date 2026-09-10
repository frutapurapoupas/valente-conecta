-- Caminho: supabase/migrations/106_fila_saude.sql
--
-- Fila Virtual de Saude (ver proposta "Modo Valente Facil", item 5) --
-- primeira fatia: cadastro de unidade + equipe com nivel de acesso + fila
-- do dia com prioridade legal (Lei 10.048/2000, atualizada pela Lei
-- 14.626/2023, e Estatuto do Idoso -- superprioridade 80+). NAO inclui
-- nesta fatia: prontuario, agendamento eletivo, pagamento, paineis de TV
-- -- ficam pra uma proxima rodada, documentado a parte.

create table if not exists unidades_saude (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('hospital', 'clinica', 'laboratorio')),
  regime text not null default 'sus' check (regime in ('sus', 'particular', 'hibrido')),
  endereco text,
  cidade text not null default 'Valente',
  ativo boolean not null default true,
  criado_por uuid references usuarios(id),
  created_at timestamptz not null default now()
);

-- Nivel de acesso por unidade (concedido pelo diretor -- na v1, o
-- primeiro 'administrar' de cada unidade e' definido pelo admin master no
-- cadastro, ja que ainda nao existe um fluxo de auto-cadastro de unidade).
create table if not exists unidade_saude_equipe (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references unidades_saude(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  nivel text not null check (nivel in ('administrar', 'atender', 'ler', 'imprimir')),
  convidado_por uuid references usuarios(id),
  created_at timestamptz not null default now(),
  unique (unidade_id, usuario_id)
);
create index if not exists idx_unidade_saude_equipe_unidade on unidade_saude_equipe(unidade_id);
create index if not exists idx_unidade_saude_equipe_usuario on unidade_saude_equipe(usuario_id);

create table if not exists unidade_saude_servicos (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references unidades_saude(id) on delete cascade,
  nome text not null,
  tipo text not null default 'consulta' check (tipo in ('consulta', 'exame')),
  preco numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_unidade_saude_servicos_unidade on unidade_saude_servicos(unidade_id);

create table if not exists fila_saude_profissionais (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references unidades_saude(id) on delete cascade,
  usuario_id uuid references usuarios(id),
  nome text not null,
  especialidade text,
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_fila_saude_profissionais_unidade on fila_saude_profissionais(unidade_id);

-- prioridade_tier: 1 = idoso 80+ (superprioridade), 2 = demais
-- prioridades legais (idoso 60-79, gestante, lactante, pessoa com crianca
-- de colo, PCD, autista, obesidade), 3 = ampla concorrencia. A fila
-- exibida e' sempre ORDER BY prioridade_tier, created_at -- nunca so'
-- created_at.
create table if not exists fila_saude_senhas (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null references unidades_saude(id) on delete cascade,
  usuario_id uuid references usuarios(id),
  nome_avulso text, -- walk-in sem cadastro/sem app
  numero integer not null,
  origem text not null default 'app' check (origem in ('app', 'walkin')),
  prioridade_tier smallint not null default 3 check (prioridade_tier in (1, 2, 3)),
  motivo_prioridade text,
  status text not null default 'aguardando' check (status in ('aguardando', 'presente', 'em_atendimento', 'concluido', 'cancelado')),
  servico_id uuid references unidade_saude_servicos(id),
  profissional_id uuid references fila_saude_profissionais(id),
  pre_triagem jsonb,
  registrado_por uuid references usuarios(id), -- preenchido so' em walk-in (atendente que lancou)
  aviso_reordenacao boolean not null default false, -- avisa (dentro do app) quem foi empurrado por uma prioridade que chegou sem avisar
  created_at timestamptz not null default now(),
  chamado_em timestamptz,
  concluido_em timestamptz
);
create index if not exists idx_fila_saude_senhas_unidade_status on fila_saude_senhas(unidade_id, status);
create index if not exists idx_fila_saude_senhas_usuario on fila_saude_senhas(usuario_id);
