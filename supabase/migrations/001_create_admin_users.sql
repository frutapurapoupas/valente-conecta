-- Migration: Criar tabela de usuários administradores
-- Timestamp: 20240417_120000
-- Environment: development

BEGIN;

-- Criar tabela de usuários administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    permissions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Inserir administradores padrão
INSERT INTO admin_users (id, email, name, role, permissions, created_at, updated_at) VALUES
('admin_001', 'admin@valenteconecta.com', 'Administrador Sistema', '["all"]', NOW(), NOW()),
('admin_002', 'dev@valenteconecta.com', 'Desenvolvedor', '["read", "write", "migrate"]', NOW(), NOW());

COMMIT;

-- Log da migration
INSERT INTO db_logs (action, table_name, environment, details, created_at)
VALUES ('MIGRATION', 'admin_users', 'development', 'Criada tabela admin_users com permissões', NOW());
