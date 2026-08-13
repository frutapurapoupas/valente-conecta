-- Caminho: C:\valente_conecta\supabase\migrations\035_comunicados.sql
--
-- Comunicado oficial real da home (antes era um array fixo no codigo,
-- sem tela de edicao nenhuma). Duas origens:
--   'admin' — admin master digita e publica (segmentado por grupo/cidade,
--             reaproveitando lib/gruposInteresse.ts do aviso geral por push)
--   'ia'    — sugestao gerada a partir de dados reais do sistema (ver
--             /api/admin-master/comunicados/sugerir), sempre nasce como
--             'rascunho' e so aparece pra usuario depois que o admin
--             master aprovar e publicar.

create table if not exists comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensagem text not null,
  origem text not null default 'admin' check (origem in ('admin', 'ia')),
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado', 'arquivado')),
  grupos text[],
  cidades text[],
  criado_por uuid references usuarios(id),
  aprovado_por uuid references usuarios(id),
  publicado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_comunicados_status on comunicados(status, created_at desc);

alter table comunicados enable row level security;
create policy "comunicados_publica" on comunicados for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto.
