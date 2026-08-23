-- Caminho: C:\valente_conecta\supabase\migrations\069_pdv_estoque_variante.sql
--
-- Grade/variacao de produto (tamanho, cor etc) -- pedido do dono do
-- projeto comparando com um concorrente que suporta isso (essencial pra
-- quem vende roupa/calcado, segmento "moda"). Cada variante vira sua
-- propria linha em pdv_estoque_itens, com preco/estoque proprios --
-- decisao tomada porque a RPC de venda (pdv_registrar_venda_v1, ver
-- 067_pdv_vendas.sql) ja desconta estoque por `id` da linha, sem nenhum
-- conhecimento de "produto" vs "variante": nao precisa mudar nada nela.
--
-- variante e' texto vazio ('') pra produto sem variacao -- NAO nullable,
-- de proposito: NULL nao colide em `unique`, entao duas linhas
-- "sem variacao" do mesmo produto passariam despercebidas. String vazia
-- garante que a unicidade antiga (usuario_id, catalogo_id) continua
-- valendo pro caso comum (produto sem grade).

alter table pdv_estoque_itens add column if not exists variante text not null default '';

-- Adiciona a constraint nova ANTES de remover a antiga: toda linha ja'
-- tem variante='', e a constraint antiga ja' garante unicidade de
-- (usuario_id, catalogo_id), entao (usuario_id, catalogo_id, '') ja' e'
-- unico por construcao -- esse ADD nunca falha.
alter table pdv_estoque_itens
  add constraint pdv_estoque_itens_usuario_catalogo_variante_key
  unique (usuario_id, catalogo_id, variante);

-- Remove a constraint unique antiga (usuario_id, catalogo_id) -- descoberta
-- dinamicamente em vez de citar o nome de cabeca, pra nao depender de
-- adivinhar como o Postgres nomeou a clausula `unique(...)` inline
-- original (038_pdv_catalogo_colaborativo.sql).
do $$
declare
  v_constraint_antiga text;
begin
  select conname into v_constraint_antiga
  from pg_constraint
  where conrelid = 'pdv_estoque_itens'::regclass
    and contype = 'u'
    and conname <> 'pdv_estoque_itens_usuario_catalogo_variante_key'
  limit 1;

  if v_constraint_antiga is not null then
    execute format('alter table pdv_estoque_itens drop constraint %I', v_constraint_antiga);
  end if;
end $$;
