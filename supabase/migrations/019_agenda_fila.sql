-- Caminho: C:\valente_conecta\supabase\migrations\019_agenda_fila.sql
--
-- Modulo Agenda + Fila de Espera Virtual — pedido do usuario do projeto:
-- substitui fila fisica por fila virtual para qualquer servico do arquetipo
-- Agenda+Profissional (manicure, barbeiro, borracheiro, consultorio medico,
-- hospital etc), com:
--   - cliente escolhe profissional/horario e acompanha a fila em tempo real
--   - dono da loja cadastra funcionarios com PIN proprio (autenticacao
--     simples pra dispositivo compartilhado na recepcao — nao e' um sistema
--     de login completo, e' so' "quem esta' operando o painel agora")
--   - opcional por loja, liberado pelo admin master (gratis ou pago, a
--     criterio dele — ver campo `gratuito`)
--
-- PIN de funcionario e' hasheado com pgcrypto (ja' habilitado desde
-- 003_marketplace_interesse.sql) — sem precisar adicionar biblioteca nova
-- ao projeto so' pra isso.

create table if not exists agenda_habilitacoes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null unique,
  ativo boolean not null default false,
  gratuito boolean not null default true,
  solicitado_em timestamptz not null default now(),
  liberado_em timestamptz,
  observacao text,
  updated_at timestamptz not null default now()
);

create table if not exists agenda_profissionais (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  nome text not null,
  especialidade text,
  pin_hash text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_agenda_profissionais_dono on agenda_profissionais(dono_id);

-- Disponibilidade semanal recorrente (dia_semana: 0=domingo ... 6=sabado).
create table if not exists agenda_disponibilidade (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid not null references agenda_profissionais(id) on delete cascade,
  dia_semana integer not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  duracao_minutos integer not null default 30
);

create index if not exists idx_agenda_disponibilidade_prof on agenda_disponibilidade(profissional_id);

-- Um agendamento cobre tanto "marquei horario pra depois" (data/horario no
-- futuro) quanto "entrei na fila agora" (data = hoje, horario = agora) — a
-- posicao na fila e' calculada por ordem de chegada dentro do mesmo dia,
-- nao precisa de tabela separada pra isso.
create table if not exists agenda_agendamentos (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  profissional_id uuid not null references agenda_profissionais(id) on delete cascade,
  cliente_id uuid, -- id local do cliente (lib/usuarioLocal.ts), sem FK — mesmo padrao do resto do projeto
  cliente_nome text not null,
  cliente_telefone text not null,
  servico text,
  data date not null default current_date,
  horario time,
  senha_fila text not null, -- ex: "A014" — o numero/senha "ludico" que da confianca ao cliente
  status text not null default 'aguardando' check (status in ('aguardando','chamado','em_atendimento','atendido','cancelado','faltou')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agenda_agendamentos_prof_data on agenda_agendamentos(profissional_id, data);
create index if not exists idx_agenda_agendamentos_dono on agenda_agendamentos(dono_id);

alter table agenda_habilitacoes enable row level security;
alter table agenda_profissionais enable row level security;
alter table agenda_disponibilidade enable row level security;
alter table agenda_agendamentos enable row level security;

create policy "agenda_habilitacoes_publica" on agenda_habilitacoes for all using (true) with check (true);
-- profissionais: SEM select publico do pin_hash — leitura de nome/especialidade
-- passa por view sem a coluna sensivel (ver abaixo). Escrita liberada (mesmo
-- padrao temporario de sempre).
create policy "agenda_profissionais_escrita_publica" on agenda_profissionais for insert with check (true);
create policy "agenda_profissionais_atualizacao_publica" on agenda_profissionais for update using (true) with check (true);
create policy "agenda_disponibilidade_publica" on agenda_disponibilidade for all using (true) with check (true);
create policy "agenda_agendamentos_publica" on agenda_agendamentos for all using (true) with check (true);

-- View publica dos profissionais SEM pin_hash — e' o que a tela do cliente
-- e a listagem do dono usam pra nunca trafegar o hash pro navegador.
create or replace view agenda_profissionais_publico as
  select id, dono_id, nome, especialidade, ativo, created_at from agenda_profissionais;

grant select on agenda_profissionais_publico to anon, authenticated;

-- RPC: dono cadastra funcionario com PIN (hash feito aqui dentro, nunca em
-- texto puro fora do banco).
-- search_path inclui "extensions": no Supabase o pgcrypto (crypt/gen_salt)
-- fica instalado nesse schema, nao em "public".
create or replace function criar_funcionario_agenda(p_dono_id uuid, p_nome text, p_especialidade text, p_pin text)
returns table (id uuid, nome text, especialidade text)
language sql
security definer
set search_path = public, extensions
as $$
  insert into agenda_profissionais (dono_id, nome, especialidade, pin_hash)
  values (p_dono_id, p_nome, p_especialidade, crypt(p_pin, gen_salt('bf')))
  returning id, nome, especialidade;
$$;

-- RPC: login do funcionario no painel compartilhado — devolve dados basicos
-- se o PIN bater, nada se nao bater (sem vazar se o profissional existe).
create or replace function login_funcionario_agenda(p_profissional_id uuid, p_pin text)
returns table (id uuid, nome text, especialidade text, dono_id uuid)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nome, especialidade, dono_id
  from agenda_profissionais
  where id = p_profissional_id and ativo = true and pin_hash = crypt(p_pin, pin_hash);
$$;

-- RPC: gera a proxima senha do dia pra um profissional (ex: A001, A002...).
create or replace function proxima_senha_fila(p_profissional_id uuid, p_data date)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select 'A' || lpad((count(*) + 1)::text, 3, '0')
  from agenda_agendamentos
  where profissional_id = p_profissional_id and data = p_data;
$$;
