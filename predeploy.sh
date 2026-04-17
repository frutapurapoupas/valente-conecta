#!/bin/bash

echo "🔍 Iniciando checklist de pré-deploy..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Erro ao instalar dependências"
  exit 1
fi

# 2. Verificar erros de lint (se tiver ESLint)
echo "🧹 Verificando lint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Erros de lint encontrados"
  exit 1
fi

# 3. Rodar build (CRÍTICO)
echo "🏗 Testando build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build falhou — corrija antes do deploy"
  exit 1
fi

# 4. Verificar arquivos sensíveis (.env)
echo "🔐 Verificando arquivos sensíveis..."
if git diff --cached --name-only | grep -E "\.env"; then
  echo "❌ Arquivo .env detectado no commit!"
  echo "Remova com: git reset .env*"
  exit 1
fi

# 5. Tudo ok
echo "✅ Tudo certo! Pronto para deploy 🚀"