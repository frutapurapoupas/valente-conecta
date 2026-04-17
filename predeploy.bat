@echo off
echo 🔍 Iniciando checklist de pré-deploy...

echo 📦 Instalando dependências...
call npm install
IF %ERRORLEVEL% NEQ 0 (
  echo ❌ Erro ao instalar dependências
  exit /b 1
)

echo 🧹 Verificando lint...
call npm run lint
IF %ERRORLEVEL% NEQ 0 (
  echo ❌ Erros de lint encontrados
  exit /b 1
)

echo 🏗 Testando build...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
  echo ❌ Build falhou — corrija antes do deploy
  exit /b 1
)

echo 🔐 Verificando arquivos .env...
git diff --cached --name-only | findstr ".env" > nul
IF %ERRORLEVEL% EQU 0 (
  echo ❌ Arquivo .env detectado no commit!
  echo Remova com: git reset .env*
  exit /b 1
)

echo ✅ Tudo certo! Pronto para deploy 🚀