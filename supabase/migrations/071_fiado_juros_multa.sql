-- Caminho: C:\valente_conecta\supabase\migrations\071_fiado_juros_multa.sql
--
-- Juros e multa configuraveis por loja pra divida de fiado atrasada
-- (item 8 do backlog levantado contra o concorrente) -- decisao do dono
-- do projeto: o lojista define os proprios percentuais (podem ficar em
-- 0, que e' o default e mantem o comportamento de hoje sem nenhuma
-- cobranca extra). Convencao adotada: juros simples ao mes, proporcional
-- aos dias em atraso, + multa unica aplicada assim que vence.
--
-- Fica em fiado_habilitacoes (1 linha por loja, ja existente) em vez de
-- tabela nova -- e' configuracao do modulo, mesmo lugar que ja guarda
-- se o fiado esta ativo pra essa loja.

alter table fiado_habilitacoes add column if not exists juros_mensal_pct numeric(5,2) not null default 0;
alter table fiado_habilitacoes add column if not exists multa_pct numeric(5,2) not null default 0;
