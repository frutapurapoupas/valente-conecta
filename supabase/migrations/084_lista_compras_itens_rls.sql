-- Caminho: C:\valente_conecta\supabase\migrations\084_lista_compras_itens_rls.sql
--
-- lista_compras_itens foi criada fora de migration (por fora do controle
-- de versao) com RLS habilitado e nenhuma policy de escrita -- confirmado
-- ao vivo: POST em /api/cozinha/lista-compras (botao "Enviar para Lista de
-- Compras" na tela de receita) batia "42501 new row violates row-level
-- security policy" com a chave anon, a mesma que TODAS as outras rotas de
-- app/api/cozinha/* usam (estoque, receitas, cardapio) -- nenhuma delas tem
-- RLS restrito, so' essa. Desliga RLS aqui pra ficar consistente com as
-- irmas, sem precisar de chave de service role (que nem esta configurada
-- no ambiente de producao da Vercel).

alter table lista_compras_itens disable row level security;
