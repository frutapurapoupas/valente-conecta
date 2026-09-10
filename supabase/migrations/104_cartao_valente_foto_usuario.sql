-- Caminho: supabase/migrations/104_cartao_valente_foto_usuario.sql
--
-- Cartao Valente (identificacao presencial rapida, ver proposta "Modo
-- Valente Facil"): hoje a tabela usuarios nao guarda foto de perfil -- so'
-- existe foto_url em fiado_clientes (cadastrada pelo LOJISTA sobre o
-- cliente). Pro cartao funcionar como conferencia visual do proprio
-- usuario, ele precisa poder subir a propria foto.

alter table usuarios add column if not exists foto_url text;
