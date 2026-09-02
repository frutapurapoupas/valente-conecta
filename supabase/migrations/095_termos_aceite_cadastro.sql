-- Caminho: C:\valente_conecta\supabase\migrations\095_termos_aceite_cadastro.sql
--
-- Aceite de termos/politicas nos fluxos de cadastro e ativacao -- nenhum
-- deles pedia consentimento ate agora. Documentos fornecidos pelo dono do
-- produto (politica de privacidade, termo de uso motorista, limitacao de
-- responsabilidade), texto completo em lib/termos/*.ts.

-- Politica de Privacidade no cadastro geral (components/CadastroPopup.tsx)
-- -- mesmo padrao versionado de aceitou_politica_conteudo_* (090), pra
-- poder pedir de novo se o texto mudar no futuro.
alter table usuarios add column if not exists aceitou_privacidade_versao integer;
alter table usuarios add column if not exists aceitou_privacidade_em timestamptz;

-- Termo de Uso Motorista + Limitacao de Responsabilidade na ativacao de
-- motorista (moto-taxi e carona solidaria) -- reafirmado a cada cadastro,
-- mesmo padrao de aceitou_termos_documento_em (094).
alter table mototaxi_motoristas add column if not exists aceitou_termos_motorista_em timestamptz;
alter table mototaxi_motoristas add column if not exists aceitou_limitacao_responsabilidade_em timestamptz;
alter table carona_motoristas add column if not exists aceitou_termos_motorista_em timestamptz;
alter table carona_motoristas add column if not exists aceitou_limitacao_responsabilidade_em timestamptz;

-- Limitacao de Responsabilidade ao virar lojista (ModalCompletarPerfilVitrine).
-- perfis_fornecedor ja tem aceitou_termos_documento_em (094), mas e' um
-- aceite DIFERENTE: aquele e' sobre o documento comprobatorio de
-- propriedade da loja, este e' sobre o termo comercial (risco de
-- inadimplencia, intermediacao tecnologica).
alter table perfis_fornecedor add column if not exists aceitou_limitacao_responsabilidade_em timestamptz;
