-- Caminho: C:\valente_conecta\supabase\migrations\068_pdv_estoque_validade.sql
--
-- Data de validade opcional por item de estoque (pedido do dono do
-- projeto, comparando com um concorrente que tem esse controle) --
-- relevante sobretudo pra mercado/acougue/farmacia. Coluna nullable com
-- default implicito (null), operacao so' de metadado -- seguro em tabela
-- ja populada.

alter table pdv_estoque_itens add column if not exists validade date;
