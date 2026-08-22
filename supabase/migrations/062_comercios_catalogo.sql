-- Caminho: C:\valente_conecta\supabase\migrations\062_comercios_catalogo.sql
--
-- Segunda etapa do "Sou proprietário" (056/059/061): depois que a
-- reivindicacao e' aprovada, o dono completa o cadastro com itens de
-- venda/servicos. So' comercios_diretorio precisa disso — Saude nao tem
-- conceito de catalogo, e Agua e Gas ja tem `produtos` na propria tabela
-- (014_agua_gas_supabase.sql), reaproveitado sem mudanca nenhuma.

alter table comercios_diretorio add column if not exists catalogo jsonb not null default '[]';
-- catalogo: array de {nome, preco, descricao} — preco opcional (null =
-- "a combinar"). Pro modulo "servicos" o mesmo campo "nome" e' usado pra
-- descrever o servico oferecido em vez de um produto a venda.
