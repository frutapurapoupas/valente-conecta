-- Caminho: C:\valente_conecta\supabase\migrations\072_pdv_funcionarios.sql
--
-- PDV multi-maquina: login de operador interno (funcionario) por PIN,
-- com permissoes configuraveis pelo dono da loja. E' uma camada POR CIMA
-- da identidade principal da loja (usuarios.id, ja usado em todo lugar do
-- PDV) -- nao substitui usuario_id em nenhuma tabela existente, so'
-- adiciona "quem operou" como rastro opcional em vendas/lancamentos.
--
-- Mesmo padrao ja usado em agenda_profissionais/login_funcionario_agenda
-- (019_agenda_fila.sql): PIN com hash pgcrypto (crypt/gen_salt('bf')),
-- feito dentro do banco via RPC, view publica sem a coluna do hash.

create table if not exists pdv_funcionarios (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null references usuarios(id),
  nome text not null,
  pin_hash text not null,
  permissoes jsonb not null default '{}'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pdv_funcionarios_dono on pdv_funcionarios(dono_id);

alter table pdv_funcionarios enable row level security;

create policy "pdv_funcionarios_escrita_publica" on pdv_funcionarios for insert with check (true);
create policy "pdv_funcionarios_atualizacao_publica" on pdv_funcionarios for update using (true) with check (true);
-- SEM policy de select na tabela crua (tem pin_hash) -- leitura so' pela
-- view abaixo, mesmo padrao de agenda_profissionais_publico.

create or replace view pdv_funcionarios_publico as
  select id, dono_id, nome, permissoes, ativo, created_at from pdv_funcionarios;

grant select on pdv_funcionarios_publico to anon, authenticated;

-- RPC: dono cadastra funcionario com PIN (hash feito aqui dentro, nunca
-- em texto puro fora do banco). search_path inclui "extensions": no
-- Supabase o pgcrypto (crypt/gen_salt) fica instalado nesse schema.
create or replace function criar_funcionario_pdv(p_dono_id uuid, p_nome text, p_pin text, p_permissoes jsonb)
returns table (id uuid, nome text, permissoes jsonb)
language sql
security definer
set search_path = public, extensions
as $$
  insert into pdv_funcionarios (dono_id, nome, pin_hash, permissoes)
  values (p_dono_id, p_nome, crypt(p_pin, gen_salt('bf')), coalesce(p_permissoes, '{}'::jsonb))
  returning id, nome, permissoes;
$$;

-- RPC: login do operador no terminal -- devolve dados se o PIN bater,
-- nada se nao bater (sem vazar se o funcionario existe).
create or replace function login_funcionario_pdv(p_funcionario_id uuid, p_pin text)
returns table (id uuid, nome text, dono_id uuid, permissoes jsonb)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nome, dono_id, permissoes
  from pdv_funcionarios
  where id = p_funcionario_id and ativo = true and pin_hash = crypt(p_pin, pin_hash);
$$;

-- RPC: dono redefine o PIN de um funcionario existente.
create or replace function redefinir_pin_funcionario_pdv(p_funcionario_id uuid, p_pin text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update pdv_funcionarios set pin_hash = crypt(p_pin, gen_salt('bf')), updated_at = now()
  where id = p_funcionario_id;
$$;

-- Rastro de quem vendeu/lancou -- nullable, nao quebra nada existente.
alter table pdv_vendas add column if not exists funcionario_id uuid references pdv_funcionarios(id);
alter table pdv_caixa_lancamentos add column if not exists funcionario_id uuid references pdv_funcionarios(id);
