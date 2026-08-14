-- Caminho: C:\valente_conecta\supabase\migrations\038_pdv_catalogo_colaborativo.sql
--
-- Fase 1 do PDV Colaborativo (pedido do dono do projeto): um catalogo de
-- produtos COMPARTILHADO entre todos os comerciantes que usam o PDV do
-- Valente Conecta, nao um estoque isolado por loja. A ideia central:
--
--   - Produto com codigo de barras oficial (EAN/GS1) usa o proprio EAN
--     como identificador — nao tem ambiguidade, dois comerciantes que
--     escaneiam o mesmo EAN caem no mesmo registro de catalogo.
--   - Produto SEM EAN (comum em açougue, feira, roupa sob medida, mercearia
--     de bairro etc) recebe um SKU interno gerado pelo sistema. Quando um
--     segundo comerciante cadastra algo parecido, pdv_buscar_produto_similar_v1
--     sugere o SKU ja existente (por nome/apelido, usando pg_trgm) em vez
--     de criar um duplicado — a decisao final de "e' o mesmo produto" e'
--     sempre do comerciante, o sistema so' sugere.
--
-- pdv_produtos_apelidos existe porque o mesmo produto pode ser chamado de
-- coisas diferentes por comerciantes diferentes ("coca" / "refrigerante
-- coca-cola" / "coquinha") — todos os apelidos apontam pro mesmo registro
-- canonico de catalogo, o que faz a busca por similaridade funcionar melhor
-- com o tempo.
--
-- pdv_estoque_itens e' o estoque DE CADA comerciante — quantidade e preco
-- sao dele, mas o produto em si (nome, EAN, SKU, foto) vem do catalogo
-- compartilhado.

create extension if not exists pg_trgm;

create table if not exists pdv_produtos_catalogo (
  id uuid primary key default gen_random_uuid(),
  ean text,
  sku text not null unique,
  nome text not null,
  segmento text not null check (segmento in (
    'mercado', 'farmacia', 'auto_pecas', 'acougue', 'moda', 'papelaria', 'geral'
  )),
  categoria text,
  unidade text not null default 'un',
  foto_url text,
  foto_codigo_barras_url text,
  criado_por uuid references usuarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EAN, quando existe, tem que ser unico (e' o padrao GS1) — mas fica nulo
-- em produtos sem codigo de barras oficial, entao a unicidade so' vale pra
-- quem tem EAN preenchido.
create unique index if not exists idx_pdv_catalogo_ean_unico on pdv_produtos_catalogo(ean) where ean is not null;
create index if not exists idx_pdv_catalogo_segmento on pdv_produtos_catalogo(segmento);
create index if not exists idx_pdv_catalogo_nome_trgm on pdv_produtos_catalogo using gin (nome gin_trgm_ops);

create table if not exists pdv_produtos_apelidos (
  id uuid primary key default gen_random_uuid(),
  catalogo_id uuid not null references pdv_produtos_catalogo(id) on delete cascade,
  apelido text not null,
  usuario_id uuid references usuarios(id),
  created_at timestamptz not null default now(),
  unique (catalogo_id, apelido)
);

create index if not exists idx_pdv_apelidos_trgm on pdv_produtos_apelidos using gin (apelido gin_trgm_ops);

create table if not exists pdv_estoque_itens (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  catalogo_id uuid not null references pdv_produtos_catalogo(id),
  quantidade numeric(12,3) not null default 0 check (quantidade >= 0),
  preco_custo numeric(12,2),
  preco_venda numeric(12,2) not null default 0 check (preco_venda >= 0),
  estoque_minimo numeric(12,3) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id, catalogo_id)
);

create index if not exists idx_pdv_estoque_usuario on pdv_estoque_itens(usuario_id);

-- ============================================================
-- Sequence + RPC: gera um SKU legivel por balcao (ex: MER-000123) pra
-- produto sem EAN. Prefixo vem do segmento, numero e' sequencial global —
-- simples de digitar/falar no caixa quando nao da' pra escanear nada.
-- ============================================================
create sequence if not exists pdv_sku_seq start 1;

create or replace function pdv_proximo_sku_v1(p_segmento text)
returns text
language plpgsql
as $$
declare
  v_prefixo text;
begin
  v_prefixo := case p_segmento
    when 'mercado' then 'MER'
    when 'farmacia' then 'FAR'
    when 'auto_pecas' then 'AUT'
    when 'acougue' then 'ACG'
    when 'moda' then 'MOD'
    when 'papelaria' then 'PAP'
    else 'GER'
  end;
  return v_prefixo || '-' || lpad(nextval('pdv_sku_seq')::text, 6, '0');
end;
$$;

-- ============================================================
-- RPC: sugere produtos parecidos ja cadastrados (por nome canonico ou por
-- apelido de qualquer comerciante) antes de criar um novo registro de
-- catalogo — evita duplicar "coca-cola 2L" com 5 SKUs diferentes so'
-- porque cada comerciante digitou o nome de um jeito. So' considera o
-- mesmo segmento (um "parafuso" de auto pecas nao deve sugerir casamento
-- com algo de moda).
-- ============================================================
create or replace function pdv_buscar_produto_similar_v1(
  p_nome text,
  p_segmento text,
  p_limite integer default 5
)
returns table (
  catalogo_id uuid,
  nome text,
  ean text,
  sku text,
  foto_url text,
  similaridade real
)
language sql
stable
as $$
  select id, nome, ean, sku, foto_url, similarity(nome, p_nome) as similaridade
  from pdv_produtos_catalogo
  where segmento = p_segmento
    and similarity(nome, p_nome) > 0.25
  union
  select pc.id, pc.nome, pc.ean, pc.sku, pc.foto_url, similarity(pa.apelido, p_nome) as similaridade
  from pdv_produtos_apelidos pa
  join pdv_produtos_catalogo pc on pc.id = pa.catalogo_id
  where pc.segmento = p_segmento
    and similarity(pa.apelido, p_nome) > 0.25
  order by similaridade desc
  limit p_limite;
$$;

alter table pdv_produtos_catalogo enable row level security;
alter table pdv_produtos_apelidos enable row level security;
alter table pdv_estoque_itens enable row level security;
create policy "pdv_produtos_catalogo_publica" on pdv_produtos_catalogo for all using (true) with check (true);
create policy "pdv_produtos_apelidos_publica" on pdv_produtos_apelidos for all using (true) with check (true);
create policy "pdv_estoque_itens_publica" on pdv_estoque_itens for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto.
