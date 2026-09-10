-- Caminho: C:\valente_conecta\supabase\migrations\103_pdv_ean_pendentes_cosmos.sql
--
-- Fila de EANs escaneados no PDV que nao bateram em nenhum lugar (nem
-- catalogo interno, nem Kodebar -- ver app/api/pdv/catalogo/buscar-externo)
-- pra consultar depois na API da Bluesoft Cosmos, respeitando o limite de
-- 25 consultas/dia do plano gratuito (ver app/api/pdv/catalogo/cron/
-- consultar-cosmos). Cresce sozinha com o uso real do PDV.

create table if not exists pdv_ean_pendentes_externos (
  id uuid primary key default gen_random_uuid(),
  ean text not null unique,
  status text not null default 'pendente' check (status in ('pendente', 'encontrado', 'nao_encontrado', 'erro')),
  origem text,
  tentativas integer not null default 0,
  consultado_em timestamptz,
  catalogo_id uuid references pdv_produtos_catalogo(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_ean_pendentes_status on pdv_ean_pendentes_externos(status, created_at);

alter table pdv_ean_pendentes_externos enable row level security;
create policy "pdv_ean_pendentes_externos_publica" on pdv_ean_pendentes_externos for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
