-- Seed Data para Supabase Local
-- Executado automaticamente após db:reset

-- Inserir usuários iniciais
INSERT INTO users (id, email, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@valenteconecta.com', 'Administrador Valente', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'joao@mercadovalente.com', 'João da Mercearia', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'maria@atacadobompreco.com', 'Maria do Atacadão', NOW(), NOW());

-- Inserir estabelecimentos iniciais
INSERT INTO stores (id, name, address, city, state, zip_code, latitude, longitude, phone, email, owner_id, created_at, updated_at) VALUES
('store_001', 'Mercado Central Valente', 'Rua Principal, 123 - Centro', 'Valente', 'BA', '48700-000', -11.3217, -41.8655, '(77) 3451-1234', 'contato@mercadovalente.com', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('store_002', 'Atacadão de Valente', 'BR-116, Km 123 - Zona Rural', 'Valente', 'BA', '48700-000', -11.3456, -41.8456, '(77) 3451-5678', 'vendas@atacadobompreco.com', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('store_003', 'Supermercado São José', 'Rua das Flores, 456 - Centro', 'Valente', 'BA', '48700-000', -11.3100, -41.8900, '(77) 3451-9012', 'contato@supermercadosjose.com', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Inserir produtos com EAN real
INSERT INTO products (id, name, description, category, ean_code, price, image_url, store_id, stock, created_at, updated_at) VALUES
('prod_001', 'Arroz Tipo 1 5kg', 'Arroz branco tipo 1, grãos selecionados, ideal para o dia a dia', 'alimentos', '7891000013105', 25.90, 'https://picsum.photos/seed/arroz_5kg/200/200', 'store_001', 50, NOW(), NOW()),
('prod_002', 'Feijão Carioca 1kg', 'Feijão carioca tipo 1, grãos selecionados e beneficiados', 'alimentos', '7891000033105', 8.90, 'https://picsum.photos/seed/feijao_carioca/200/200', 'store_001', 30, NOW(), NOW()),
('prod_003', 'Óleo de Soja Liza 900ml', 'Óleo de soja premium, ideal para frituras e cozimentos', 'alimentos', '7891916000115', 12.90, 'https://picsum.photos/seed/oleo_liza_900ml/200/200', 'store_001', 40, NOW(), NOW()),
('prod_004', 'Açúcar Refinado União 1kg', 'Açúcar cristal refinado, embalagem prática', 'alimentos', '7896002100175', 5.50, 'https://picsum.photos/seed/acucar_uniao_1kg/200/200', 'store_001', 60, NOW(), NOW()),
('prod_005', 'Café Pilão 500g', 'Café torrado e moído, sabor intenso e marcante', 'alimentos', '7896000100175', 18.90, 'https://picsum.photos/seed/cafe_pilao_500g/200/200', 'store_001', 25, NOW(), NOW()),
('prod_006', 'Sal Refinado Cisne 1kg', 'Sal refinado iodado, essencial para temperos', 'alimentos', '7896000100185', 3.20, 'https://picsum.photos/seed/sal_cisne_1kg/200/200', 'store_001', 80, NOW(), NOW()),
('prod_007', 'Macarrão Santa Amália 500g', 'Macarrão tipo espaguete, massa de trigo durum', 'alimentos', '7891000123105', 4.80, 'https://picsum.photos/seed/macarrao_santa_500g/200/200', 'store_001', 45, NOW(), NOW()),
('prod_008', 'Detergente Ypê 500ml', 'Detergente líquido concentrado, limpeza eficiente', 'limpeza', '7896000100195', 7.90, 'https://picsum.photos/seed/detergente_ype_500ml/200/200', 'store_001', 35, NOW(), NOW()),
('prod_009', 'Sabonete Dove 90g', 'Sabonete hidratante com 1/4 de creme hidratante', 'higiene', '7891000123106', 6.50, 'https://picsum.photos/seed/sabonete_dove_90g/200/200', 'store_001', 70, NOW(), NOW()),
('prod_010', 'Papel Higiênico Neve 4 rolos', 'Papel higiênico macio, 4 camadas, embalagem econômica', 'higiene', '7891000123107', 15.90, 'https://picsum.photos/seed/papel_neve_4rolos/200/200', 'store_002', 20, NOW(), NOW());

-- Inserir categorias
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
('cat_001', 'Alimentos', 'Produtos alimentícios em geral', NOW(), NOW()),
('cat_002', 'Limpeza', 'Produtos de limpeza e higiene', NOW(), NOW()),
('cat_003', 'Higiene Pessoal', 'Itens de higiene e cuidados pessoais', NOW(), NOW());

-- Inserir ofertas/promoções
INSERT INTO offers (id, product_id, store_id, discount_percentage, start_date, end_date, created_at, updated_at) VALUES
('offer_001', 'prod_002', 'store_001', 15.0, NOW(), NOW() + INTERVAL '7 days', NOW(), NOW()),
('offer_002', 'prod_001', 'store_001', 10.0, NOW(), NOW() + INTERVAL '3 days', NOW(), NOW()),
('offer_003', 'prod_005', 'store_003', 20.0, NOW(), NOW() + INTERVAL '5 days', NOW(), NOW());

-- Inserir tabela de admin (controle de acesso)
INSERT INTO admin_users (id, email, name, role, permissions, created_at, updated_at) VALUES
('admin_001', 'admin@valenteconecta.com', 'Administrador Sistema', 'super_admin', '["all"]', NOW(), NOW()),
('admin_002', 'dev@valenteconecta.com', 'Desenvolvedor', 'developer', '["read", "write", "migrate"]', NOW(), NOW());

-- Inserir logs iniciais
INSERT INTO db_logs (id, action, table_name, environment, user_id, details, created_at) VALUES
('log_001', 'SEED', 'products', 'local', '550e8400-e29b-41d4-a716-446655440001', 'Inseridos 10 produtos iniciais com EAN real', NOW()),
('log_002', 'SEED', 'users', 'local', '550e8400-e29b-41d4-a716-446655440001', 'Inseridos 3 usuários iniciais', NOW()),
('log_003', 'SEED', 'stores', 'local', '550e8400-e29b-41d4-a716-446655440001', 'Inseridos 3 estabelecimentos iniciais', NOW());

-- Confirmar seed
SELECT 'SEED DATA CARREGADA COM SUCESSO!' as status,
       COUNT(*) as total_usuarios FROM users,
       COUNT(*) as total_estabelecimentos FROM stores,
       COUNT(*) as total_produtos FROM products,
       COUNT(*) as total_ofertas FROM offers;
