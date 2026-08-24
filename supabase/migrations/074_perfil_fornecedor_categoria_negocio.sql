-- Caminho: C:\valente_conecta\supabase\migrations\074_perfil_fornecedor_categoria_negocio.sql
--
-- Categoria de negocio do fornecedor (mercearia_pequena, mercado_grande,
-- lojas, profissionais_liberais etc — mesmos ids de "servico" ja usados em
-- /api/planos-config e na pagina /planos?servico=X). Pedida no "Complete o
-- perfil da loja" antes de publicar na vitrine (app/pdv/estoque/page.tsx) —
-- alimenta o pop-up de plano recomendado depois de publicar.

alter table perfis_fornecedor add column if not exists categoria_negocio text;
