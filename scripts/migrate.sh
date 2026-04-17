#!/bin/bash

# Script de Migração Versionada
# Uso: npm run db:migrate <nome_da_migration>

if [ $# -eq 0 ]; then
    echo "❌ Erro: Nome da migration não informado"
    echo "Uso: npm run db:migrate <nome_da_migration>"
    echo "Exemplo: npm run db:migrate add_user_role"
    exit 1
fi

MIGRATION_NAME=$1
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_${MIGRATION_NAME}.sql"

echo "🔄 CRIANDO MIGRATION: $MIGRATION_NAME"
echo "📄 Arquivo: $MIGRATION_FILE"

# Criar diretório de migrations se não existir
mkdir -p supabase/migrations

# Criar arquivo de migration com template
cat > $MIGRATION_FILE << EOF
-- Migration: $MIGRATION_NAME
-- Timestamp: $TIMESTAMP
-- Environment: $NODE_ENV

-- Instruções:
-- 1. Descreva o que esta migration faz
-- 2. Use transações para segurança
-- 3. Teste em desenvolvimento antes de produção

BEGIN;

-- TODO: Adicionar sua migration aqui
-- Exemplo:
-- ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
-- CREATE INDEX idx_users_role ON users(role);

COMMIT;

-- Log da migration
INSERT INTO db_logs (action, table_name, environment, details, created_at)
VALUES ('MIGRATION', 'multiple', '$NODE_ENV', 'Migration $MIGRATION_NAME executada', NOW());

EOF

echo "✅ Migration criada: $MIGRATION_FILE"
echo "📝 Edite o arquivo e execute: supabase db push"
