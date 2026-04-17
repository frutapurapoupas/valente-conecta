#!/bin/bash

# Script de Reset Total do Banco Local
# Uso: npm run db:reset

echo "🔄 INICIANDO RESET TOTAL DO BANCO LOCAL..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está em ambiente local
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${RED}❌ ERRO CRÍTICO: NÃO É PERMITIDO EXECUTAR RESET EM PRODUÇÃO!${NC}"
    echo -e "${RED}Este comando DESTRÓI todos os dados do banco.${NC}"
    exit 1
fi

echo -e "${BLUE}🛑 PARANDO SUPABASE LOCAL...${NC}"
supabase stop

echo -e "${BLUE}🗑️ LIMPANDO BANCO DE DADOS...${NC}"
supabase db reset

echo -e "${BLUE}🚀 INICIANDO SUPABASE LOCAL...${NC}"
supabase start

echo -e "${BLUE}⏳ AGUARDANDO SUPABASE FICAR PRONTO...${NC}"
sleep 10

# Verificar se Supabase está rodando
if ! supabase status > /dev/null 2>&1; then
    echo -e "${RED}❌ ERRO: Supabase não conseguiu iniciar${NC}"
    exit 1
fi

echo -e "${BLUE}🌱 EXECUTANDO SEED DE DADOS...${NC}"
supabase db seed

echo -e "${GREEN}✅ RESET CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}📊 Banco local limpo e com dados iniciais${NC}"
echo -e "${GREEN}🔗 Local URL: http://localhost:54321${NC}"
echo -e "${GREEN}🔑 Studio URL: http://localhost:54323${NC}"
