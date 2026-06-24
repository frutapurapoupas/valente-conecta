# Deploy Vercel - Script de Preparação (PowerShell)
# Executar: .\prepare-deploy.ps1

Write-Host "🚀 Preparando deploy Vercel..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js não encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    exit 1
}
$nodeVersion = & node -v
Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green

# 2. Limpar cache
Write-Host ""
Write-Host "🧹 Limpando cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
& npm cache clean --force
Write-Host "✓ Cache limpo" -ForegroundColor Green

# 3. Instalar dependências
Write-Host ""
Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
& npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green

# 4. Verificar tipos TypeScript
Write-Host ""
Write-Host "🔍 Verificando tipos TypeScript..." -ForegroundColor Yellow
& npx tsc --noEmit --skipLibCheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Avisos TypeScript encontrados" -ForegroundColor Yellow
}

# 5. Build
Write-Host ""
Write-Host "🔨 Fazendo build..." -ForegroundColor Yellow
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build concluído com sucesso" -ForegroundColor Green

# 6. Verificar arquivos de build
Write-Host ""
Write-Host "📂 Verificando arquivos de build..." -ForegroundColor Yellow
if (-not (Test-Path ".next")) {
    Write-Host "❌ Diretório .next não encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Arquivos de build gerados" -ForegroundColor Green

# 7. Verificar variáveis de ambiente
Write-Host ""
Write-Host "🔐 Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local não encontrado" -ForegroundColor Yellow
    Write-Host "   Copie .env.example para .env.local e preencha as variáveis" -ForegroundColor Cyan
} else {
    Write-Host "✓ .env.local encontrado" -ForegroundColor Green
}

# 8. Listar modificações
Write-Host ""
Write-Host "📝 Alterações desde último commit:" -ForegroundColor Yellow
& git status --short | Select-Object -First 10

# 9. Resumo
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Preparação completa!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Revisar alterações: git status"
Write-Host "2. Fazer commit: git add . && git commit -m 'Deploy: mensagem'"
Write-Host "3. Push para GitHub: git push origin main"
Write-Host "4. Vercel detectará e iniciará deploy automático"
Write-Host ""
Write-Host "Dashboard Vercel: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "Docs: https://vercel.com/docs" -ForegroundColor Cyan
