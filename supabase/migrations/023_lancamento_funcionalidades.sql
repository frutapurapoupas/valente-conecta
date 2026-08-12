-- Caminho: C:\valente_conecta\supabase\migrations\023_lancamento_funcionalidades.sql
--
-- Cards de funcionalidades da tela /lancamento — cada um com um video
-- curto explicando um grupo de funcionalidades especifico do app. Admin
-- master edita titulo e video de cada um (ver
-- app/admin-master/configuracoes/lancamento/page.tsx). Video sobe pro
-- bucket 'institucional' (022_midia_institucional.sql), mesmo usado pelo
-- video de apresentacao principal.

create table if not exists lancamento_funcionalidades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  video_url text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lancamento_funcionalidades_ordem on lancamento_funcionalidades(ordem);

alter table lancamento_funcionalidades enable row level security;
create policy "lancamento_funcionalidades_publica" on lancamento_funcionalidades for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login), mesmo padrao do
-- resto do projeto ate a autenticacao real existir.

-- Sem unique constraint em titulo — protege reexecucao da migration
-- checando se a tabela ja tem alguma linha, em vez de "on conflict".
insert into lancamento_funcionalidades (titulo, ordem)
select * from (values
  ('Ganhe moedas fazendo indicações', 1),
  ('Moto Táxi', 2),
  ('Fitness sem custo de academia, com inteligência e geolocalização', 3),
  ('Encontre tudo no comércio da sua cidade', 4),
  ('Empresário, deixe de ter dor de cabeça com fiado', 5),
  ('Encontre seu emprego e divulgue vagas', 6)
) as seed(titulo, ordem)
where not exists (select 1 from lancamento_funcionalidades);
