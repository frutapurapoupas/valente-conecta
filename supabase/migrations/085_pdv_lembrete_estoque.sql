-- Caminho: C:\valente_conecta\supabase\migrations\085_pdv_lembrete_estoque.sql
--
-- Lembrete semanal de atualizacao de estoque do PDV colaborativo (pedido do
-- dono do produto): como o estoque ainda nao tem atualizacao instantanea
-- (sem integracao de PDV/ERP externo), o sistema avisa por push toda semana
-- pra o fornecedor conferir quantidade e preco dos itens que ja publicou.
-- Coluna guarda quando foi o ultimo envio, pra o cron
-- (app/api/pdv/cron/lembrete-estoque/route.ts) nao repetir antes de 7 dias
-- -- mesmo padrao de agua_gas_taxas_uso.lembrete_enviado_em, so' que em
-- perfis_fornecedor (por fornecedor, nao por item) porque o lembrete e' um
-- so' por fornecedor mesmo tendo varios produtos.

alter table perfis_fornecedor add column if not exists lembrete_estoque_enviado_em timestamptz;
