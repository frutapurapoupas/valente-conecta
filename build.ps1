# build.ps1 - Script de build para deploy
Write-Host "🚀 Iniciando build do Valente Conecta..." -ForegroundColor Cyan

# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

# Build do projeto
Write-Host "🏗️ Buildando projeto..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ BUILD CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para fazer deploy na Vercel:" -ForegroundColor Cyan
Write-Host "   1. npx vercel --prod" -ForegroundColor White
Write-Host "   2. Ou conecte o GitHub à Vercel" -ForegroundColor White
