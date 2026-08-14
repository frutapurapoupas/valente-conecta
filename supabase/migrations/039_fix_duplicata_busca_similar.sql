-- Caminho: C:\valente_conecta\supabase\migrations\039_fix_duplicata_busca_similar.sql
--
-- Corrige bug encontrado em teste: pdv_buscar_produto_similar_v1 fazia
-- UNION entre "casou pelo nome" e "casou por apelido" — quando um mesmo
-- produto casava nos dois (nome parecido E algum apelido parecido), o
-- UNION nao deduplicava porque a coluna "similaridade" vinha diferente em
-- cada linha (UNION so' remove linhas 100% identicas em todas as colunas).
-- Resultado: o mesmo produto aparecia duas vezes na lista de sugestoes.
--
-- v2 agrupa por catalogo_id e fica so' com a maior similaridade encontrada
-- (nome ou apelido, o que bater melhor) — cada produto aparece uma unica
-- vez. Nome novo por causa do cache do pooler de conexoes documentado em
-- 003_marketplace_interesse.sql.

create or replace function pdv_buscar_produto_similar_v2(
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
  select t.catalogo_id, t.nome, t.ean, t.sku, t.foto_url, max(t.similaridade) as similaridade
  from (
    select id as catalogo_id, nome, ean, sku, foto_url, similarity(nome, p_nome) as similaridade
    from pdv_produtos_catalogo
    where segmento = p_segmento and similarity(nome, p_nome) > 0.25
    union all
    select pc.id, pc.nome, pc.ean, pc.sku, pc.foto_url, similarity(pa.apelido, p_nome)
    from pdv_produtos_apelidos pa
    join pdv_produtos_catalogo pc on pc.id = pa.catalogo_id
    where pc.segmento = p_segmento and similarity(pa.apelido, p_nome) > 0.25
  ) t
  group by t.catalogo_id, t.nome, t.ean, t.sku, t.foto_url
  order by similaridade desc
  limit p_limite;
$$;
