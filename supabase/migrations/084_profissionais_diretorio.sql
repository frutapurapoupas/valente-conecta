-- Caminho: C:\valente_conecta\supabase\migrations\084_profissionais_diretorio.sql
--
-- Diretorio publico de profissionais autonomos (manicure, eletricista,
-- pedreiro etc — nao confundir com agenda_profissionais, que e' o modulo
-- de fila virtual com PIN pra loja fisica, ver 019_agenda_fila.sql).
--
-- Nome da tabela e' "profissionais_diretorio" (nao "profissionais") porque
-- ja existe uma tabela "profissionais" no banco, criada fora das migrations
-- do projeto (sem nenhuma referencia no codigo), com schema incompativel
-- (id integer, so' nome/categoria/telefone/endereco/status/avaliacao,
-- 3 linhas) — nao mexemos nela pra nao arriscar dado de outra origem.
--
-- app/api/profissionais/route.ts e app/api/profissionais/agendamentos/route.ts
-- gravavam isso num arquivo JSON local (data/profissionais.json), que nao
-- persiste em runtime serverless (Vercel): toda escrita (cadastro, edicao,
-- agendamento) falhava com 500 em producao — mesmo padrao de bug ja
-- corrigido em app/api/cozinha/cardapio e app/api/upload/*. Schema abaixo
-- espelha os campos que a rota antiga ja usava.

create table if not exists profissionais_diretorio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  foto text,
  categoria text not null,
  especialidades text[] not null default '{}',
  descricao text,
  experiencia integer not null default 0,
  bairro text,
  cidade text not null default 'Valente',
  telefone text not null,
  whatsapp text,
  preco_hora numeric(12,2) not null default 0,
  preco_servico numeric(12,2) not null default 0,
  disponibilidade text,
  plano text not null default 'basico',
  status text not null default 'pendente' check (status in ('pendente', 'publicado')),
  avaliacao numeric(3,2) not null default 0,
  total_avaliacoes integer not null default 0,
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profissionais_diretorio_categoria on profissionais_diretorio(categoria);
create index if not exists idx_profissionais_diretorio_status on profissionais_diretorio(status);

create table if not exists profissionais_diretorio_agendamentos (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references profissionais_diretorio(id) on delete cascade,
  profissional_nome text not null default '',
  cliente_nome text not null,
  cliente_telefone text not null,
  servico text not null,
  data date not null,
  horario text,
  observacoes text,
  valor_estimado numeric(12,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'confirmado', 'cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profissionais_diretorio_agendamentos_prof on profissionais_diretorio_agendamentos(profissional_id);

alter table profissionais_diretorio enable row level security;
alter table profissionais_diretorio_agendamentos enable row level security;

-- Politica temporaria (sem login), mesmo padrao do resto do projeto ate a
-- autenticacao existir de verdade.
create policy "profissionais_diretorio_publica" on profissionais_diretorio for all using (true) with check (true);
create policy "profissionais_diretorio_agendamentos_publica" on profissionais_diretorio_agendamentos for all using (true) with check (true);
