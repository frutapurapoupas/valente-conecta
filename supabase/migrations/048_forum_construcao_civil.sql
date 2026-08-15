-- Caminho: C:\valente_conecta\supabase\migrations\048_forum_construcao_civil.sql
--
-- Forum exclusivo dos profissionais/usuarios do app pra falar de
-- construcao civil (pedido do dono do projeto): so' usuario cadastrado
-- (usuarios.id, getCurrentUser()) participa — diferente do resto do
-- arquetipo "anuncio-contato" que usa id anonimo, aqui a identidade real
-- importa porque tem moderacao de conteudo (imagens, termo de
-- compromisso) e precisa de responsabilizacao.

create table if not exists construcao_forum_termo_aceites (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  aceito_em timestamptz not null default now()
);

create table if not exists construcao_forum_posts (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  texto text not null,
  midia jsonb not null default '[]',
  status text not null default 'ativo' check (status in ('ativo', 'removido')),
  created_at timestamptz not null default now()
);

create index if not exists idx_forum_posts_status on construcao_forum_posts(status);
create index if not exists idx_forum_posts_created on construcao_forum_posts(created_at desc);

create table if not exists construcao_forum_denuncias (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references construcao_forum_posts(id) on delete cascade,
  denunciante_id uuid not null references usuarios(id),
  motivo text,
  created_at timestamptz not null default now(),
  unique (post_id, denunciante_id)
);

alter table construcao_forum_termo_aceites enable row level security;
alter table construcao_forum_posts enable row level security;
alter table construcao_forum_denuncias enable row level security;
create policy "construcao_forum_termo_publica" on construcao_forum_termo_aceites for all using (true) with check (true);
create policy "construcao_forum_posts_publica" on construcao_forum_posts for all using (true) with check (true);
create policy "construcao_forum_denuncias_publica" on construcao_forum_denuncias for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
