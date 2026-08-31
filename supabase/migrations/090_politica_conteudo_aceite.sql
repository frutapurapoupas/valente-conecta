-- Caminho: C:\valente_conecta\supabase\migrations\090_politica_conteudo_aceite.sql
--
-- Registro do aceite da politica de protecao de conteudo (proibe anuncios,
-- curriculos etc. relacionados a atividade ilicita) -- usuario geral precisa
-- aceitar antes de publicar qualquer coisa (vaga de emprego, classificado,
-- curriculo...). Guarda a VERSAO aceita (nao so' um boolean) pra poder pedir
-- aceite de novo automaticamente se o texto da politica mudar no futuro
-- (ver lib/politicaConteudo.ts, POLITICA_CONTEUDO_VERSAO).

alter table usuarios add column if not exists aceitou_politica_conteudo_versao integer;
alter table usuarios add column if not exists aceitou_politica_conteudo_em timestamptz;
