-- Caminho: C:\valente_conecta\supabase\migrations\073_pdv_estoque_vitrine.sql
--
-- Publicacao do estoque do PDV na vitrine publica do app (catalogo_itens,
-- 003_marketplace_interesse.sql). Ate aqui eram dois catalogos sem nenhuma
-- ponte: pdv_produtos_catalogo/pdv_estoque_itens (uso interno do PDV, nunca
-- visto pelo consumidor) e catalogo_itens (o que aparece em /mercados,
-- /moda etc). Decisao com o dono do produto: publicar tudo de uma vez
-- (nao item a item), manter sincronizado sozinho dali pra frente.
--
-- O vinculo fica em pdv_estoque_itens (nao em pdv_produtos_catalogo) porque
-- preco/quantidade sao por LOJA -- o catalogo colaborativo do PDV e'
-- compartilhado entre lojas, a vitrine publica nao.

alter table pdv_estoque_itens add column if not exists catalogo_item_id uuid references catalogo_itens(id);

create unique index if not exists idx_pdv_estoque_catalogo_item_unico
  on pdv_estoque_itens(catalogo_item_id) where catalogo_item_id is not null;

-- Sincronizacao automatica: qualquer mudanca de preco/quantidade/ativo no
-- estoque do PDV -- seja edicao manual na tela de estoque (PUT /api/pdv/estoque)
-- seja a baixa automatica da RPC de venda (pdv_registrar_venda_v1) -- reflete
-- sozinha no item publicado na vitrine. Sem isso, precisaria lembrar de
-- atualizar catalogo_itens em todo ponto do codigo que mexe em estoque.
create or replace function pdv_sincronizar_vitrine_trigger()
returns trigger
language plpgsql
as $$
begin
  if new.catalogo_item_id is not null then
    update catalogo_itens
    set preco = new.preco_venda,
        status = case when new.quantidade > 0 and new.ativo then 'ativo' else 'pausado' end,
        updated_at = now()
    where id = new.catalogo_item_id;
  end if;
  return new;
end;
$$;

drop trigger if exists pdv_estoque_sincroniza_vitrine on pdv_estoque_itens;
create trigger pdv_estoque_sincroniza_vitrine
  after update of preco_venda, quantidade, ativo on pdv_estoque_itens
  for each row
  execute function pdv_sincronizar_vitrine_trigger();
