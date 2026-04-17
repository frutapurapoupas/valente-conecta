#!/bin/bash

# Script de Backup Automático do Banco de Dados
# Uso: npm run db:backup

echo "💾 INICIANDO BACKUP DO BANCO DE DADOS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Criar diretório de backups se não existir
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Gerar nome do arquivo com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo -e "${BLUE}📁 Criando diretório de backups...${NC}"
mkdir -p backups

echo -e "${BLUE}💾 Gerando backup...${NC}"

# Executar backup do Supabase
if supabase db dump > $BACKUP_FILE 2>&1; then
    echo -e "${GREEN}✅ BACKUP GERADO COM SUCESSO!${NC}"
    echo -e "${GREEN}📄 Arquivo: $BACKUP_FILE${NC}"
    
    # Mostrar tamanho do arquivo
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}📊 Tamanho: $FILE_SIZE${NC}"
    
    # Manter apenas os últimos 10 backups
    echo -e "${BLUE}🧹 Limpando backups antigos...${NC}"
    cd $BACKUP_DIR
    ls -t *.sql | tail -n +11 | xargs -r rm -f
    
    echo -e "${GREEN}📋 Backups mantidos:${NC}"
    ls -la *.sql | tail -n 10
    
else
    echo -e "${RED}❌ ERRO AO GERAR BACKUP!${NC}"
    echo -e "${RED}Verifique se o Supabase está rodando: supabase start${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 PROCESSO DE BACKUP CONCLUÍDO!${NC}"
