-- Caminho: C:\valente_conecta\supabase\migrations\078_codigo_indicacao_unique.sql
--
-- Pedido do dono do projeto: garantir que todo usuario tenha um codigo de
-- indicacao exclusivo. Na pratica ja' e' assim (lib/auth.ts::cadastroSimples
-- gera `VALENTE_${Date.now()}_${random}`, e conferido ao vivo: 20/20 usuarios
-- com codigo unico hoje) — esta migration so' transforma essa garantia em
-- constraint do banco, pra nunca depender apenas da logica do app.

create unique index if not exists idx_usuarios_codigo_indicacao_unique
  on usuarios (codigo_indicacao);
