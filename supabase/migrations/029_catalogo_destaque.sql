-- Caminho: C:\valente_conecta\supabase\migrations\029_catalogo_destaque.sql
--
-- Destaque manual (1º, 2º, 3º lugar) por item do catalogo, pensado pra
-- escalar: qualquer modulo pode ter ate 3 itens fixados no topo da vitrine
-- pelo admin master (pedido explicito: privilegiar Cozinha Chef Neide como
-- 1º lugar em Alimentacao, com espaco pra mais destaques conforme o app
-- cresce). Unico por (modulo, posicao) — nao da pra dois itens do mesmo
-- modulo disputarem o mesmo lugar.
--
-- catalogo_busca_vitrine_v3: mesma logica de catalogo_busca_vitrine_v2
-- (003_marketplace_interesse.sql), com destaque_posicao entrando como
-- primeiro criterio de ordenacao (equivalente a "patrocinado" — sempre no
-- topo do modulo/categoria filtrado). Nome novo por causa do cache do
-- pooler de conexoes documentado na v2: "create or replace" numa funcao ja
-- servida nao troca o plano em uso.

alter table catalogo_itens
  add column if not exists destaque_posicao smallint check (destaque_posicao between 1 and 3);

create unique index if not exists idx_catalogo_itens_destaque_unico
  on catalogo_itens(modulo, destaque_posicao)
  where destaque_posicao is not null;

create or replace function catalogo_busca_vitrine_v3(
  termo text default null,
  modulo_filtro text default null,
  categoria_filtro text default null,
  lat_usuario double precision default null,
  lng_usuario double precision default null,
  limite integer default 30,
  offset_ integer default 0
)
returns table (
  id uuid,
  modulo text,
  categoria text,
  titulo text,
  descricao_publica text,
  preco numeric,
  midia jsonb,
  distancia_km double precision,
  interesses_recentes bigint,
  menor_preco_categoria boolean,
  destaque_posicao smallint,
  metadata jsonb
)
language sql
stable
as $$
  with parametros as (
    select nullif(
      (
        select string_agg(regexp_replace(w, '[^\w]', '', 'g') || ':*', ' & ')
        from unnest(regexp_split_to_array(trim(coalesce(termo, '')), '\s+')) as w
        where regexp_replace(w, '[^\w]', '', 'g') <> ''
      ),
      ''
    ) as termo_tsquery
  ),
  base as (
    select
      c.id, c.modulo, c.categoria, c.titulo, c.descricao_publica, c.preco, c.midia,
      c.destaque_posicao, c.metadata,
      p.termo_tsquery,
      case
        when lat_usuario is null or lng_usuario is null or c.latitude is null or c.longitude is null
          then null
        else (
          2 * 6371 * asin(sqrt(
            sin(radians((c.latitude - lat_usuario) / 2)) ^ 2 +
            cos(radians(lat_usuario)) * cos(radians(c.latitude)) *
            sin(radians((c.longitude - lng_usuario) / 2)) ^ 2
          ))
        )
      end as distancia_km
    from catalogo_itens c, parametros p
    where c.status = 'ativo'
      and (modulo_filtro is null or c.modulo = modulo_filtro)
      and (categoria_filtro is null or c.categoria = categoria_filtro)
      and (
        p.termo_tsquery is null or
        to_tsvector('simple', coalesce(c.titulo,'') || ' ' || coalesce(c.descricao_publica,''))
          @@ to_tsquery('simple', p.termo_tsquery)
      )
  ),
  demanda as (
    select item_id, count(*) as total
    from interesses
    where created_at > now() - interval '30 days'
    group by item_id
  ),
  menor_preco as (
    select categoria, min(preco) as preco_min
    from base
    where preco is not null
    group by categoria
  )
  select
    b.id, b.modulo, b.categoria, b.titulo, b.descricao_publica, b.preco, b.midia,
    b.distancia_km,
    coalesce(d.total, 0) as interesses_recentes,
    (b.preco is not null and mp.preco_min is not null and b.preco = mp.preco_min) as menor_preco_categoria,
    b.destaque_posicao,
    b.metadata
  from base b
  left join demanda d on d.item_id = b.id
  left join menor_preco mp on mp.categoria = b.categoria
  order by
    coalesce(b.destaque_posicao, 999) asc,
    case when b.termo_tsquery is not null then
      ts_rank(
        to_tsvector('simple', coalesce(b.titulo,'') || ' ' || coalesce(b.descricao_publica,'')),
        to_tsquery('simple', b.termo_tsquery)
      )
    else 0 end desc,
    b.distancia_km asc nulls last,
    coalesce(d.total, 0) desc
  limit limite offset offset_;
$$;
