-- Caminho: C:\valente_conecta\supabase\migrations\083_cozinha_cardapio.sql
--
-- A rota de cardapio semanal (app/api/cozinha/cardapio/route.ts) ja sabia
-- ler/gravar numa tabela 'cardapio' se ela existisse, mas essa tabela nunca
-- tinha sido criada — a rota caia no "plano B" (gravar um arquivo local
-- data/cardapio.json), que funciona rodando localmente mas nao persiste em
-- producao na Vercel (sistema de arquivos read-only fora de /tmp, some a
-- cada novo deploy/cold start). Criando a tabela de verdade, a rota passa a
-- usar ela automaticamente (e' a primeira que ela tenta), sem precisar
-- mexer em nenhum codigo.

create table if not exists cardapio (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references receitas(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6), -- 0=domingo ... 6=sabado
  periodo text not null default 'almoco' check (periodo in ('cafe', 'almoco', 'jantar')),
  preco_customizado numeric(12,2),
  usar_preco_da_receita boolean not null default true,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cardapio_dia_semana on cardapio(dia_semana);

alter table cardapio enable row level security;
create policy "cardapio_publica" on cardapio for all using (true) with check (true);
