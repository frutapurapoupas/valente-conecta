-- Caminho: C:\valente_conecta\supabase\migrations\011_catalogo_metadata.sql
--
-- Coluna generica para atributos especificos de cada modulo (ex: vaga de
-- emprego precisa de tipo/modalidade/requisitos, imovel precisa de
-- quartos/m2) sem forcar schema rigido por vertical — mantem catalogo_itens
-- como a fundacao unica (ver MODULO_MARKETPLACE_MONETIZACAO.md secao 2.1)
-- enquanto ainda permite cada modulo guardar o que precisa.

alter table catalogo_itens
  add column if not exists metadata jsonb not null default '{}'::jsonb;
