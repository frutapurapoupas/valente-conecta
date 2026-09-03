-- Caminho: C:\valente_conecta\supabase\migrations\099_remove_obrigatorio_foto_qrcode.sql
--
-- A etapa "codigo de barras da nota" (antigo "QR code da nota") saiu do
-- fluxo do consumidor -- a leitura por foto estava muito inconsistente
-- (reflexo na embalagem/nota atrapalha o decodificador) e virou fonte de
-- atrito sem beneficio real: a "Foto da nota fiscal / cupom" (essa sim
-- continua obrigatoria) ja e' a prova de compra. Mantem a coluna (rows
-- antigas ainda tem o dado, util pra auditoria) so' tira o NOT NULL, ja
-- que cadastros novos nao vao mais preencher isso.

alter table consumidor_cadastros_produto alter column foto_qrcode_path drop not null;
