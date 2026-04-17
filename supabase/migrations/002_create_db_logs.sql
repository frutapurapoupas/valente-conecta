-- Migration: Criar tabela de logs do banco
-- Timestamp: 20240417_120500
-- Environment: development

BEGIN;

-- Criar tabela de logs para auditoria
CREATE TABLE IF NOT EXISTS db_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    environment VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_db_logs_action ON db_logs(action);
CREATE INDEX IF NOT EXISTS idx_db_logs_table ON db_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_db_logs_environment ON db_logs(environment);
CREATE INDEX IF NOT EXISTS idx_db_logs_created_at ON db_logs(created_at);

COMMIT;

-- Log da migration
INSERT INTO db_logs (action, table_name, environment, details, created_at)
VALUES ('MIGRATION', 'db_logs', 'development', 'Criada tabela db_logs para auditoria', NOW());
