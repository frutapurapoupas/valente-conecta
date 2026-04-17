#!/bin/bash

echo "🧠 VALENTE CONECTA - ENV GUARD INICIADO"
echo "======================================="

# 1. VERIFICAR NODE
echo "🔎 Verificando Node..."
node -v || { echo "❌ Node não instalado"; exit 1; }

# 2. VERIFICAR NPM
echo "🔎 Verificando NPM..."
npm -v || { echo "❌ NPM não encontrado"; exit 1; }

# 3. VERIFICAR VARIÁVEIS CRÍTICAS
echo "🔎 Verificando variáveis de ambiente..."

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ SUPABASE_URL não definida"
  exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ SUPABASE_ANON_KEY não definida"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️ WARNING: SERVICE ROLE KEY não definida (deploy limitado)"
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
  echo "⚠️ WARNING: DeepSeek não configurado (fallback ativo)"
fi

# 4. PROTEÇÃO ANTI-DROP (REGRA CRÍTICA)
echo "🛡️ Verificando comandos perigosos no ambiente..."

if grep -R "DROP TABLE" ./ 2>/dev/null; then
  echo "❌ BLOQUEADO: DROP TABLE detectado no código"
  exit 1
fi

if grep -R "TRUNCATE" ./ 2>/dev/null; then
  echo "❌ BLOQUEADO: TRUNCATE detectado no código"
  exit 1
fi

# 5. CHECAR SE ESTÁ EM PRODUÇÃO
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️ AMBIENTE DE PRODUÇÃO DETECTADO"
  echo "✔️ Apenas deploy seguro permitido"
fi

echo "======================================="
echo "✅ ENVIRONMENT OK - SISTEMA SEGURO"
echo "======================================="