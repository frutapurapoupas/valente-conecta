#!/bin/bash

# Deploy Vercel - Script de Preparação
# Executar: bash prepare-deploy.sh

echo "🚀 Preparando deploy Vercel..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale em https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# 2. Limpar cache
echo ""
echo "🧹 Limpando cache..."
rm -rf .next node_modules
npm cache clean --force
echo -e "${GREEN}✓ Cache limpo${NC}"

# 3. Instalar dependências
echo ""
echo "📥 Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# 4. Verificar tipos TypeScript
echo ""
echo "🔍 Verificando tipos TypeScript..."
npx tsc --noEmit --skipLibCheck
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Avisos TypeScript encontrados${NC}"
fi

# 5. Build
echo ""
echo "🔨 Fazendo build..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build concluído com sucesso${NC}"

# 6. Verificar arquivos de build
echo ""
echo "📂 Verificando arquivos de build..."
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Diretório .next não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Arquivos de build gerados${NC}"

# 7. Verificar variáveis de ambiente
echo ""
echo "🔐 Verificando variáveis de ambiente..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local não encontrado${NC}"
    echo "   Copie .env.example para .env.local e preencha as variáveis"
else
    echo -e "${GREEN}✓ .env.local encontrado${NC}"
fi

# 8. Listar modificações
echo ""
echo "📝 Alterações desde último commit:"
git status --short | head -10
echo ""

# 9. Resumo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Preparação completa!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Próximos passos:"
echo "1. Revisar alterações: git status"
echo "2. Fazer commit: git add . && git commit -m 'Deploy: mensagem'"
echo "3. Push para GitHub: git push origin main"
echo "4. Vercel detectará e iniciará deploy automático"
echo ""
echo "Dashboard Vercel: https://vercel.com/dashboard"
echo "Docs: https://vercel.com/docs"
