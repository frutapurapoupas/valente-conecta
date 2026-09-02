-- Caminho: C:\valente_conecta\supabase\migrations\098_reivindicacao_cadastro_consumidor.sql
--
-- Ate agora, o consumidor so' conseguia cadastrar um produto se a loja ja'
-- existisse em perfis_fornecedor (ver /api/lojistas/buscar) -- se o lojista
-- ainda nao tinha se cadastrado no app, o consumidor ficava travado sem
-- conseguir prosseguir. Agora fornecedor_id vira opcional: se a busca nao
-- achar a loja, o consumidor digita o nome dela em texto livre
-- (nome_loja_texto) e o cadastro entra "sem dono". Quando esse lojista
-- se cadastrar e for validado pelo admin master (perfis_fornecedor.
-- validacao_status = 'aprovado', ver 094_validacao_proprietario_loja.sql),
-- ele pode "reivindicar" esses itens (ver /api/pdv/reivindicar-cadastro-
-- consumidor) -- isso preenche fornecedor_id e o item passa a entrar na
-- fila normal de aprovacao dele (/api/pdv/aprovacoes-consumidor), do
-- mesmo jeito que se ele ja existisse quando o consumidor cadastrou.

alter table consumidor_cadastros_produto alter column fornecedor_id drop not null;
alter table consumidor_cadastros_produto add column if not exists nome_loja_texto text;
alter table consumidor_cadastros_produto add column if not exists reivindicado_em timestamptz;

alter table consumidor_cadastros_produto drop constraint if exists consumidor_cadastros_produto_loja_check;
alter table consumidor_cadastros_produto add constraint consumidor_cadastros_produto_loja_check
  check (fornecedor_id is not null or nome_loja_texto is not null);

create index if not exists idx_consumidor_cadastros_nao_reivindicados
  on consumidor_cadastros_produto(status)
  where fornecedor_id is null;
