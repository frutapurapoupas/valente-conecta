-- ============================================================
-- 🍽️ SCRIPT PARA IMPORTAR PRATOS, RECEITAS E INGREDIENTES
-- ============================================================

-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- DELETE FROM receita_ingredientes;
-- DELETE FROM receitas;
-- DELETE FROM pratos;
-- DELETE FROM cozinha_ingredientes;

-- ============================================================
-- 2. INSERIR PRATOS
-- ============================================================

INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Picadinho de Carne com Arroz e Legumes',
    'Picadinho de carne bovina com arroz branco, cenoura e abóbora - 500g',
    'Prato Principal',
    'Segunda',
    'Almoço',
    20.02,
    8.01,
    true,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Frango em Cubos com Arroz e Purê',
    'Frango em cubos com arroz branco e purê de batata - 500g',
    'Prato Principal',
    'Terça',
    'Almoço',
    13.3,
    5.32,
    true,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Carne Moída com Arroz e Legumes',
    'Carne moída com arroz branco, batata, cenoura e chuchu - 500g',
    'Prato Principal',
    'Quarta',
    'Almoço',
    18.04,
    7.22,
    true,
    'https://images.unsplash.com/photo-1603133872878-6842b706a9f4?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Strogonoff de Frango com Arroz',
    'Strogonoff de frango cremoso com arroz branco - 500g',
    'Prato Principal',
    'Quinta',
    'Almoço',
    14.01,
    5.6,
    true,
    'https://images.unsplash.com/photo-1604908177453-18b2be4aa2a4?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Carne de Panela com Arroz e Purê',
    'Carne de panela macia com arroz branco e purê de batata - 500g',
    'Prato Principal',
    'Sexta',
    'Almoço',
    20.32,
    8.13,
    true,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Frango em Cubos com Arroz',
    'Frango em cubos suculento com arroz branco - 500g',
    'Prato Principal',
    'Segunda',
    'Jantar',
    15.36,
    6.15,
    true,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Escondidinho de Frango',
    'Escondidinho cremoso de frango com purê de batata gratinado - 500g',
    'Prato Principal',
    'Terça',
    'Jantar',
    12.89,
    5.16,
    true,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);
INSERT INTO pratos (nome, descricao, categoria, dia_semana, periodo, preco, preco_custo, ativo, imagem_url, created_at, updated_at)
VALUES (
    'Fricassê de Frango',
    'Fricassê cremoso de frango com creme de milho e arroz - 500g',
    'Prato Principal',
    'Quarta',
    'Jantar',
    13.25,
    5.3,
    true,
    'https://images.unsplash.com/photo-1603133872878-6842b706a9f4?w=400&h=300&fit=crop',
    NOW(),
    NOW()
);

-- ============================================================
-- 3. INSERIR INGREDIENTES (ESTOQUE)
-- ============================================================

INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Abóbora',
    0.7,
    'kg',
    3.5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Alho',
    0.34,
    'kg',
    12,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Arroz branco',
    11.15,
    'kg',
    6.5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Batata',
    6.1,
    'kg',
    5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Carne bovina',
    4,
    'kg',
    32,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Carne moída',
    2,
    'kg',
    28,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Cebola',
    0.34,
    'kg',
    5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Cebolinha',
    0.03,
    'kg',
    12,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Cenoura',
    1.2,
    'kg',
    4.5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Chuchu',
    0.4,
    'kg',
    3,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Coentro',
    0.11,
    'kg',
    15,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Creme de leite',
    0.5,
    'kg',
    8,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Creme de milho',
    1.5,
    'kg',
    5,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Ketchup',
    0.5,
    'kg',
    6,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Peito de frango',
    10.5,
    'kg',
    18,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Sal',
    0.43,
    'kg',
    2,
    NOW(),
    NOW()
);
INSERT INTO cozinha_ingredientes (nome, quantidade, unidade, preco_unitario, created_at, updated_at)
VALUES (
    'Salsa',
    0.05,
    'kg',
    12,
    NOW(),
    NOW()
);

