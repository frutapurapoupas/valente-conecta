-- Caminho: supabase/migrations/111_fila_saude_mercadopago.sql
--
-- Pagamento online (cartao/Pix) na Fila Virtual de Saude, com split
-- automatico pro diretor da unidade -- mesmo padrao ja usado em
-- agua_gas_fornecedores/carona_motoristas (conectar a PROPRIA conta MP
-- via OAuth, o dinheiro cai direto pra ela, com marketplace_fee pra
-- plataforma).

alter table unidades_saude add column if not exists mp_access_token text;
alter table unidades_saude add column if not exists mp_refresh_token text;
alter table unidades_saude add column if not exists mp_user_id text;
alter table unidades_saude add column if not exists mp_public_key text;
alter table unidades_saude add column if not exists mp_conectado_em timestamptz;

alter table fila_saude_senhas add column if not exists mp_payment_id text;
